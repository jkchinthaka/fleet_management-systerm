import { Router } from 'express';
import { fuelStationController } from '../controllers/fuelStationController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { fuelStationSchema } from '../utils/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/',     authorizeModuleAccess('fuelStation', 'read'),  fuelStationController.list);
router.post('/',    authorizeModuleAccess('fuelStation', 'write'), validate(fuelStationSchema), fuelStationController.create);
router.put('/:id',  authorizeModuleAccess('fuelStation', 'write'), validate(fuelStationSchema.partial()), fuelStationController.update);
router.delete('/:id', authorizeModuleAccess('fuelStation', 'write'), fuelStationController.remove);

export default router;
