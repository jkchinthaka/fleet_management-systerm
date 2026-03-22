import { Router } from 'express';
import { mongoAuthController } from '../controllers/mongoAuthController.js';
import { validate } from '../middleware/validate.js';
import { authenticateJwt, authorizeRoles } from '../middleware/mongoAuth.js';
import { mongoLoginSchema } from '../utils/schemas.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', authRateLimiter, validate(mongoLoginSchema), mongoAuthController.login);

// Sample protected routes
router.get('/me', authenticateJwt, mongoAuthController.me);
router.get('/admin-only', authenticateJwt, authorizeRoles(1), mongoAuthController.adminOnly);

export default router;
