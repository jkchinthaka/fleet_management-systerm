import { Router } from 'express';
import { fuelController } from '../controllers/fuelController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { fuelLogSchema } from '../utils/schemas.js';
import { enforceDriverFuelScope } from '../middleware/rowLevelScope.js';

const router = Router();

router.use(authenticate);
router.get('/', authorizeModuleAccess('fuel', 'read'), enforceDriverFuelScope, fuelController.list);
router.post('/', authorizeModuleAccess('fuel', 'write'), validate(fuelLogSchema), fuelController.create);
router.put('/:id', authorizeModuleAccess('fuel', 'write'), validate(fuelLogSchema.partial()), fuelController.update);
router.delete('/:id', authorizeModuleAccess('fuel', 'write'), fuelController.remove);

export default router;
