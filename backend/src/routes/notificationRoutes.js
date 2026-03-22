import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { notificationSchema } from '../utils/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', authorizeModuleAccess('notifications', 'read'), notificationController.list);
router.post('/', authorizeModuleAccess('notifications', 'write'), validate(notificationSchema), notificationController.create);
router.put('/:id', authorizeModuleAccess('notifications', 'write'), validate(notificationSchema.partial()), notificationController.update);
router.delete('/:id', authorizeModuleAccess('notifications', 'write'), notificationController.remove);
router.get('/thresholds', authorizeModuleAccess('notifications', 'read'), notificationController.listThresholds);
router.post('/run-engine', authorizeModuleAccess('notifications', 'write'), notificationController.runEngine);
router.patch('/:id/read', authorizeModuleAccess('notifications', 'read'), notificationController.markRead);

export default router;
