import { Request, Response } from 'express';
import { AgentReputationService } from '../services/agent-reputation.service';

export class AgentController {
  /**
   * GET /api/agents/reputation
   * Returns performance metrics for all 5 agents.
   */
  static async getReputation(_req: Request, res: Response): Promise<void> {
    const reputations = await AgentReputationService.getAgentReputations();
    res.json({ success: true, data: reputations });
  }

  /**
   * GET /api/agents/stats
   * Returns system-wide verification statistics.
   */
  static async getStats(_req: Request, res: Response): Promise<void> {
    const stats = await AgentReputationService.getSystemStats();
    res.json({ success: true, data: stats });
  }
}
