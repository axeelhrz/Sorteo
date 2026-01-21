/**
 * OCR Service for Payment Voucher Validation
 * 
 * This service uses OCR to extract payment information from voucher images
 * and validates the amount against the expected payment.
 */

export interface OCRResult {
  success: boolean;
  extractedAmount?: number;
  confidence?: number;
  rawText?: string;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  extractedAmount?: number;
  expectedAmount: number;
  confidence?: number;
  message: string;
}

/**
 * Extract amount from text using regex patterns
 */
function extractAmountFromText(text: string): number | null {
  // Remove line breaks and extra spaces
  const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');

  // Patterns to match amounts in different formats
  const patterns = [
    // S/ 123.45 or S/. 123.45
    /S\/\.?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    // PEN 123.45
    /PEN\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    // Monto: 123.45 or Total: 123.45
    /(?:monto|total|importe)[\s:]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    // Just numbers with decimals
    /(\d{1,3}(?:,\d{3})*\.\d{2})/g,
  ];

  const amounts: number[] = [];

  for (const pattern of patterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        amounts.push(amount);
      }
    }
  }

  // Return the most common amount or the largest one
  if (amounts.length === 0) return null;
  
  // Sort amounts and return the most likely candidate
  amounts.sort((a, b) => b - a);
  return amounts[0];
}

/**
 * Extract amount from voucher image using OCR
 */
export const ocrService = {
  /**
   * Process voucher image and extract payment information
   * Uses Google Cloud Vision API via backend endpoint
   */
  async processVoucher(imageUrl: string): Promise<OCRResult> {
    try {
      console.log('Processing voucher with OCR:', imageUrl);

      // Call backend OCR endpoint
      const response = await fetch('/api/ocr/process-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar la imagen con OCR');
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Error al procesar la imagen',
        };
      }

      // Extract amount from OCR text
      const extractedAmount = extractAmountFromText(data.text);

      return {
        success: true,
        extractedAmount: extractedAmount || undefined,
        confidence: data.confidence || 0.85,
        rawText: data.text,
      };
    } catch (error) {
      console.error('Error processing voucher with OCR:', error);
      return {
        success: false,
        error: 'Error al procesar la imagen con OCR',
      };
    }
  },

  /**
   * Validate payment amount against expected amount
   */
  validatePaymentAmount(
    extractedAmount: number | undefined,
    expectedAmount: number,
    tolerance: number = 0.01 // 1% tolerance
  ): ValidationResult {
    if (!extractedAmount) {
      return {
        isValid: false,
        expectedAmount,
        message: 'No se pudo extraer el monto del comprobante',
      };
    }

    const difference = Math.abs(extractedAmount - expectedAmount);
    const percentageDiff = difference / expectedAmount;

    if (percentageDiff <= tolerance) {
      return {
        isValid: true,
        extractedAmount,
        expectedAmount,
        message: 'El monto del comprobante coincide con el pago',
      };
    }

    return {
      isValid: false,
      extractedAmount,
      expectedAmount,
      message: `El monto extraído (S/ ${extractedAmount.toFixed(2)}) no coincide con el monto esperado (S/ ${expectedAmount.toFixed(2)})`,
    };
  },

  /**
   * Process and validate voucher in one step
   */
  async processAndValidate(
    imageUrl: string,
    expectedAmount: number
  ): Promise<ValidationResult> {
    const ocrResult = await this.processVoucher(imageUrl);

    if (!ocrResult.success) {
      return {
        isValid: false,
        expectedAmount,
        message: ocrResult.error || 'Error al procesar el comprobante',
      };
    }

    return this.validatePaymentAmount(
      ocrResult.extractedAmount,
      expectedAmount
    );
  },
};

/**
 * Integration guide for production OCR services:
 * 
 * 1. Google Cloud Vision API:
 *    - Install: npm install @google-cloud/vision
 *    - Setup: Create service account and download credentials
 *    - Use: TEXT_DETECTION or DOCUMENT_TEXT_DETECTION
 * 
 * 2. AWS Textract:
 *    - Install: npm install @aws-sdk/client-textract
 *    - Setup: Configure AWS credentials
 *    - Use: DetectDocumentText or AnalyzeExpense
 * 
 * 3. Azure Computer Vision:
 *    - Install: npm install @azure/cognitiveservices-computervision
 *    - Setup: Get API key and endpoint
 *    - Use: Read API for text extraction
 * 
 * 4. Tesseract.js (client-side):
 *    - Install: npm install tesseract.js
 *    - No server setup needed
 *    - Use: Tesseract.recognize() for text extraction
 */