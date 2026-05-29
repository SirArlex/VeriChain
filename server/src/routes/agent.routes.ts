import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller';

const router = Router();

router.get('/reputation', AgentController.getReputation);
router.get('/stats', AgentController.getStats);

export default router;
