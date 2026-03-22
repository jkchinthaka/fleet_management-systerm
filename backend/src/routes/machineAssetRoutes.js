import { Router } from 'express';
import { machineAssetController } from '../controllers/machineAssetController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  machineSchema,
  machineServiceHistorySchema,
  machineMaintenanceScheduleSchema,
  assetSchema
} from '../utils/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/machines', authorizeModuleAccess('machineAsset', 'read'), machineAssetController.listMachines);
router.post('/machines', authorizeModuleAccess('machineAsset', 'write'), validate(machineSchema), machineAssetController.createMachine);
router.put('/machines/:id', authorizeModuleAccess('machineAsset', 'write'), validate(machineSchema.partial()), machineAssetController.updateMachine);
router.delete('/machines/:id', authorizeModuleAccess('machineAsset', 'write'), machineAssetController.deleteMachine);

router.get('/machine-service-history', authorizeModuleAccess('machineAsset', 'read'), machineAssetController.listMachineServiceHistory);
router.post('/machine-service-history', authorizeModuleAccess('machineAsset', 'write'), validate(machineServiceHistorySchema), machineAssetController.createMachineServiceHistory);
router.put('/machine-service-history/:id', authorizeModuleAccess('machineAsset', 'write'), validate(machineServiceHistorySchema.partial()), machineAssetController.updateMachineServiceHistory);
router.delete('/machine-service-history/:id', authorizeModuleAccess('machineAsset', 'write'), machineAssetController.deleteMachineServiceHistory);

router.get('/maintenance-schedules', authorizeModuleAccess('machineAsset', 'read'), machineAssetController.listMaintenanceSchedules);
router.post('/maintenance-schedules', authorizeModuleAccess('machineAsset', 'write'), validate(machineMaintenanceScheduleSchema), machineAssetController.createMaintenanceSchedule);
router.put('/maintenance-schedules/:id', authorizeModuleAccess('machineAsset', 'write'), validate(machineMaintenanceScheduleSchema.partial()), machineAssetController.updateMaintenanceSchedule);
router.delete('/maintenance-schedules/:id', authorizeModuleAccess('machineAsset', 'write'), machineAssetController.deleteMaintenanceSchedule);

router.get('/assets', authorizeModuleAccess('machineAsset', 'read'), machineAssetController.listAssets);
router.post('/assets', authorizeModuleAccess('machineAsset', 'write'), validate(assetSchema), machineAssetController.createAsset);
router.put('/assets/:id', authorizeModuleAccess('machineAsset', 'write'), validate(assetSchema.partial()), machineAssetController.updateAsset);
router.delete('/assets/:id', authorizeModuleAccess('machineAsset', 'write'), machineAssetController.deleteAsset);

export default router;
