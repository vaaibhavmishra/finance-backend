import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, refreshTokenSchema, registerSchema } from '../validators/auth.validator';

const router: Router = Router();

// Public routes (with auth rate limiter)
router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', authLimiter, validate(refreshTokenSchema), AuthController.refresh);

// Protected routes
router.get('/me', authenticate, AuthController.me);

export default router;
