// Re-export shared types for use throughout the client.
// Import from here instead of navigating to shared package directly.
export type {
  RiskLevel,
  VerificationStatus,
  DocumentType,
  AgentName,
  AgentStatus,
  AgentFinding,
  VerificationResult,
  DocumentMetadata,
  UploadResponse,
  VerificationRequest,
  ApiResponse,
  AgentReputationScore,
  OnChainProof,
} from '../../shared/src/types';
