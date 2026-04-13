import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { readFileSync } from "fs";
import { join } from "path";
const childProcess = require("child_process");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
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

    let documentText = "";
    try {
      const filePath = join(process.cwd(), "public", document.filePath);

      if (document.mimeType === "text/plain") {
        documentText = readFileSync(filePath, "utf-8");
      } else if (document.mimeType === "application/pdf") {
        const p = [process.cwd(), "src", "lib", "parse-pdf.js"].join("/");
        const cleanEnv = { ...process.env };
        delete cleanEnv.NODE_OPTIONS;
        delete cleanEnv.__NEXT_PRIVATE_PREBUNDLED_REACT;
        const stdout = childProcess.execFileSync("node", [p, filePath], { 
          encoding: "utf-8", 
          maxBuffer: 1024 * 1024 * 50,
          env: cleanEnv
        });
        documentText = stdout;
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

    // Truncate to avoid context limit overflow for massive PDFs. Roughly 50k chars is safe for LLMs.
    const truncatedText = documentText.length > 50000 ? documentText.substring(0, 50000) : documentText;

    const instruction = `Analyze this legal document and provide a comprehensive analysis in JSON format. Extract the following information:

1. Document overview (type, parties, key dates, terms, values)
2. Key clauses with their content and importance levels
3. Risk assessment with severity levels and recommendations

Return a JSON object with strictly these keys:
{
  "overview": {
    "type": "string",
    "parties": ["string"],
    "keyDates": ["string"],
    "terms": ["string"],
    "values": ["string"]
  },
  "clauses": [
    {
      "title": "string",
      "content": "string",
      "importance": "string"
    }
  ],
  "risks": [
    {
      "severity": "string",
      "risk": "string",
      "recommendation": "string"
    }
  ],
  "extractedText": "a plain-text extraction of the document contents, truncated to the first 6000 characters."
}

Document Content:
${truncatedText}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: instruction }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });
    
    const analysisText = completion.choices[0]?.message?.content || "";

    // Try to parse the JSON response
    let analysis;
    try {
      // Clean up the response text to extract JSON
      const cleanText = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Error parsing analysis JSON:", parseError);
      console.error("Raw response:", analysisText);
      return NextResponse.json(
        { error: "Failed to parse analysis results", rawResponse: analysisText },
        { status: 500 }
      );
    }

    // Prefer extractedText from model, otherwise use documentText up to 6k
    const extractedText = typeof analysis?.extractedText === "string" && analysis.extractedText.trim().length > 0
      ? analysis.extractedText
      : documentText.substring(0, 6000);

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
