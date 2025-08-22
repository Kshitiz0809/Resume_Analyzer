import pdfParse from 'pdf-parse';

export class DocumentParserService {
  
  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  async extractTextFromDOCX(buffer: Buffer): Promise<string> {
    // TODO: Implement DOCX parsing
    // For now, return a placeholder
    return 'DOCX parsing not yet implemented';
  }

  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      return this.extractTextFromPDF(buffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return this.extractTextFromDOCX(buffer);
    } else {
      throw new Error('Unsupported file type');
    }
  }
}
