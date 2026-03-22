import { Router } from 'express';
import { vehicleController } from '../controllers/vehicleController.js';
import { vehicleDocumentController } from '../controllers/vehicleDocumentController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { vehicleSchema } from '../utils/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', authorizeModuleAccess('vehicle', 'read'), vehicleController.list);
router.get('/:id', authorizeModuleAccess('vehicle', 'read'), vehicleController.getById);
router.post('/', authorizeModuleAccess('vehicle', 'write'), validate(vehicleSchema), vehicleController.create);
router.put('/:id', authorizeModuleAccess('vehicle', 'write'), validate(vehicleSchema.partial()), vehicleController.update);
router.delete('/:id', authorizeModuleAccess('vehicle', 'write'), vehicleController.remove);

// Vehicle documents
router.get('/:vehicleId/documents', authorizeModuleAccess('vehicle', 'read'), vehicleDocumentController.list);
router.post('/:vehicleId/documents', authorizeModuleAccess('vehicle', 'write'), vehicleDocumentController.create);
router.get('/documents/:id', authorizeModuleAccess('vehicle', 'read'), vehicleDocumentController.getById);
router.put('/documents/:id', authorizeModuleAccess('vehicle', 'write'), vehicleDocumentController.update);
router.delete('/documents/:id', authorizeModuleAccess('vehicle', 'write'), vehicleDocumentController.remove);

export default router;
