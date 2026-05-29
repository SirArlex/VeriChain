import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller';

const router = Router();

router.post('/start', VerificationController.start);
router.get('/', VerificationController.list);
router.get('/document/:documentId', VerificationController.getByDocument);
router.patch('/:verificationId/onchain', VerificationController.updateOnChain);
router.get('/:verificationId', VerificationController.getById);

export default router;
