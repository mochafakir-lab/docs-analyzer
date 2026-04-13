import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { documentText } = await request.json();

    if (!documentText) {
      return NextResponse.json(
        { error: "Document text is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `You are a legal document analysis AI specializing in clause extraction. Extract and categorize all important clauses from the following legal document.

Document:
${documentText}

Please identify and extract clauses in the following JSON format:
{
  "clauses": [
    {
      "id": "unique_id",
      "title": "clause title",
      "content": "full clause text",
      "category": "category (e.g., Compensation, Confidentiality, Termination, IP Rights, etc.)",
      "importance": "high|medium|low",
      "startPosition": "approximate position in document",
      "keyTerms": ["term1", "term2"]
    }
  ],
  "clauseCategories": [
    {
      "name": "category name",
      "count": 0,
      "clauses": ["clause_id1", "clause_id2"]
    }
  ],
  "missingClauses": [
    {
      "type": "commonly expected clause type",
      "importance": "high|medium|low",
      "recommendation": "why this clause should be included"
    }
  ]
}

Focus on extracting:
- Compensation and payment terms
- Confidentiality and non-disclosure provisions
- Intellectual property rights
- Termination and renewal clauses
- Liability and indemnification
- Dispute resolution
- Non-compete and restrictive covenants
- Representations and warranties

Provide only valid JSON without any markdown formatting or code blocks.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });
    
    const text = completion.choices[0]?.message?.content || "";

    // Try to parse JSON from the response
    let extractionData;
    try {
      const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extractionData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return NextResponse.json(
        {
          error: "Failed to parse extraction results",
          rawResponse: text
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      extraction: extractionData,
    });
  } catch (error) {
    console.error("Error extracting clauses:", error);
    return NextResponse.json(
      { error: "Failed to extract clauses" },
      { status: 500 }
    );
  }
}