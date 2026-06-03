import { v4 as uuidv4 } from 'uuid';
import { DocumentModel } from '../models/Document';
import { Verification } from '../models/Verification';
import { RuleEngine } from '../rule-engine/rules.engine';
import { MetadataAgent } from '../agents/metadata.agent';
import { OwnershipAgent } from '../agents/ownership.agent';
import { ComplianceAgent } from '../agents/compliance.agent';
import { FraudDetectionAgent } from '../agents/fraud.agent';
import { RiskScoringAgent } from '../agents/risk-scoring.agent';
import { AgentContext } from '../agents/base.agent';
import { AgentFinding, VerificationResult } from '../types';
import { AppError } from '../middleware/errorHandler';

/**
 * VerificationOrchestrator — coordinates the full verification pipeline.
 *
 * Pipeline order:
 * 1. Load document from MongoDB
 * 2. Run deterministic rule engine
 * 3. Run agents 1-4 in parallel (metadata, ownership, compliance, fraud)
 * 4. Run risk scoring agent last (needs all other findings)
 * 5. Save verification record to MongoDB
 * 6. Return full result
 *
 * Why parallel for agents 1-4:
 * - They don't depend on each other
 * - Reduces total verification time significantly
 * - Each agent gets the same rule engine context
 *
 * Why risk scoring runs last:
 * - It aggregates all prior findings
 * - It generates the executive summary
 */
export class VerificationOrchestrator {
  static async run(documentId: string, requestedByAddress?: string): Promise<VerificationResult> {
    console.log(`[ORCHESTRATOR] Starting verification for document: ${documentId}`);

    // Step 1: Load document
    const document = await DocumentModel.findOne({ documentId });
    if (!document) {
      throw new AppError(404, `Document not found: ${documentId}`);
    }

    if (!document.extractedText || document.extractedText.length < 10) {
      throw new AppError(400, 'Document has insufficient extracted text for verification');
    }

    const verificationId = uuidv4();

    // Step 2: Mark verification as PROCESSING in DB
    await Verification.create({
      verificationId,
      documentId,
      documentHash: document.documentHash,
      status: 'PROCESSING',
      requestedByAddress: requestedByAddress?.toLowerCase(),
    });

    console.log(`[ORCHESTRATOR] Verification ID: ${verificationId}`);

    try {
      // Step 3: Run rule engine (deterministic, no AI)
      console.log('[ORCHESTRATOR] Running rule engine...');
      const ruleEngineOutput = RuleEngine.analyze(
        document.extractedText,
        document.fileName,
        document.fileSize
      );
      console.log(`[ORCHESTRATOR] Rule engine complete. Flags: ${ruleEngineOutput.flags.length}, Score: ${ruleEngineOutput.ruleScore}`);

      // Step 4: Build agent context
      const agentContext: AgentContext = {
        verificationId,
        documentId,
        documentHash: document.documentHash,
        extractedText: document.extractedText,
        fileName: document.fileName,
        fileSize: document.fileSize,
        ruleEngineOutput,
      };

      // Step 5: Run agents 1-4 in PARALLEL
      console.log('[ORCHESTRATOR] Running agents in parallel...');
      const [metadataFinding, ownershipFinding, complianceFinding, fraudFinding] = await Promise.all([
        new MetadataAgent().run(agentContext),
        new OwnershipAgent().run(agentContext),
        new ComplianceAgent().run(agentContext),
        new FraudDetectionAgent().run(agentContext),
      ]);

      console.log('[ORCHESTRATOR] Parallel agents complete');

      // Step 6: Run risk scoring agent last
      const riskScoringAgent = new RiskScoringAgent();
      riskScoringAgent.setPriorFindings([metadataFinding, ownershipFinding, complianceFinding, fraudFinding]);
      const riskFinding = await riskScoringAgent.run(agentContext);

      const allFindings: AgentFinding[] = [
        metadataFinding,
        ownershipFinding,
        complianceFinding,
        fraudFinding,
        riskFinding,
      ];

      // Step 7: Extract final values from risk scoring agent
      const finalScore = riskFinding.score;
      const finalRiskLevel = riskFinding.riskLevel;
      const allFraudFlags = [
        ...ruleEngineOutput.flags,
        ...fraudFinding.flags,
      ];
      const allComplianceFlags = [
        ...complianceFinding.flags,
      ];
      const tokenizationReady = (riskFinding.rawOutput as any)?.tokenizationReady ?? false;

      // Step 8: Update verification record in MongoDB
      await Verification.findOneAndUpdate(
        { verificationId },
        {
          status: 'COMPLETED',
          overallRiskScore: finalScore,
          overallRiskLevel: finalRiskLevel,
          agentFindings: allFindings,
          fraudFlags: allFraudFlags,
          complianceFlags: allComplianceFlags,
          aiExplanation: riskFinding.explanation,
          tokenizationReady,
          $set: { completedAt: new Date() },
        }
      );

      console.log(`[ORCHESTRATOR] Verification complete. Score: ${finalScore}, Level: ${finalRiskLevel}`);

      // Step 9: Build and return result
      const result: VerificationResult = {
        verificationId,
        documentId,
        documentHash: document.documentHash,
        status: 'COMPLETED',
        overallRiskScore: finalScore,
        overallRiskLevel: finalRiskLevel,
        agentFindings: allFindings,
        fraudFlags: allFraudFlags,
        complianceFlags: allComplianceFlags,
        aiExplanation: riskFinding.explanation,
        tokenizationReady,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      return result;
    } catch (err) {
      // Mark as failed in DB
      await Verification.findOneAndUpdate(
        { verificationId },
        { status: 'FAILED' }
      );
      throw err;
    }
  }
}
