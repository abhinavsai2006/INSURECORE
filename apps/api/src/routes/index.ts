import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import customerRoutes from './customer.routes';
import policyRoutes from './policy.routes';
import claimRoutes from './claim.routes';
import paymentRoutes from './payment.routes';
import documentRoutes from './document.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import auditRoutes from './audit.routes';
import quoteRoutes from './quote.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/policies', policyRoutes);
router.use('/claims', claimRoutes);
router.use('/payments', paymentRoutes);
router.use('/documents', documentRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/quotes', quoteRoutes);

export default router;
