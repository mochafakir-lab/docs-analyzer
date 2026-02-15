import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { document1Text, document2Text, document1Name, document2Name } = await request.json();

    if (!document1Text || !document2Text) {
      return NextResponse.json(
        { error: "Both document texts are required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a legal document comparison AI. Compare the following two legal documents and identify similarities, differences, and potential issues.

Document 1 (${document1Name || "Document 1"}):
${document1Text}

Document 2 (${document2Name || "Document 2"}):
${document2Text}

Please provide a detailed comparison in the following JSON format:
{
  "summary": {
    "overallSimilarity": "percentage or description",
    "documentTypes": ["type1", "type2"],
    "keyDifferences": number,
    "criticalIssues": number
  },
  "comparisonItems": [
    {
      "category": "category name (e.g., Basic Information, Financial Terms, etc.)",
      "label": "specific field name",
      "doc1Value": "value from document 1",
      "doc2Value": "value from document 2",
      "status": "match|difference|missing"
    }
  ],
  "differences": [
    {
      "section": "section name",
      "description": "description of the difference",
      "severity": "high|medium|low",
      "doc1": "content from document 1",
      "doc2": "content from document 2",
      "implications": "what this difference means"
    }
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "recommendation": "what action should be taken",
      "reason": "why this is recommended"
    }
  ]
}

Compare aspects like:
- Basic terms (parties, dates, jurisdiction)
- Financial terms (compensation, payment schedules)
- Contract duration and termination
- Rights and obligations
- Restrictive covenants
- Liability and indemnification
- Dispute resolution

Provide only valid JSON without any markdown formatting or code blocks.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    let comparisonData;
    try {
      const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      comparisonData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return NextResponse.json(
        { 
          error: "Failed to parse comparison results",
          rawResponse: text 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comparison: comparisonData,
    });
  } catch (error) {
    console.error("Error comparing documents:", error);
    return NextResponse.json(
      { error: "Failed to compare documents" },
      { status: 500 }
    );
  }
}