import { Router } from 'express';
import {
  getPayments,
  createPayment,
  getOverduePayments,
  markPaid,
  downloadReceiptPDF,
} from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@insurecore/shared';

const router = Router();

router.use(authenticate);

router.get('/', getPayments);
router.get('/overdue', authorize([Role.ADMIN, Role.AGENT]), getOverduePayments);
router.post('/', createPayment);
router.post('/:id/mark-paid', authorize([Role.ADMIN, Role.AGENT]), markPaid);
router.get('/:id/receipt', downloadReceiptPDF);

export default router;
