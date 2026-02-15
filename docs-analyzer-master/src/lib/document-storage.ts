// Simple file-based storage for documents (no database needed)
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Document {
  id: number;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  status: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_FILE = join(process.cwd(), 'documents.json');

// Load documents from file or initialize empty array
function loadDocuments(): Document[] {
  try {
    if (existsSync(STORAGE_FILE)) {
      const data = readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading documents:', error);
  }
  return [];
}

// Save documents to file
function saveDocuments(documents: Document[]): void {
  try {
    writeFileSync(STORAGE_FILE, JSON.stringify(documents, null, 2));
  } catch (error) {
    console.error('Error saving documents:', error);
  }
}

// Get current documents
function getDocumentsArray(): Document[] {
  return loadDocuments();
}

export function addDocument(document: Omit<Document, 'id'>): Document {
  const documents = getDocumentsArray();
  const id = Date.now();
  const newDocument: Document = {
    id,
    ...document
  };
  documents.push(newDocument);
  saveDocuments(documents);
  return newDocument;
}

export function getDocuments(): Document[] {
  return getDocumentsArray();
}

export function getDocumentById(id: number): Document | undefined {
  const documents = getDocumentsArray();
  return documents.find(doc => doc.id === id);
}

export function updateDocument(id: number, updates: Partial<Document>): Document | undefined {
  const documents = getDocumentsArray();
  const index = documents.findIndex(doc => doc.id === id);
  if (index === -1) return undefined;
  
  documents[index] = { ...documents[index], ...updates, updatedAt: new Date().toISOString() };
  saveDocuments(documents);
  return documents[index];
}

export function deleteDocument(id: number): boolean {
  const documents = getDocumentsArray();
  const index = documents.findIndex(doc => doc.id === id);
  if (index === -1) return false;
  
  documents.splice(index, 1);
  saveDocuments(documents);
  return true;
}
