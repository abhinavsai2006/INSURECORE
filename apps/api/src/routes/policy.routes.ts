import { Router } from 'express';
import {
  getPolicies,
  createPolicy,
  getPolicyById,
  renewPolicy,
  cancelPolicy,
  getExpiringPolicies,
  downloadPolicyPDF,
  downloadTaxCertificatePDF,
  downloadHealthCardPDF,
} from '../controllers/policy.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types/shared';

const router = Router();

router.use(authenticate);

router.get('/', getPolicies);
router.get('/expiring-soon', authorize([Role.ADMIN, Role.AGENT]), getExpiringPolicies);
router.post('/', authorize([Role.ADMIN, Role.AGENT]), createPolicy);
router.get('/:id', getPolicyById);
router.post('/:id/renew', authorize([Role.ADMIN, Role.AGENT]), renewPolicy);
router.post('/:id/cancel', authorize([Role.ADMIN, Role.AGENT]), cancelPolicy);
router.get('/:id/pdf', downloadPolicyPDF);
router.get('/:id/tax-certificate', downloadTaxCertificatePDF);
router.get('/:id/health-card', downloadHealthCardPDF);

export default router;
