// API client utilities for making requests to Gemini endpoints

export interface AnalysisResponse {
  success: boolean;
  analysis?: {
    overview: {
      documentType: string;
      parties: string[];
      effectiveDate: string;
      term: string;
      jurisdiction: string;
      summary: string;
    };
    keyClauses: Array<{
      title: string;
      content: string;
      category: string;
      importance: 'high' | 'medium' | 'low';
    }>;
    risks: Array<{
      title: string;
      description: string;
      severity: 'high' | 'medium' | 'low';
      recommendation: string;
    }>;
    financialTerms?: {
      totalValue?: string;
      paymentTerms?: string;
      penalties?: string;
    };
  };
  error?: string;
}

export interface ChatResponse {
  success: boolean;
  answer?: string;
  error?: string;
}

export interface ComparisonResponse {
  success: boolean;
  comparison?: {
    summary: {
      overallSimilarity: string;
      documentTypes: string[];
      keyDifferences: number;
      criticalIssues: number;
    };
    comparisonItems: Array<{
      category: string;
      label: string;
      doc1Value: string;
      doc2Value: string;
      status: 'match' | 'difference' | 'missing';
    }>;
    differences: Array<{
      section: string;
      description: string;
      severity: 'high' | 'medium' | 'low';
      doc1: string;
      doc2: string;
      implications: string;
    }>;
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      recommendation: string;
      reason: string;
    }>;
  };
  error?: string;
}

export async function analyzeDocument(
  documentText: string,
  documentType?: string
): Promise<AnalysisResponse> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText,
        documentType,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze document',
    };
  }
}

export async function extractClauses(documentText: string) {
  try {
    const response = await fetch('/api/extract-clauses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error extracting clauses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract clauses',
    };
  }
}

export async function chatWithDocument(
  documentText: string,
  question: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText,
        question,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in chat:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process question',
    };
  }
}

export async function compareDocuments(
  document1Text: string,
  document2Text: string,
  document1Name?: string,
  document2Name?: string
): Promise<ComparisonResponse> {
  try {
    const response = await fetch('/api/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document1Text,
        document2Text,
        document1Name,
        document2Name,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error comparing documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compare documents',
    };
  }
}