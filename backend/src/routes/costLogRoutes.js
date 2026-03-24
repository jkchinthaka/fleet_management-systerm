import { Router } from 'express';
import { costLogController } from '../controllers/costLogController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { costLogSchema, approvalSchema } from '../utils/schemas.js';
import { enforceDriverCostScope } from '../middleware/rowLevelScope.js';

const router = Router();

router.use(authenticate);

router.get('/',     authorizeModuleAccess('costLog', 'read'),    enforceDriverCostScope, costLogController.list);
router.get('/:id',  authorizeModuleAccess('costLog', 'read'),    costLogController.getById);
router.post('/',    authorizeModuleAccess('costLog', 'write'),   validate(costLogSchema), costLogController.create);
router.put('/:id',  authorizeModuleAccess('costLog', 'write'),   validate(costLogSchema.partial()), costLogController.update);
router.patch('/:id/approve', authorizeModuleAccess('costLog', 'approve'), validate(approvalSchema), costLogController.approve);
router.delete('/:id', authorizeModuleAccess('costLog', 'write'), costLogController.remove);

export default router;
