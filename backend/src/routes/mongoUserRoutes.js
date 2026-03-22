import { Router } from 'express';
import { mongoUserController } from '../controllers/mongoUserController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mongoRegisterSchema } from '../utils/schemas.js';

const router = Router();

router.use(authenticate, authorize(1));
router.get('/', mongoUserController.list);
router.post('/', validate(mongoRegisterSchema), mongoUserController.create);

export default router;
