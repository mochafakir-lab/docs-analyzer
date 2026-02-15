"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Scale,
  ArrowLeft,
  FileText,
  AlertTriangle,
  Shield,
  Clock,
  DollarSign,
  Users,
  Send,
  Download,
  Share2,
  Bot,
  User,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Clause {
  id: string;
  title: string;
  content: string;
  category: string;
  importance: "high" | "medium" | "low";
}

interface Risk {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  recommendation: string;
}


export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return <AnalysisPageClient documentId={resolvedParams.id} />;
}

function AnalysisPageClient({ documentId }: { documentId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load document and analysis on component mount
  useEffect(() => {
    const loadDocumentAndAnalysis = async () => {
      try {
        console.log('Loading document with ID:', documentId);
        // Fetch document info
        const docResponse = await fetch(`/api/documents/${documentId}`);
        console.log('Document response status:', docResponse.status);
        if (!docResponse.ok) {
          throw new Error('Failed to fetch document');
        }
        const docData = await docResponse.json();
        console.log('Document data:', docData);
        setDocument(docData);

        // Analyze the document
        console.log('Starting document analysis...');
        const analysisResponse = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentId: documentId }),
        });

        console.log('Analysis response status:', analysisResponse.status);
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          console.log('Analysis data:', analysisData);
          setAnalysis(analysisData.analysis);
        } else {
          console.log('Analysis failed, proceeding without full analysis');
          // Gracefully proceed without full analysis
          setAnalysis(null);
        }

        // Initialize chat with document-specific message
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: `Hello! I'll help you with your document "${docData.originalName}". If full analysis isn't ready yet, you can still ask questions about it and I'll do my best to assist. What would you like to know?`,
            timestamp: new Date(),
          },
        ]);

      } catch (error) {
        console.error('Error loading document:', error);
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: "I had trouble loading the full analysis. You can still ask questions about your document and I'll try to help.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoadingAnalysis(false);
      }
    };

    loadDocumentAndAnalysis();
  }, [documentId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    console.log('Sending message:', inputMessage);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      console.log('Getting document text for analysis...');
      // Get the full document text from our analysis
      const analysisResponse = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: documentId }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to get document text');
      }
      const analysisData = await analysisResponse.json();
      const documentText = analysisData.documentText;
      console.log('Document text length:', documentText?.length || 0);

      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('Calling chat API...');
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText,
          question: currentMessage,
          conversationHistory,
        }),
      });

      console.log('Chat API response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      console.log('Chat API response:', data);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.success ? data.answer : "I'm sorry, I couldn't process your question. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const toggleClause = (clauseId: string) => {
    setExpandedClauses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clauseId)) {
        newSet.delete(clauseId);
      } else {
        newSet.add(clauseId);
      }
      return newSet;
    });
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "";
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "border-red-200 dark:border-red-800";
      case "medium":
        return "border-yellow-200 dark:border-yellow-800";
      case "low":
        return "border-green-200 dark:border-green-800";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">LegalAI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Document Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {loadingAnalysis ? "Loading..." : document?.originalName || "Document Analysis"}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                {loadingAnalysis ? (
                  <Badge>Loading...</Badge>
                ) : (
                  <>
                    <Badge>{analysis?.overview?.documentType || "Legal Document"}</Badge>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Analyzed
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      {analysis?.risks?.some((r: any) => r.severity === 'high') ? 'High Risk' : 
                       analysis?.risks?.some((r: any) => r.severity === 'medium') ? 'Medium Risk' : 'Low Risk'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      • Uploaded on {document?.uploadDate ? new Date(document.uploadDate).toLocaleDateString() : 'Unknown'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Parties</h3>
                </div>
                <p className="text-sm">
                  {loadingAnalysis ? "Loading..." : 
                   analysis?.overview?.parties?.join(" & ") || "Not specified"}
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Term</h3>
                </div>
                <p className="text-sm">
                  {loadingAnalysis ? "Loading..." : 
                   analysis?.overview?.term || "Not specified"}
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Value</h3>
                </div>
                <p className="text-sm">
                  {loadingAnalysis ? "Loading..." : 
                   analysis?.overview?.totalValue || "Not specified"}
                </p>
              </Card>
            </div>

            {/* Tabs - Clauses and Risks */}
            <Tabs defaultValue="clauses" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="clauses">
                  <FileText className="h-4 w-4 mr-2" />
                  Key Clauses ({loadingAnalysis ? "..." : analysis?.clauses?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="risks">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Risk Assessment ({loadingAnalysis ? "..." : analysis?.risks?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clauses" className="space-y-4">
                {loadingAnalysis ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Analyzing document clauses...</p>
                  </div>
                ) : analysis?.clauses?.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.clauses.map((clause: any, index: number) => {
                      const isExpanded = expandedClauses.has(clause.id || index.toString());
                      return (
                        <div key={clause.id || index} className="border rounded-lg">
                          <button
                            onClick={() => toggleClause(clause.id || index.toString())}
                            className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                <h3 className="font-semibold text-base">{clause.title}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {clause.category}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getRiskColor(clause.importance)}>
                                  {clause.importance} importance
                                </Badge>
                                <div className="text-gray-400">
                                  {isExpanded ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t bg-gray-50/50 dark:bg-gray-800/50">
                              <p className="text-sm text-muted-foreground leading-relaxed pt-3">
                                {clause.content}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No clauses found in this document.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="risks" className="space-y-4">
                {loadingAnalysis ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Assessing document risks...</p>
                  </div>
                ) : analysis?.risks?.length > 0 ? (
                  analysis.risks.map((risk: any) => (
                    <Card key={risk.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          risk.severity === "high" ? "bg-red-100 dark:bg-red-900/30" :
                          risk.severity === "medium" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                          "bg-green-100 dark:bg-green-900/30"
                        }`}>
                          <AlertTriangle className={`h-5 w-5 ${
                            risk.severity === "high" ? "text-red-600 dark:text-red-400" :
                            risk.severity === "medium" ? "text-yellow-600 dark:text-yellow-400" :
                            "text-green-600 dark:text-green-400"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{risk.title}</h3>
                            <Badge className={getRiskColor(risk.severity)}>
                              {risk.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {risk.description}
                          </p>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-primary mb-1">
                                  Recommendation
                                </p>
                                <p className="text-sm">{risk.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No significant risks identified in this document.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Q&A Chat */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 flex flex-col h-[calc(100vh-8rem)]">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">AI Legal Assistant</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ask questions about this document
                </p>
              </div>

              <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" />
                          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Try: "What are the salary terms?" or "Explain the non-compete clause"
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}