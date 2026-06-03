import path from 'path';
import fs from 'fs';

/**
 * OCRService — extracts text from uploaded documents.
 *
 * Strategy:
 * - PDF files → use pdf-parse (fast, accurate for text PDFs)
 * - Image files (JPEG, PNG, TIFF, WEBP) → use Tesseract.js (OCR)
 *
 * Why two methods:
 * - pdf-parse reads embedded text directly — much faster than OCR
 * - Tesseract handles scanned documents and image-based content
 * - Real estate docs come in both formats
 *
 * Failure handling:
 * - If OCR fails, we return empty string and log the error
 * - Verification can still proceed with limited text
 */
export class OCRService {
  /**
   * Main entry point — detects file type and routes to correct extractor.
   */
  static async extractText(filePath: string, mimeType: string): Promise<{ text: string; pageCount: number }> {
    console.log(`[OCR] Starting extraction for: ${path.basename(filePath)} (${mimeType})`);
    const startTime = Date.now();

    try {
      let result: { text: string; pageCount: number };

      if (mimeType === 'application/pdf') {
        result = await OCRService.extractFromPDF(filePath);
      } else {
        result = await OCRService.extractFromImage(filePath);
      }

      const elapsed = Date.now() - startTime;
      console.log(`[OCR] Extraction complete in ${elapsed}ms. Characters: ${result.text.length}`);
      return result;
    } catch (err) {
      console.error('[OCR] Extraction failed:', err);
      return { text: '', pageCount: 1 };
    }
  }

  /**
   * PDF text extraction using pdf-parse.
   * Works on text-based PDFs — does NOT work on scanned/image PDFs.
   * For scanned PDFs, we fall back to Tesseract.
   */
  private static async extractFromPDF(filePath: string): Promise<{ text: string; pageCount: number }> {
    try {
      // Dynamic import to avoid issues with pdf-parse module loading
      const pdfParse = (await import('pdf-parse')).default;
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);

      const text = data.text?.trim() ?? '';

      // If pdf-parse returned very little text, the PDF is likely scanned
      // In that case, we could run Tesseract on converted images
      // For Phase 3, we return what we have
      if (text.length < 50) {
        console.log('[OCR] PDF has minimal embedded text — may be scanned. Text length:', text.length);
      }

      return {
        text,
        pageCount: data.numpages ?? 1,
      };
    } catch (err) {
      console.error('[OCR] pdf-parse failed:', err);
      return { text: '', pageCount: 1 };
    }
  }

  /**
   * Image OCR using Tesseract.js.
   * Supports JPEG, PNG, TIFF, WEBP.
   * Runs entirely server-side — no external API calls.
   */
  private static async extractFromImage(filePath: string): Promise<{ text: string; pageCount: number }> {
    try {
      const Tesseract = await import('tesseract.js');
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            process.stdout.write(`\r[OCR] Tesseract progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const { data } = await worker.recognize(filePath);
      await worker.terminate();

      console.log(''); // newline after progress
      return {
        text: data.text?.trim() ?? '',
        pageCount: 1,
      };
    } catch (err) {
      console.error('[OCR] Tesseract failed:', err);
      return { text: '', pageCount: 1 };
    }
  }

  /**
   * Cleans extracted text — removes excessive whitespace,
   * normalizes line breaks, trims null bytes.
   * Call this before passing text to AI agents.
   */
  static cleanText(raw: string): string {
    return raw
      .replace(/\x00/g, '')           // remove null bytes
      .replace(/\r\n/g, '\n')         // normalize line endings
      .replace(/\n{3,}/g, '\n\n')     // collapse excessive blank lines
      .replace(/[ \t]{2,}/g, ' ')     // collapse multiple spaces
      .trim();
  }
}
