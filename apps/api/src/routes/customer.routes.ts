import { Router } from 'express';
import {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  getCustomerHistory,
} from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types/shared';

const router = Router();

router.use(authenticate);

router.get('/', getCustomers);
router.post('/', authorize([Role.ADMIN, Role.AGENT]), createCustomer);
router.get('/:id', getCustomerById);
router.patch('/:id', updateCustomer);
router.get('/:id/history', getCustomerHistory);

export default router;
