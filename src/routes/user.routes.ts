import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  listUsersQuerySchema,
  updateRoleSchema,
  updateStatusSchema,
  userIdParamSchema,
} from '../validators/user.validator';

const router: Router = Router();

// All user management routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/', validate(listUsersQuerySchema, 'query'), UserController.list);
router.get('/:id', validate(userIdParamSchema, 'params'), UserController.getById);
router.patch(
  '/:id/role',
  validate(userIdParamSchema, 'params'),
  validate(updateRoleSchema),
  UserController.updateRole,
);
router.patch(
  '/:id/status',
  validate(userIdParamSchema, 'params'),
  validate(updateStatusSchema),
  UserController.updateStatus,
);
router.delete('/:id', validate(userIdParamSchema, 'params'), UserController.delete);

export default router;
