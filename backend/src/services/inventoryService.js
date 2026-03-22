import { ApiError } from '../utils/ApiError.js';
import { inventoryRepository } from '../repositories/inventoryRepository.js';
import { auditLog } from '../utils/auditLogger.js';

const STATUS_TRANSITIONS = {
  Draft: ['Issued'],
  Issued: ['Approved', 'Closed'],
  Approved: ['Partial', 'Received', 'Closed'],
  Partial: ['Received', 'Closed'],
  Received: ['Closed'],
  Closed: []
};

export const inventoryService = {
  listProducts() {
    return inventoryRepository.listProducts();
  },
  createProduct(payload) {
    return inventoryRepository.createProduct(payload);
  },
  async updateProduct(id, payload) {
    const updated = await inventoryRepository.updateProduct(id, payload);
    if (!updated) throw new ApiError(404, 'Product not found');
    return updated;
  },
  async deleteProduct(id) {
    const count = await inventoryRepository.deleteProduct(id);
    if (!count) throw new ApiError(404, 'Product not found');
    return true;
  },

  listSuppliers() {
    return inventoryRepository.listSuppliers();
  },
  createSupplier(payload) {
    return inventoryRepository.createSupplier(payload);
  },
  async updateSupplier(id, payload) {
    const updated = await inventoryRepository.updateSupplier(id, payload);
    if (!updated) throw new ApiError(404, 'Supplier not found');
    return updated;
  },
  async deleteSupplier(id) {
    const count = await inventoryRepository.deleteSupplier(id);
    if (!count) throw new ApiError(404, 'Supplier not found');
    return true;
  },

  listPurchaseOrders() {
    return inventoryRepository.listPurchaseOrders();
  },
  createPurchaseOrder(payload) {
    return inventoryRepository.createPurchaseOrder(payload);
  },

  async transitionPurchaseOrderStatus(id, status, context) {
    const po = await inventoryRepository.findPurchaseOrderById(id);
    if (!po) throw new ApiError(404, 'Purchase order not found');

    const allowed = STATUS_TRANSITIONS[po.status] || [];
    if (!allowed.includes(status)) {
      throw new ApiError(400, `Invalid PO status transition from ${po.status} to ${status}`);
    }

    const updated = await inventoryRepository.updatePurchaseOrderStatus(id, status);
    if (!updated) throw new ApiError(500, 'Unable to update purchase order');

    auditLog('PO_STATUS_TRANSITION', {
      poId: id,
      previousStatus: po.status,
      newStatus: status,
      actorUserId: context.userId,
      actorRoleId: context.roleId
    });

    return updated;
  },

  listStockMovements() {
    return inventoryRepository.listStockMovements();
  },

  async createGrn(payload, context) {
    const row = await inventoryRepository.createGrn(payload);
    auditLog('GRN_CREATED', {
      poId: payload.purchase_order_id,
      grnId: row.id,
      actorUserId: context.userId,
      actorRoleId: context.roleId
    });
    return row;
  },
  listGrns() {
    return inventoryRepository.listGrns();
  },

  reorderRecommendations() {
    return inventoryRepository.listReorderRecommendations().then((rows) =>
      rows.map((r) => {
        const product = r.toJSON();
        const recommendedQty = Math.max(0, Number(product.reorder_level || 0) * 2 - Number(product.current_stock || 0));
        return { ...product, recommendedQty };
      })
    );
  },

  supplierPerformance() {
    return inventoryRepository.supplierPerformance();
  }
};
