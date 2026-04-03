import { Router } from 'express';
import { RecordController } from '../controllers/record.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createRecordSchema,
  listRecordsQuerySchema,
  recordIdParamSchema,
  updateRecordSchema,
} from '../validators/record.validator';

const router: Router = Router();

// All record routes require authentication
router.use(authenticate);

// Read access — all authenticated roles (VIEWER, ANALYST, ADMIN)
router.get('/', validate(listRecordsQuerySchema, 'query'), RecordController.list);
router.get('/:id', validate(recordIdParamSchema, 'params'), RecordController.getById);

// Write access — ADMIN only
router.post('/', authorize('ADMIN'), validate(createRecordSchema), RecordController.create);
router.patch(
  '/:id',
  authorize('ADMIN'),
  validate(recordIdParamSchema, 'params'),
  validate(updateRecordSchema),
  RecordController.update,
);
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(recordIdParamSchema, 'params'),
  RecordController.delete,
);

export default router;
