import { Request, Response } from 'express';
import { VerificationOrchestrator } from '../services/verification.orchestrator';
import { Verification } from '../models/Verification';
import { AppError } from '../middleware/errorHandler';

export class VerificationController {
  /**
   * POST /api/verifications/start
   */
  static async start(req: Request, res: Response): Promise<void> {
    const { documentId } = req.body;
    if (!documentId) throw new AppError(400, 'documentId is required');

    const walletAddress = req.headers['x-wallet-address'] as string | undefined;
    console.log(`[VERIFICATION] Starting for document: ${documentId}`);

    const result = await VerificationOrchestrator.run(documentId, walletAddress);
    res.status(201).json({ success: true, data: result });
  }

  /**
   * GET /api/verifications/:verificationId
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const { verificationId } = req.params;
    const verification = await Verification.findOne({ verificationId });
    if (!verification) throw new AppError(404, `Verification not found: ${verificationId}`);
    res.json({ success: true, data: verification });
  }

  /**
   * GET /api/verifications/document/:documentId
   */
  static async getByDocument(req: Request, res: Response): Promise<void> {
    const { documentId } = req.params;
    const verifications = await Verification.find({ documentId }).sort({ createdAt: -1 });
    res.json({ success: true, data: verifications });
  }

  /**
   * GET /api/verifications
   */
  static async list(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string ?? '1', 10);
    const limit = parseInt(req.query.limit as string ?? '10', 10);
    const skip = (page - 1) * limit;

    const [verifications, total] = await Promise.all([
      Verification.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-agentFindings'),
      Verification.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        verifications,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  }

  /**
   * PATCH /api/verifications/:verificationId/onchain
   * Called by frontend AFTER a successful Mantle transaction.
   * Records the txHash in MongoDB — backend never touches the blockchain.
   */
  static async updateOnChain(req: Request, res: Response): Promise<void> {
    const { verificationId } = req.params;
    const { txHash } = req.body;

    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      throw new AppError(400, 'Valid txHash is required (0x + 64 hex chars)');
    }

    const verification = await Verification.findOneAndUpdate(
      { verificationId },
      { onChainTxHash: txHash, onChainTimestamp: new Date() },
      { new: true }
    );

    if (!verification) throw new AppError(404, `Verification not found: ${verificationId}`);

    console.log(`[ON-CHAIN] Recorded txHash for ${verificationId}: ${txHash}`);

    res.json({
      success: true,
      data: { verificationId, txHash, onChainTimestamp: verification.onChainTimestamp },
    });
  }
}
