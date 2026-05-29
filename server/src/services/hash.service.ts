import crypto from 'crypto';
import fs from 'fs';

/**
 * HashService — generates SHA-256 hashes for uploaded files.
 *
 * Why SHA-256:
 * - Deterministic: same file always produces same hash
 * - Collision-resistant: two different files never produce same hash
 * - This hash is what gets stored on-chain as the document fingerprint
 *
 * The hash is computed from raw file bytes, not filename or metadata,
 * so renaming a file does not change its hash.
 */
export class HashService {
  /**
   * Reads file from disk and computes SHA-256 hash.
   * Returns hex string prefixed with 0x for blockchain compatibility.
   */
  static async hashFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve('0x' + hash.digest('hex')));
      stream.on('error', (err) => reject(err));
    });
  }

  /**
   * Hashes a string directly — used for hashing agent outputs
   * before storing them on-chain.
   */
  static hashString(input: string): string {
    return '0x' + crypto.createHash('sha256').update(input).digest('hex');
  }
}
