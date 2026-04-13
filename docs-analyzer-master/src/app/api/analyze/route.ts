import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { documentText, documentType } = await request.json();

    if (!documentText) {
      return NextResponse.json(
        { error: "Document text is required" },
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

    const prompt = `You are a legal document analysis AI. Analyze the following ${documentType || "legal document"} and provide a comprehensive analysis.

Document:
${documentText}

Please provide a detailed analysis in the following JSON format:
{
  "overview": {
    "documentType": "type of document",
    "parties": ["party1", "party2"],
    "effectiveDate": "date",
    "term": "contract term",
    "jurisdiction": "jurisdiction",
    "summary": "brief summary"
  },
  "keyClauses": [
    {
      "title": "clause title",
      "content": "clause content",
      "category": "category",
      "importance": "high|medium|low"
    }
  ],
  "risks": [
    {
      "title": "risk title",
      "description": "risk description",
      "severity": "high|medium|low",
      "recommendation": "recommended action"
    }
  ],
  "financialTerms": {
    "totalValue": "value",
    "paymentTerms": "terms",
    "penalties": "penalties"
  }
}

Provide only valid JSON without any markdown formatting or code blocks.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    let analysisData;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysisData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      // Return a structured error response
      return NextResponse.json(
        {
          error: "Failed to parse analysis results",
          rawResponse: text
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: analysisData,
    });
  } catch (error) {
    console.error("Error analyzing document:", error);
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}