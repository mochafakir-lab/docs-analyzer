import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { join } from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Get document info from our storage
    const documentResponse = await fetch(`${request.nextUrl.origin}/api/documents/${documentId}`);
    if (!documentResponse.ok) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }
    const document = await documentResponse.json();

    // Prepare content input for Gemini (text or PDF inline data)
    let documentText = "";
    let geminiParts: Array<any> = [];
    try {
      const filePath = join(process.cwd(), "public", document.filePath);

      if (document.mimeType === "text/plain") {
        // For text files, read directly and send as text
        documentText = readFileSync(filePath, "utf-8");
        geminiParts = [
          { text: `You are a legal document analysis AI assistant. Analyze the following document.` },
          { text: documentText }
        ];
      } else if (document.mimeType === "application/pdf") {
        // For PDFs, send the raw bytes as inlineData for Gemini to parse
        const pdfBuffer = readFileSync(filePath);
        const base64 = Buffer.from(pdfBuffer).toString("base64");
        geminiParts = [
          { text: `You are a legal document analysis AI assistant. Analyze the attached PDF.` },
          { inlineData: { mimeType: "application/pdf", data: base64 } }
        ];
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload a PDF or text file." },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error preparing file for analysis:", error);
      return NextResponse.json(
        { error: "Failed to prepare document for analysis" },
        { status: 500 }
      );
    }

    // Note: For PDFs, documentText may be empty at this point; we rely on Gemini to extract text

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Analyze the document with Gemini (supports either text or PDF inlineData)
    const instruction = `Analyze this legal document and provide a comprehensive analysis in JSON format. Extract the following information:

1. Document overview (type, parties, key dates, terms, values)
2. Key clauses with their content and importance levels
3. Risk assessment with severity levels and recommendations

Return a JSON object with keys: overview, clauses, risks, and extractedText (a plain-text extraction of the document contents, truncated to the first 6000 characters for PDFs).`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: instruction },
            ...geminiParts
          ]
        }
      ]
    });
    const response = await result.response;
    const analysisText = response.text();

    // Try to parse the JSON response
    let analysis;
    try {
      // Clean up the response text to extract JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing analysis JSON:", parseError);
      return NextResponse.json(
        { error: "Failed to parse analysis results" },
        { status: 500 }
      );
    }

    // Prefer extractedText from model for PDFs, otherwise use documentText
    const extractedText = typeof analysis?.extractedText === "string" && analysis.extractedText.trim().length > 0
      ? analysis.extractedText
      : documentText;

    return NextResponse.json({
      success: true,
      analysis,
      documentText: extractedText
    });

  } catch (error) {
    console.error("Error analyzing document:", error);
    return NextResponse.json(
      { error: "Failed to analyze document", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
