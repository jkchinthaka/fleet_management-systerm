import { Router } from 'express';
import { reportsController } from '../controllers/reportsController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reportFilterSchema } from '../utils/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/cost-analysis', authorizeModuleAccess('reports', 'read'), reportsController.costAnalysis);
router.get('/sla-trend', authorizeModuleAccess('reports', 'read'), reportsController.slaTrend);
router.get('/export/excel', authorizeModuleAccess('reports', 'read'), reportsController.exportExcel);
router.get('/export/pdf', authorizeModuleAccess('reports', 'read'), reportsController.exportPdf);
router.get('/saved-filters', authorizeModuleAccess('reports', 'read'), reportsController.listSavedFilters);
router.post('/saved-filters', authorizeModuleAccess('reports', 'read'), validate(reportFilterSchema), reportsController.saveFilter);

export default router;
