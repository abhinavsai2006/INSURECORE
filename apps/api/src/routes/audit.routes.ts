import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@insurecore/shared';

const router = Router();

router.use(authenticate, authorize([Role.ADMIN]));

router.get('/', getAuditLogs);

export default router;
