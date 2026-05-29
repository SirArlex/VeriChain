import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

/**
 * POST /api/documents/upload
 * Accepts: multipart/form-data with field "document"
 * Body fields: documentType (optional)
 * Returns: documentId, documentHash, extractedText
 */
router.post(
  '/upload',
  uploadMiddleware.single('document'),
  DocumentController.upload
);

/**
 * GET /api/documents
 * Returns paginated list of all documents
 * Query: ?page=1&limit=10
 */
router.get('/', DocumentController.list);

/**
 * GET /api/documents/:documentId
 * Returns full document record including extracted text
 */
router.get('/:documentId', DocumentController.getById);

export default router;
