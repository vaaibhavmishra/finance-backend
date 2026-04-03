import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { dashboardQuerySchema, trendQuerySchema } from '../validators/dashboard.validator';

const router: Router = Router();

// Dashboard routes require ANALYST or ADMIN role
router.use(authenticate, authorize('ANALYST', 'ADMIN'));

router.get('/summary', validate(dashboardQuerySchema, 'query'), DashboardController.summary);
router.get(
  '/category-breakdown',
  validate(dashboardQuerySchema, 'query'),
  DashboardController.categoryBreakdown,
);
router.get('/trends', validate(trendQuerySchema, 'query'), DashboardController.trends);
router.get('/recent-activity', DashboardController.recentActivity);

export default router;
