// ===========================================
// VERICHAIN SHARED TYPES
// ===========================================
// These types are used by both client and server
// to ensure type consistency across the monorepo.

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type VerificationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type DocumentType = 'REAL_ESTATE' | 'TITLE_DEED' | 'PROPERTY_APPRAISAL' | 'LEASE_AGREEMENT' | 'MORTGAGE' | 'OTHER';
export type AgentName = 'METADATA' | 'OWNERSHIP' | 'COMPLIANCE' | 'FRAUD_DETECTION' | 'RISK_SCORING';
export type AgentStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface AgentFinding {
  agentName: AgentName;
  status: AgentStatus;
  riskLevel: RiskLevel;
  score: number; // 0-100, higher = riskier
  flags: string[];
  explanation: string;
  rawOutput: Record<string, unknown>;
  executionTimeMs: number;
  completedAt: string; // ISO timestamp
}

export interface VerificationResult {
  verificationId: string;
  documentId: string;
  documentHash: string;
  status: VerificationStatus;
  overallRiskScore: number; // 0-100
  overallRiskLevel: RiskLevel;
  agentFindings: AgentFinding[];
  fraudFlags: string[];
  complianceFlags: string[];
  aiExplanation: string;
  tokenizationReady: boolean;
  onChainTxHash?: string;
  onChainTimestamp?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  uploadedAt: string;
  extractedText?: string;
  pageCount?: number;
}

export interface UploadResponse {
  documentId: string;
  documentHash: string;
  message: string;
  metadata: DocumentMetadata;
}

export interface VerificationRequest {
  documentId: string;
  documentType: DocumentType;
  userAddress?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AgentReputationScore {
  agentName: AgentName;
  totalVerifications: number;
  averageAccuracy: number;
  averageExecutionTimeMs: number;
  flagsRaisedTotal: number;
  lastUpdated: string;
}

// On-chain proof structure
export interface OnChainProof {
  documentHash: string;
  riskScore: number;
  verificationStatus: number; // 0=PENDING, 1=COMPLETED, 2=FAILED
  timestamp: number;
  agentOutputsHash: string;
  verificationId: string;
}
