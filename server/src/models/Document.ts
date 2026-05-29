import { Schema, model, Document as MongoDocument } from 'mongoose';
import { DocumentType } from '../types';

export interface IDocument extends MongoDocument {
  documentId: string;
  documentHash: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  filePath: string;
  extractedText: string;
  pageCount: number;
  uploaderAddress?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    documentHash: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      enum: ['REAL_ESTATE', 'TITLE_DEED', 'PROPERTY_APPRAISAL', 'LEASE_AGREEMENT', 'MORTGAGE', 'OTHER'],
      default: 'OTHER',
    },
    filePath: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    uploaderAddress: {
      type: String,
      lowercase: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const DocumentModel = model<IDocument>('Document', DocumentSchema);
