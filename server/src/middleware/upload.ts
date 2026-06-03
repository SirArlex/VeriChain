import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { config } from '../config/env';
import { AppError } from './errorHandler';

// Ensure upload directory exists at startup
if (!fs.existsSync(config.upload.uploadDir)) {
  fs.mkdirSync(config.upload.uploadDir, { recursive: true });
}

/**
 * Multer disk storage config.
 * Files are saved as: uploads/<timestamp>-<originalname>
 * Original filename is sanitized to remove spaces and special chars.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.uploadDir);
  },
  filename: (_req, file, cb) => {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const unique = `${Date.now()}-${sanitized}`;
    cb(null, unique);
  },
});

/**
 * File filter — only allow PDF and image types.
 * Rejects anything else with a clear error message.
 */
function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        400,
        `File type not allowed: ${file.mimetype}. Allowed: PDF, JPEG, PNG, TIFF, WEBP`
      )
    );
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSizeMb * 1024 * 1024,
    files: 1,
  },
});
