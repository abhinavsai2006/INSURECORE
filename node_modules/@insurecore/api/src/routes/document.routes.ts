import { Router } from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentFile,
  deleteDocument,
} from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id/file', getDocumentFile);
router.delete('/:id', deleteDocument);

export default router;
