import { Router } from 'express';
import { reminderController } from '../controllers/reminderController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reminderSchema } from '../utils/schemas.js';
import { enforceDriverReminderScope } from '../middleware/rowLevelScope.js';

const router = Router();

router.use(authenticate);

router.get('/',          authorizeModuleAccess('reminder', 'read'),  enforceDriverReminderScope, reminderController.list);
router.get('/upcoming',  authorizeModuleAccess('reminder', 'read'),  reminderController.upcoming);
router.get('/:id',       authorizeModuleAccess('reminder', 'read'),  reminderController.getById);
router.post('/',         authorizeModuleAccess('reminder', 'write'), validate(reminderSchema), reminderController.create);
router.put('/:id',       authorizeModuleAccess('reminder', 'write'), validate(reminderSchema.partial()), reminderController.update);
router.patch('/:id/complete', authorizeModuleAccess('reminder', 'write'), reminderController.complete);
router.delete('/:id',   authorizeModuleAccess('reminder', 'write'), reminderController.remove);

export default router;
