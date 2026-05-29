import { apiClient } from './api';
import { AgentReputationScore, SystemStats } from '../types/reputation';

export const AgentService = {
  async getReputation(): Promise<AgentReputationScore[]> {
    const res = await apiClient.get<{ success: boolean; data: AgentReputationScore[] }>(
      '/api/agents/reputation'
    );
    return res.data.data;
  },

  async getStats(): Promise<SystemStats> {
    const res = await apiClient.get<{ success: boolean; data: SystemStats }>(
      '/api/agents/stats'
    );
    return res.data.data;
  },
};
