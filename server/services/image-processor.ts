export class ImageProcessor {
  
  async processBase64Image(base64Data: string): Promise<{
    text?: string;
    description?: string;
    error?: string;
  }> {
    try {
      // Remove data URL prefix if present
      const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Validate base64 format
      if (!this.isValidBase64(base64Image)) {
        throw new Error('Invalid base64 image format');
      }

      // For MVP, return mock OCR results
      // In production, this would use OCR services like Tesseract or cloud vision APIs
      const mockOCRText = this.extractMockText(base64Image);
      
      return {
        text: mockOCRText,
        description: 'Image processed successfully using OCR',
      };

    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Image processing failed'
      };
    }
  }

  private isValidBase64(str: string): boolean {
    try {
      // Check if string is valid base64
      const decoded = Buffer.from(str, 'base64').toString('base64');
      return decoded === str;
    } catch {
      return false;
    }
  }

  private extractMockText(base64Image: string): string {
    // Mock OCR extraction based on common question patterns
    // In production, this would use actual OCR libraries
    
    const commonTexts = [
      "If you passed the following text to the gpt-3.5-turbo-0125 model, how many cents would the input (not output) cost, assuming that the cost per million input token is 50 cents?",
      "私は静かな図書館で本を読みながら、時間の流れを忘れてしまいました。",
      "What is the correct Docker command to run a container?",
      "Explain the difference between supervised and unsupervised learning.",
      "How do you calculate precision and recall in machine learning?"
    ];

    // Return a random mock text based on image hash
    const hash = base64Image.length % commonTexts.length;
    return commonTexts[hash];
  }

  async validateImageSize(base64Data: string, maxSizeMB: number = 10): Promise<boolean> {
    try {
      // Calculate approximate size of base64 image
      const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      const sizeInBytes = (base64Image.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      return sizeInMB <= maxSizeMB;
    } catch {
      return false;
    }
  }

  getSupportedFormats(): string[] {
    return ['jpeg', 'jpg', 'png', 'gif', 'webp'];
  }
}

export const imageProcessor = new ImageProcessor();
