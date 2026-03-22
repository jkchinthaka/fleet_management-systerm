import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { enforceDriverAttendanceScope } from '../middleware/rowLevelScope.js';
import { validate } from '../middleware/validate.js';
import { attendanceSchema } from '../utils/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', authorizeModuleAccess('attendance', 'read'), enforceDriverAttendanceScope, attendanceController.list);
router.get('/monthly-summary', authorizeModuleAccess('attendance', 'read'), enforceDriverAttendanceScope, attendanceController.monthlySummary);
router.post('/', authorizeModuleAccess('attendance', 'write'), enforceDriverAttendanceScope, validate(attendanceSchema), attendanceController.mark);
router.put('/:id', authorizeModuleAccess('attendance', 'write'), enforceDriverAttendanceScope, validate(attendanceSchema.partial()), attendanceController.update);
router.delete('/:id', authorizeModuleAccess('attendance', 'write'), attendanceController.remove);

export default router;
