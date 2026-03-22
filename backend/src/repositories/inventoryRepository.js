import {
  Supplier, Product, PurchaseOrder, PurchaseOrderItem,
  StockMovement, Grn, GrnItem
} from '../models/index.js';
import mongoose from 'mongoose';
import { getNextSequence } from '../utils/autoIncrement.js';

export const inventoryRepository = {
  listSuppliers() {
    return Supplier.find().sort({ id: -1 }).lean();
  },
  findSupplierById(id) {
    return Supplier.findOne({ id: Number(id) }).lean();
  },
  createSupplier(payload) {
    return new Supplier(payload).save();
  },
  updateSupplier(id, payload) {
    return Supplier.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },
  deleteSupplier(id) {
    return Supplier.findOneAndDelete({ id: Number(id) });
  },

  listProducts() {
    return Product.find().sort({ id: -1 }).lean();
  },
  findProductById(id) {
    return Product.findOne({ id: Number(id) }).lean();
  },
  createProduct(payload) {
    return new Product(payload).save();
  },
  updateProduct(id, payload) {
    return Product.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },
  deleteProduct(id) {
    return Product.findOneAndDelete({ id: Number(id) });
  },

  async listPurchaseOrders() {
    const orders = await PurchaseOrder.find().sort({ id: -1 }).lean();
    for (const order of orders) {
      order.supplier = await Supplier.findOne({ id: order.supplier_id }).lean();
      order.items = await PurchaseOrderItem.find({ purchase_order_id: order.id }).lean();
      for (const item of order.items) {
        item.product = await Product.findOne({ id: item.product_id }).lean();
      }
    }
    return orders;
  },

  async findPurchaseOrderById(id) {
    const order = await PurchaseOrder.findOne({ id: Number(id) }).lean();
    if (!order) return null;
    order.supplier = await Supplier.findOne({ id: order.supplier_id }).lean();
    order.items = await PurchaseOrderItem.find({ purchase_order_id: order.id }).lean();
    for (const item of order.items) {
      item.product = await Product.findOne({ id: item.product_id }).lean();
    }
    return order;
  },

  async createPurchaseOrder(payload) {
    const session = await mongoose.connection.startSession();
    return session.withTransaction(async () => {
      const po = await new PurchaseOrder({
        supplier_id: payload.supplier_id,
        order_date: payload.order_date,
        expected_date: payload.expected_date,
        status: payload.status || 'Pending',
        total_amount: payload.total_amount || 0
      }).save({ session });

      const items = await Promise.all(
        (payload.items || []).map(async (item) => {
          const seq = await getNextSequence('purchase_order_items');
          return new PurchaseOrderItem({
            id: seq,
            purchase_order_id: po.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            line_total: item.quantity * item.unit_price
          }).save({ session });
        })
      );

      const movements = await Promise.all(
        (payload.items || []).map(async (item) => {
          const seq = await getNextSequence('stock_movements');
          return new StockMovement({
            id: seq,
            product_id: item.product_id,
            movement_type: 'ORDER',
            quantity: item.quantity,
            movement_date: payload.order_date,
            reference_type: 'PO',
            reference_id: po.id,
            notes: 'Purchase order created'
          }).save({ session });
        })
      );

      return { ...po.toObject(), items, movements };
    }).finally(() => session.endSession());
  },

  updatePurchaseOrderStatus(id, status) {
    return PurchaseOrder.findOneAndUpdate({ id: Number(id) }, { status }, { new: true });
  },

  listStockMovements() {
    return StockMovement.find().sort({ id: -1 }).lean();
  },

  async createGrn(payload) {
    const session = await mongoose.connection.startSession();
    return session.withTransaction(async () => {
      const po = await PurchaseOrder.findOne({ id: payload.purchase_order_id }).lean();
      if (!po) throw new Error('Purchase order not found');

      const existingGrns = await Grn.find({ purchase_order_id: payload.purchase_order_id }).lean();
      for (const existingGrn of existingGrns) {
        existingGrn.items = await GrnItem.find({ grn_id: existingGrn.id }).lean();
      }

      for (const item of payload.items) {
        const alreadyReceived = existingGrns.flatMap((g) => g.items || [])
          .filter((x) => x.product_id === item.product_id)
          .reduce((s, x) => s + Number(x.quantity_received || 0), 0);

        const poItems = await PurchaseOrderItem.find({
          purchase_order_id: payload.purchase_order_id,
          product_id: item.product_id
        }).lean();
        const ordered = poItems.reduce((s, x) => s + Number(x.quantity || 0), 0);

        if (alreadyReceived + item.quantity_received > ordered) {
          throw new Error(`Over-receiving product ${item.product_id}`);
        }
      }

      const grn = await new Grn({
        purchase_order_id: payload.purchase_order_id,
        grn_date: payload.grn_date,
        received_by: payload.received_by
      }).save({ session });

      await Promise.all(
        payload.items.map(async (item) => {
          const seq = await getNextSequence('grn_items');
          return new GrnItem({
            id: seq,
            grn_id: grn.id,
            product_id: item.product_id,
            quantity_received: item.quantity_received
          }).save({ session });
        })
      );

      for (const item of payload.items) {
        await Product.findOneAndUpdate(
          { id: item.product_id },
          { $inc: { current_stock: item.quantity_received } },
          { session }
        );
      }

      await Promise.all(
        payload.items.map(async (item) => {
          const seq = await getNextSequence('stock_movements');
          return new StockMovement({
            id: seq,
            product_id: item.product_id,
            movement_type: 'IN',
            quantity: item.quantity_received,
            movement_date: payload.grn_date,
            reference_type: 'GRN',
            reference_id: grn.id,
            notes: 'Stock added by GRN'
          }).save({ session });
        })
      );

      const poItemQty = (await PurchaseOrderItem.find({ purchase_order_id: payload.purchase_order_id }).lean())
        .reduce((s, x) => s + Number(x.quantity || 0), 0);
      const allGrnItems = await GrnItem.find({
        grn_id: { $in: [...existingGrns.map((g) => g.id), grn.id] }
      }).lean();
      const totalReceived = allGrnItems.reduce((s, x) => s + Number(x.quantity_received || 0), 0);

      await PurchaseOrder.findOneAndUpdate(
        { id: payload.purchase_order_id },
        { status: totalReceived >= poItemQty ? 'Received' : 'Partial' },
        { session }
      );

      return grn;
    }).finally(() => session.endSession());
  },

  async listGrns() {
    const grns = await Grn.find().sort({ id: -1 }).lean();
    for (const grn of grns) {
      const items = await GrnItem.find({ grn_id: grn.id }).lean();
      for (const item of items) {
        item.product = await Product.findOne({ id: item.product_id }).lean();
      }
      grn.items = items;
    }
    return grns;
  },

  listReorderRecommendations() {
    return Product.aggregate([
      { $match: { $expr: { $lte: ['$current_stock', '$reorder_level'] } } },
      { $sort: { current_stock: 1 } }
    ]);
  },

  async supplierPerformance() {
    const suppliers = await Supplier.find().lean();
    const result = [];
    for (const s of suppliers) {
      const pos = await PurchaseOrder.find({ supplier_id: s.id }).lean();
      const totalPOs = pos.length;
      let avgLeadTimeDays = null;
      let fillRatePercent = null;

      if (totalPOs > 0) {
        let leadSum = 0; let leadCount = 0;
        let fillNum = 0; let fillDen = 0;
        for (const po of pos) {
          const grn = await Grn.findOne({ purchase_order_id: po.id }).sort({ grn_date: 1 }).lean();
          if (po.order_date && grn?.grn_date) {
            leadSum += Math.round((new Date(grn.grn_date) - new Date(po.order_date)) / 86400000);
            leadCount++;
          }
          const poItems = await PurchaseOrderItem.find({ purchase_order_id: po.id }).lean();
          const grnItems = await GrnItem.find({
            grn_id: { $in: (await Grn.find({ purchase_order_id: po.id }).lean()).map((g) => g.id) }
          }).lean();
          for (const poi of poItems) {
            fillDen += poi.quantity;
            fillNum += grnItems.filter((g) => g.product_id === poi.product_id)
              .reduce((s, x) => s + x.quantity_received, 0);
          }
        }
        if (leadCount > 0) avgLeadTimeDays = Math.round(leadSum / leadCount);
        if (fillDen > 0) fillRatePercent = Math.round((fillNum / fillDen) * 100);
      }

      result.push({
        supplierId: s.id,
        supplierName: s.supplier_name,
        totalPOs,
        avgLeadTimeDays,
        fillRatePercent
      });
    }
    return result.sort((a, b) => b.totalPOs - a.totalPOs);
  }
};
