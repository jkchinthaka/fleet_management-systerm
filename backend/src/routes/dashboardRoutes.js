import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticate, authorizeModuleAccess } from '../middleware/auth.js';

const router = Router();

router.get('/summary', authenticate, authorizeModuleAccess('dashboard', 'read'), dashboardController.summary);

export default router;
