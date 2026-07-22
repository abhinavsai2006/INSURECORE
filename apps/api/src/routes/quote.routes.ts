import { Router } from 'express';
import { createQuote, getQuoteById } from '../controllers/quote.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createQuote);
router.get('/:id', getQuoteById);

export default router;
