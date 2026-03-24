import { Router } from 'express';
import { refuelController } from '../controllers/refuelController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { refuelLogSchema, approvalSchema } from '../utils/schemas.js';
import { enforceDriverRefuelScope } from '../middleware/rowLevelScope.js';

const router = Router();

router.use(authenticate);

router.get('/', authorizeModuleAccess('refuel', 'read'), enforceDriverRefuelScope, refuelController.list);
router.get('/:id', authorizeModuleAccess('refuel', 'read'), refuelController.getById);
router.post('/', authorizeModuleAccess('refuel', 'write'), validate(refuelLogSchema), refuelController.create);
router.put('/:id', authorizeModuleAccess('refuel', 'write'), validate(refuelLogSchema.partial()), refuelController.update);
router.patch('/:id/approve', authorizeModuleAccess('refuel', 'approve'), validate(approvalSchema), refuelController.approve);
router.delete('/:id', authorizeModuleAccess('refuel', 'write'), refuelController.remove);

export default router;
