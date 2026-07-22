import { Router } from 'express';
import { getOverviewReport, exportExcelReport, exportPDFReport } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@insurecore/shared';

const router = Router();

router.use(authenticate, authorize([Role.ADMIN, Role.AGENT]));

router.get('/overview', getOverviewReport);
router.get('/export/excel', exportExcelReport);
router.get('/export/pdf', exportPDFReport);
router.get('/policies/export', exportPDFReport);
router.get('/customers/export', exportPDFReport);

export default router;
