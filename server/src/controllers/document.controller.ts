import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DocumentModel } from '../models/Document';
import { HashService } from '../services/hash.service';
import { OCRService } from '../services/ocr.service';
import { AppError } from '../middleware/errorHandler';
import { DocumentType } from '../types';

/**
 * DocumentController — handles all document-related HTTP operations.
 *
 * upload():
 *   1. Receives file from multer middleware
 *   2. Generates SHA-256 hash of the file bytes
 *   3. Checks for duplicate (same hash already in DB)
 *   4. Runs OCR extraction
 *   5. Persists document record to MongoDB
 *   6. Returns documentId + hash to frontend
 *
 * getById():
 *   Returns full document record including extracted text.
 *
 * list():
 *   Returns paginated list of uploaded documents.
 */
export class DocumentController {
  static async upload(req: Request, res: Response): Promise<void> {
    // Multer attaches the file to req.file
    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    const file = req.file;
    const documentType = (req.body.documentType as DocumentType) ?? 'OTHER';
    const uploaderAddress = req.headers['x-wallet-address'] as string | undefined;

    console.log(`[UPLOAD] Processing: ${file.originalname} (${file.size} bytes)`);

    // Step 1: Hash the file
    const documentHash = await HashService.hashFile(file.path);
    console.log(`[UPLOAD] Hash: ${documentHash}`);

    // Step 2: Check for duplicate
    const existing = await DocumentModel.findOne({ documentHash });
    if (existing) {
      console.log(`[UPLOAD] Duplicate detected: ${documentHash}`);
      res.status(200).json({
        success: true,
        data: {
          documentId: existing.documentId,
          documentHash: existing.documentHash,
          isDuplicate: true,
          message: 'This document has already been uploaded and verified.',
          metadata: {
            fileName: existing.fileName,
            fileSize: existing.fileSize,
            mimeType: existing.mimeType,
            documentType: existing.documentType,
            uploadedAt: existing.uploadedAt,
            extractedText: existing.extractedText,
            pageCount: existing.pageCount,
          },
        },
      });
      return;
    }

    // Step 3: OCR extraction
    const { text, pageCount } = await OCRService.extractText(file.path, file.mimetype);
    const cleanedText = OCRService.cleanText(text);
    console.log(`[UPLOAD] Extracted ${cleanedText.length} characters from ${pageCount} page(s)`);

    // Step 4: Persist to MongoDB
    const documentId = uuidv4();
    const document = await DocumentModel.create({
      documentId,
      documentHash,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      documentType,
      filePath: file.path,
      extractedText: cleanedText,
      pageCount,
      uploaderAddress: uploaderAddress?.toLowerCase(),
      uploadedAt: new Date(),
    });

    console.log(`[UPLOAD] Saved document: ${documentId}`);

    res.status(201).json({
      success: true,
      data: {
        documentId: document.documentId,
        documentHash: document.documentHash,
        isDuplicate: false,
        message: 'Document uploaded and processed successfully.',
        metadata: {
          fileName: document.fileName,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          documentType: document.documentType,
          uploadedAt: document.uploadedAt,
          extractedText: document.extractedText,
          pageCount: document.pageCount,
        },
      },
    });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { documentId } = req.params;
    const document = await DocumentModel.findOne({ documentId });

    if (!document) {
      throw new AppError(404, `Document not found: ${documentId}`);
    }

    res.json({
      success: true,
      data: {
        documentId: document.documentId,
        documentHash: document.documentHash,
        metadata: {
          fileName: document.fileName,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          documentType: document.documentType,
          uploadedAt: document.uploadedAt,
          extractedText: document.extractedText,
          pageCount: document.pageCount,
        },
      },
    });
  }

  static async list(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string ?? '1', 10);
    const limit = parseInt(req.query.limit as string ?? '10', 10);
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      DocumentModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-extractedText -filePath'), // exclude large fields from list view
      DocumentModel.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        documents: documents.map((d) => ({
          documentId: d.documentId,
          documentHash: d.documentHash,
          fileName: d.fileName,
          fileSize: d.fileSize,
          mimeType: d.mimeType,
          documentType: d.documentType,
          uploadedAt: d.uploadedAt,
          pageCount: d.pageCount,
        })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  }
}
