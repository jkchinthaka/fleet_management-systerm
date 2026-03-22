import { Router } from 'express';
import { utilityController } from '../controllers/utilityController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { electricitySchema, waterMeterSchema } from '../utils/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/water', authorizeModuleAccess('utility', 'read'), utilityController.listWater);
router.post('/water', authorizeModuleAccess('utility', 'write'), validate(waterMeterSchema), utilityController.createWater);
router.put('/water/:id', authorizeModuleAccess('utility', 'write'), validate(waterMeterSchema.partial()), utilityController.updateWater);
router.get('/electricity', authorizeModuleAccess('utility', 'read'), utilityController.listElectricity);
router.post('/electricity', authorizeModuleAccess('utility', 'write'), validate(electricitySchema), utilityController.createElectricity);
router.put('/electricity/:id', authorizeModuleAccess('utility', 'write'), validate(electricitySchema.partial()), utilityController.updateElectricity);
router.get('/comparison', authorizeModuleAccess('utility', 'read'), utilityController.comparison);

export default router;
