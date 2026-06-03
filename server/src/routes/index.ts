import { Router } from 'express';
import healthRouter from './health';
import documentRouter from './document.routes';
import verificationRouter from './verification.routes';
import agentRouter from './agent.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/documents', documentRouter);
router.use('/verifications', verificationRouter);
router.use('/agents', agentRouter);

export default router;
