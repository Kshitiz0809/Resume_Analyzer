import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';

export class ResumeProcessor {
  async extractText(args: { filePath?: string; fileBuffer?: string }): Promise<string> {
    if (args.fileBuffer) {
      return this.extractFromBuffer(args.fileBuffer);
    }
    
    if (args.filePath) {
      return this.extractFromFile(args.filePath);
    }
    
    throw new Error('Either filePath or fileBuffer must be provided');
  }

  private async extractFromFile(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const extension = path.extname(filePath).toLowerCase();
      
      return this.processBuffer(fileBuffer, extension);
    } catch (error) {
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractFromBuffer(base64Buffer: string): Promise<string> {
    try {
      const buffer = Buffer.from(base64Buffer, 'base64');
      // Try to determine file type from buffer headers
      const extension = this.detectFileType(buffer);
      
      return this.processBuffer(buffer, extension);
    } catch (error) {
      throw new Error(`Failed to process buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processBuffer(buffer: Buffer, extension: string): Promise<string> {
    switch (extension) {
      case '.pdf':
        return this.extractFromPDF(buffer);
      case '.docx':
        return this.extractFromDOCX(buffer);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }

  private async extractFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract PDF text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractFromDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Failed to extract DOCX text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private detectFileType(buffer: Buffer): string {
    // PDF magic number
    if (buffer.subarray(0, 4).toString() === '%PDF') {
      return '.pdf';
    }
    
    // DOCX magic number (ZIP file signature)
    if (buffer.subarray(0, 2).toString('hex') === '504b') {
      return '.docx';
    }
    
    // Default to PDF if detection fails
    return '.pdf';
  }
}
