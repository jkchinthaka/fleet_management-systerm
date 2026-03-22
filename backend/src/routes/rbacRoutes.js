import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { rbacController } from '../controllers/rbacController.js';

const router = Router();

router.use(authenticate);
// RBAC matrix is admin/fleet-manager/supervisor only (roleIds: 1=ADMIN, 2=FLEET_MANAGER, 7=SUPERVISOR_MANAGER)
router.get('/matrix', authorize(1, 2, 7), rbacController.matrix);

export default router;
