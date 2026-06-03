import { Schema, model, Document } from 'mongoose';
import { AgentName, AgentStatus } from '../types';

export interface IAgentLog extends Document {
  verificationId: string;
  documentId: string;
  agentName: AgentName;
  status: AgentStatus;
  inputSummary: string;
  outputSummary: string;
  error?: string;
  executionTimeMs: number;
  createdAt: Date;
}

const AgentLogSchema = new Schema<IAgentLog>(
  {
    verificationId: {
      type: String,
      required: true,
      index: true,
    },
    documentId: {
      type: String,
      required: true,
      index: true,
    },
    agentName: {
      type: String,
      enum: ['METADATA', 'OWNERSHIP', 'COMPLIANCE', 'FRAUD_DETECTION', 'RISK_SCORING'],
      required: true,
    },
    status: {
      type: String,
      enum: ['IDLE', 'RUNNING', 'COMPLETED', 'FAILED'],
      default: 'IDLE',
    },
    inputSummary: { type: String, default: '' },
    outputSummary: { type: String, default: '' },
    error: { type: String },
    executionTimeMs: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const AgentLog = model<IAgentLog>('AgentLog', AgentLogSchema);
