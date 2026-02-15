"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Scale,
  ArrowLeft,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
}

interface ComparisonItem {
  category: string;
  label: string;
  doc1Value: string;
  doc2Value: string;
  status: "match" | "difference" | "missing";
}

interface Difference {
  id: string;
  section: string;
  description: string;
  severity: "high" | "medium" | "low";
  doc1: string;
  doc2: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Employment Contract - John Doe.pdf",
    type: "Employment Agreement",
    uploadDate: "2024-01-15",
  },
  {
    id: "2",
    name: "NDA - Tech Corp Partnership.pdf",
    type: "Non-Disclosure Agreement",
    uploadDate: "2024-01-14",
  },
  {
    id: "3",
    name: "Service Agreement - Client XYZ.docx",
    type: "Service Agreement",
    uploadDate: "2024-01-13",
  },
];

const mockComparisonData: ComparisonItem[] = [
  {
    category: "Basic Information",
    label: "Document Type",
    doc1Value: "Employment Agreement",
    doc2Value: "Employment Agreement",
    status: "match",
  },
  {
    category: "Basic Information",
    label: "Effective Date",
    doc1Value: "January 1, 2024",
    doc2Value: "February 1, 2024",
    status: "difference",
  },
  {
    category: "Basic Information",
    label: "Jurisdiction",
    doc1Value: "California, USA",
    doc2Value: "New York, USA",
    status: "difference",
  },
  {
    category: "Financial Terms",
    label: "Base Salary",
    doc1Value: "$60,000/year",
    doc2Value: "$75,000/year",
    status: "difference",
  },
  {
    category: "Financial Terms",
    label: "Bonus Structure",
    doc1Value: "Performance-based, up to 15%",
    doc2Value: "Not specified",
    status: "difference",
  },
  {
    category: "Financial Terms",
    label: "Benefits",
    doc1Value: "Health, 401(k), PTO",
    doc2Value: "Health, 401(k), PTO, Stock Options",
    status: "difference",
  },
  {
    category: "Term & Termination",
    label: "Contract Term",
    doc1Value: "24 months",
    doc2Value: "36 months",
    status: "difference",
  },
  {
    category: "Term & Termination",
    label: "Notice Period",
    doc1Value: "30 days",
    doc2Value: "60 days",
    status: "difference",
  },
  {
    category: "Term & Termination",
    label: "Severance",
    doc1Value: "2 weeks per year of service",
    doc2Value: "1 month per year of service",
    status: "difference",
  },
  {
    category: "Restrictive Covenants",
    label: "Non-Compete Duration",
    doc1Value: "12 months",
    doc2Value: "6 months",
    status: "difference",
  },
  {
    category: "Restrictive Covenants",
    label: "Non-Compete Radius",
    doc1Value: "50 miles",
    doc2Value: "25 miles",
    status: "difference",
  },
  {
    category: "Restrictive Covenants",
    label: "Confidentiality Period",
    doc1Value: "5 years post-employment",
    doc2Value: "3 years post-employment",
    status: "difference",
  },
];

const mockDifferences: Difference[] = [
  {
    id: "1",
    section: "Compensation",
    description: "Significant salary difference of $15,000 annually",
    severity: "high",
    doc1: "$60,000 per year base salary",
    doc2: "$75,000 per year base salary with stock options",
  },
  {
    id: "2",
    section: "Non-Compete Clause",
    description: "Document 1 has more restrictive non-compete terms",
    severity: "high",
    doc1: "12 months, 50-mile radius restriction",
    doc2: "6 months, 25-mile radius restriction",
  },
  {
    id: "3",
    section: "Contract Duration",
    description: "Different contract term lengths",
    severity: "medium",
    doc1: "24-month fixed term",
    doc2: "36-month fixed term",
  },
  {
    id: "4",
    section: "Notice Period",
    description: "Document 2 requires longer notice for termination",
    severity: "medium",
    doc1: "30 days written notice required",
    doc2: "60 days written notice required",
  },
  {
    id: "5",
    section: "Severance Package",
    description: "Document 2 offers more generous severance terms",
    severity: "low",
    doc1: "2 weeks pay per year of service",
    doc2: "1 month pay per year of service",
  },
];

export default function ComparePage() {
  const searchParams = useSearchParams();
  const [doc1, setDoc1] = useState<string>("1");
  const [doc2, setDoc2] = useState<string>("2");

  useEffect(() => {
    const docs = searchParams.get("docs")?.split(",") || [];
    if (docs[0]) setDoc1(docs[0]);
    if (docs[1]) setDoc2(docs[1]);
  }, [searchParams]);

  const selectedDoc1 = mockDocuments.find((d) => d.id === doc1);
  const selectedDoc2 = mockDocuments.find((d) => d.id === doc2);

  const groupedComparisons = mockComparisonData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ComparisonItem[]>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "match":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "difference":
        return <XCircle className="h-4 w-4 text-yellow-500" />;
      case "missing":
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
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

  const matchCount = mockComparisonData.filter((i) => i.status === "match").length;
  const differenceCount = mockComparisonData.filter((i) => i.status === "difference").length;
  const matchPercentage = Math.round((matchCount / mockComparisonData.length) * 100);

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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Comparison
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Document Comparison</h1>
            <p className="text-muted-foreground">
              Compare multiple documents side-by-side to identify differences and similarities
            </p>
          </div>

          {/* Document Selection */}
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Document 1</label>
                <Select value={doc1} onValueChange={setDoc1}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDocuments.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDoc1 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline">{selectedDoc1.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedDoc1.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Document 2</label>
                <Select value={doc2} onValueChange={setDoc2}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDocuments.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDoc2 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline">{selectedDoc2.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedDoc2.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Summary Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Match</p>
                  <p className="text-3xl font-bold">{matchPercentage}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Key Differences</p>
                  <p className="text-3xl font-bold">{differenceCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                  <p className="text-3xl font-bold">
                    {mockDifferences.filter((d) => d.severity === "high").length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </Card>
          </div>

          {/* Comparison Tabs */}
          <Tabs defaultValue="side-by-side" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="side-by-side">
                <FileText className="h-4 w-4 mr-2" />
                Side-by-Side Comparison
              </TabsTrigger>
              <TabsTrigger value="differences">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Key Differences ({mockDifferences.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="side-by-side" className="space-y-6">
              {Object.entries(groupedComparisons).map(([category, items]) => (
                <Card key={category} className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{category}</h3>
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="grid md:grid-cols-[200px_1fr_1fr] gap-4 py-3 border-b last:border-b-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        <div className={`p-3 rounded-lg ${
                          item.status === "difference" ? "bg-yellow-50 dark:bg-yellow-900/10" : "bg-muted/50"
                        }`}>
                          <p className="text-sm">{item.doc1Value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${
                          item.status === "difference" ? "bg-yellow-50 dark:bg-yellow-900/10" : "bg-muted/50"
                        }`}>
                          <p className="text-sm">{item.doc2Value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="differences" className="space-y-4">
              {mockDifferences.map((diff) => (
                <Card key={diff.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{diff.section}</h3>
                        <Badge className={getSeverityColor(diff.severity)}>
                          {diff.severity} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{diff.description}</p>
                    </div>
                    <AlertTriangle className={`h-6 w-6 ${
                      diff.severity === "high" ? "text-red-500" :
                      diff.severity === "medium" ? "text-yellow-500" :
                      "text-green-500"
                    }`} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Document 1</span>
                      </div>
                      <p className="text-sm">{diff.doc1}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Document 2</span>
                      </div>
                      <p className="text-sm">{diff.doc2}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}