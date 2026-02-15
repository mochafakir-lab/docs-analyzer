// Utility functions for document processing

export interface DocumentMetadata {
  name: string;
  type: string;
  size: number;
  mimeType: string;
  uploadDate: Date;
}

export const SUPPORTED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!Object.keys(SUPPORTED_FILE_TYPES).includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload PDF, DOCX, or TXT files.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getDocumentType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const typeMap: Record<string, string> = {
    pdf: 'PDF Document',
    docx: 'Word Document',
    txt: 'Text Document',
  };
  
  return typeMap[extension || ''] || 'Unknown Document';
}

export async function extractTextFromFile(file: File): Promise<string> {
  // This is a placeholder. In a real implementation, you would:
  // - For PDFs: Use a library like pdf-parse or PDF.js
  // - For DOCX: Use mammoth.js or similar
  // - For TXT: Use FileReader directly
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      // For PDF and DOCX, you'd need specific libraries
      // For now, return a placeholder
      resolve(`[Extracted text from ${file.name} - implement PDF/DOCX parsing]`);
    }
  });
}

export function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const DOCUMENT_CATEGORIES = [
  'Employment Agreement',
  'Non-Disclosure Agreement',
  'Service Agreement',
  'Lease Agreement',
  'Partnership Agreement',
  'Software License',
  'Purchase Agreement',
  'Consulting Agreement',
  'Other',
] as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];

export function detectDocumentCategory(text: string): DocumentCategory {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('employment') || lowerText.includes('employee')) {
    return 'Employment Agreement';
  }
  if (lowerText.includes('non-disclosure') || lowerText.includes('nda') || lowerText.includes('confidentiality')) {
    return 'Non-Disclosure Agreement';
  }
  if (lowerText.includes('service agreement') || lowerText.includes('services')) {
    return 'Service Agreement';
  }
  if (lowerText.includes('lease') || lowerText.includes('rental')) {
    return 'Lease Agreement';
  }
  if (lowerText.includes('partnership') || lowerText.includes('joint venture')) {
    return 'Partnership Agreement';
  }
  if (lowerText.includes('software license') || lowerText.includes('software agreement')) {
    return 'Software License';
  }
  
  return 'Other';
}