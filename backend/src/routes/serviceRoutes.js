import { Router } from 'express';
import { serviceRequestController } from '../controllers/serviceRequestController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
	serviceRequestSchema,
	serviceStatusUpdateSchema,
	serviceTaskSchema,
	serviceSparePartSchema
} from '../utils/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/requests', authorizeModuleAccess('service', 'read'), serviceRequestController.list);
router.post('/requests', authorizeModuleAccess('service', 'write'), validate(serviceRequestSchema), serviceRequestController.create);
router.put('/requests/:id', authorizeModuleAccess('service', 'write'), validate(serviceRequestSchema.partial()), serviceRequestController.update);
router.delete('/requests/:id', authorizeModuleAccess('service', 'write'), serviceRequestController.remove);
router.patch('/requests/:id/status', authorizeModuleAccess('service', 'write'), validate(serviceStatusUpdateSchema), serviceRequestController.updateStatus);
router.post('/requests/:id/approve-close', authorizeModuleAccess('service', 'approve'), serviceRequestController.approveClosure);

router.get('/sla-overview', authorizeModuleAccess('service', 'read'), serviceRequestController.slaOverview);
router.get('/tasks', authorizeModuleAccess('service', 'read'), serviceRequestController.listTasks);
router.post('/tasks', authorizeModuleAccess('service', 'write'), validate(serviceTaskSchema), serviceRequestController.addTask);
router.delete('/tasks/:id', authorizeModuleAccess('service', 'write'), serviceRequestController.removeTask);
router.post('/spare-parts', authorizeModuleAccess('service', 'write'), validate(serviceSparePartSchema), serviceRequestController.addSparePart);
router.delete('/spare-parts/:id', authorizeModuleAccess('service', 'write'), serviceRequestController.removeSparePart);

export default router;
