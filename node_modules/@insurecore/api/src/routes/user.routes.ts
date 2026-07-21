import { Router } from 'express';
import { getUsers, createUser, toggleUserActive } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@insurecore/shared';

const router = Router();

router.use(authenticate, authorize([Role.ADMIN]));

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id/toggle-active', toggleUserActive);

export default router;
