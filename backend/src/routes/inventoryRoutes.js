import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  productSchema,
  supplierSchema,
  purchaseOrderSchema,
  purchaseOrderStatusSchema,
  grnSchema
} from '../utils/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/products', authorizeModuleAccess('inventory', 'read'), inventoryController.listProducts);
router.post('/products', authorizeModuleAccess('inventory', 'write'), validate(productSchema), inventoryController.createProduct);
router.put('/products/:id', authorizeModuleAccess('inventory', 'write'), validate(productSchema.partial()), inventoryController.updateProduct);
router.delete('/products/:id', authorizeModuleAccess('inventory', 'write'), inventoryController.deleteProduct);

router.get('/suppliers', authorizeModuleAccess('inventory', 'read'), inventoryController.listSuppliers);
router.post('/suppliers', authorizeModuleAccess('inventory', 'write'), validate(supplierSchema), inventoryController.createSupplier);
router.put('/suppliers/:id', authorizeModuleAccess('inventory', 'write'), validate(supplierSchema.partial()), inventoryController.updateSupplier);
router.delete('/suppliers/:id', authorizeModuleAccess('inventory', 'write'), inventoryController.deleteSupplier);

router.get('/purchase-orders', authorizeModuleAccess('inventory', 'read'), inventoryController.listPurchaseOrders);
router.post('/purchase-orders', authorizeModuleAccess('inventory', 'write'), validate(purchaseOrderSchema), inventoryController.createPurchaseOrder);
router.patch('/purchase-orders/:id/status', authorizeModuleAccess('inventory', 'approve'), validate(purchaseOrderStatusSchema), inventoryController.transitionPurchaseOrderStatus);

router.get('/stock-movements', authorizeModuleAccess('inventory', 'read'), inventoryController.listStockMovements);

router.get('/grns', authorizeModuleAccess('inventory', 'read'), inventoryController.listGrns);
router.post('/grns', authorizeModuleAccess('inventory', 'approve'), validate(grnSchema), inventoryController.createGrn);

router.get('/reorder-recommendations', authorizeModuleAccess('inventory', 'read'), inventoryController.reorderRecommendations);
router.get('/supplier-performance', authorizeModuleAccess('inventory', 'read'), inventoryController.supplierPerformance);

export default router;
