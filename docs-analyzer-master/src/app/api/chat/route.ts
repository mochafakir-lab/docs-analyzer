import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { documentText, question, conversationHistory } = await request.json();

    if (!documentText || !question) {
      return NextResponse.json(
        { error: "Document text and question are required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    // Build conversation context
    let conversationContext = "";
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = "\n\nPrevious conversation:\n";
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        conversationContext += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
      });
    }

    const prompt = `You are a legal document analysis AI assistant. Only use the content in the document below to answer. If the answer is not present, explicitly say you cannot find it in the document. Do not fabricate details. Keep answers concise and cite the exact clause text if helpful.

Document:
${documentText}
${conversationContext}

User Question: ${question}

Please provide a clear, accurate, and helpful answer based on the document. If the information is not in the document, say so. If legal advice is requested, remind the user that you provide information only and they should consult with a qualified attorney for legal advice.

Keep your response concise and focused on answering the specific question.`;

    async function askOnce(): Promise<string> {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 512,
      });
      return completion.choices[0]?.message?.content || "";
    }

    let answer: string;
    try {
      answer = await askOnce();
    } catch (e) {
      // Simple one-time retry for transient failures
      answer = await askOnce();
    }

    return NextResponse.json({
      success: true,
      answer: answer.trim(),
    });
  } catch (error) {
    console.error("Error processing chat:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Failed to process question", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}