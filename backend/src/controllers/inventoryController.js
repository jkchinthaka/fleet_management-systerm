import { asyncHandler } from '../utils/asyncHandler.js';
import { inventoryService } from '../services/inventoryService.js';

export const inventoryController = {
  listProducts: asyncHandler(async (_req, res) => {
    const data = await inventoryService.listProducts();
    res.status(200).json({ success: true, data });
  }),
  createProduct: asyncHandler(async (req, res) => {
    const data = await inventoryService.createProduct(req.body);
    res.status(201).json({ success: true, data });
  }),
  updateProduct: asyncHandler(async (req, res) => {
    await inventoryService.updateProduct(Number(req.params.id), req.body);
    res.status(200).json({ success: true, message: 'Product updated' });
  }),
  deleteProduct: asyncHandler(async (req, res) => {
    await inventoryService.deleteProduct(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Product deleted' });
  }),

  listSuppliers: asyncHandler(async (_req, res) => {
    const data = await inventoryService.listSuppliers();
    res.status(200).json({ success: true, data });
  }),
  createSupplier: asyncHandler(async (req, res) => {
    const data = await inventoryService.createSupplier(req.body);
    res.status(201).json({ success: true, data });
  }),
  updateSupplier: asyncHandler(async (req, res) => {
    const data = await inventoryService.updateSupplier(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),
  deleteSupplier: asyncHandler(async (req, res) => {
    await inventoryService.deleteSupplier(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Supplier deleted' });
  }),

  listPurchaseOrders: asyncHandler(async (_req, res) => {
    const data = await inventoryService.listPurchaseOrders();
    res.status(200).json({ success: true, data });
  }),
  createPurchaseOrder: asyncHandler(async (req, res) => {
    const data = await inventoryService.createPurchaseOrder(req.body);
    res.status(201).json({ success: true, data });
  }),
  transitionPurchaseOrderStatus: asyncHandler(async (req, res) => {
    const data = await inventoryService.transitionPurchaseOrderStatus(Number(req.params.id), req.body.status, {
      userId: req.user.sub,
      roleId: req.user.roleId
    });
    res.status(200).json({ success: true, data });
  }),

  listStockMovements: asyncHandler(async (_req, res) => {
    const data = await inventoryService.listStockMovements();
    res.status(200).json({ success: true, data });
  }),

  listGrns: asyncHandler(async (_req, res) => {
    const data = await inventoryService.listGrns();
    res.status(200).json({ success: true, data });
  }),
  createGrn: asyncHandler(async (req, res) => {
    const data = await inventoryService.createGrn(req.body, {
      userId: req.user.sub,
      roleId: req.user.roleId
    });
    res.status(201).json({ success: true, data });
  }),

  reorderRecommendations: asyncHandler(async (_req, res) => {
    const data = await inventoryService.reorderRecommendations();
    res.status(200).json({ success: true, data });
  }),

  supplierPerformance: asyncHandler(async (_req, res) => {
    const data = await inventoryService.supplierPerformance();
    res.status(200).json({ success: true, data });
  })
};
