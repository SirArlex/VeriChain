import { Schema, model, Document } from 'mongoose';
import { RiskLevel, VerificationStatus, AgentName, AgentStatus } from '../types';

interface IAgentFinding {
  agentName: AgentName;
  status: AgentStatus;
  riskLevel: RiskLevel;
  score: number;
  flags: string[];
  explanation: string;
  rawOutput: Record<string, unknown>;
  executionTimeMs: number;
  completedAt: Date;
}

export interface IVerification extends Document {
  verificationId: string;
  documentId: string;
  documentHash: string;
  status: VerificationStatus;
  overallRiskScore: number;
  overallRiskLevel: RiskLevel;
  agentFindings: IAgentFinding[];
  fraudFlags: string[];
  complianceFlags: string[];
  aiExplanation: string;
  tokenizationReady: boolean;
  onChainTxHash?: string;
  onChainTimestamp?: Date;
  requestedByAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgentFindingSchema = new Schema<IAgentFinding>(
  {
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
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    score: { type: Number, default: 0 },
    flags: [{ type: String }],
    explanation: { type: String, default: '' },
    rawOutput: { type: Schema.Types.Mixed, default: {} },
    executionTimeMs: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { _id: false }
);

const VerificationSchema = new Schema<IVerification>(
  {
    verificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    documentId: {
      type: String,
      required: true,
      index: true,
    },
    documentHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    overallRiskScore: { type: Number, default: 0 },
    overallRiskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    agentFindings: [AgentFindingSchema],
    fraudFlags: [{ type: String }],
    complianceFlags: [{ type: String }],
    aiExplanation: { type: String, default: '' },
    tokenizationReady: { type: Boolean, default: false },
    onChainTxHash: { type: String },
    onChainTimestamp: { type: Date },
    requestedByAddress: { type: String, lowercase: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Verification = model<IVerification>('Verification', VerificationSchema);
