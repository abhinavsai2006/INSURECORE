import { Router } from 'express';
import {
  getClaims,
  createClaim,
  getClaimById,
  updateClaimStatus,
  getClaimTimeline,
} from '../controllers/claim.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types/shared';

const router = Router();

router.use(authenticate);

router.get('/', getClaims);
router.post('/', createClaim);
router.get('/:id', getClaimById);
router.patch('/:id/status', authorize([Role.ADMIN, Role.AGENT]), updateClaimStatus);
router.get('/:id/timeline', getClaimTimeline);

export default router;
