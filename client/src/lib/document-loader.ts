import { v4 as uuidv4 } from "uuid";
import { Document } from "@shared/schema";
import { processDocument } from "./document-processor";
import type { LucideIcon } from "lucide-react";

// Define preloaded document interface
export interface PreloadedDocument {
  id: string;
  title: string;
  filename: string;
  category?: string;
  iconType?: string;
}

// In-memory storage for processed preloaded documents
const processedDocuments: Record<string, Document> = {};

// Load a document from the server by filename
export async function loadPreloadedDocument(filename: string): Promise<Document> {
  try {
    // If document is already processed, return it
    const existingDocId = Object.keys(processedDocuments).find(
      id => processedDocuments[id].name === filename
    );
    
    if (existingDocId) {
      return processedDocuments[existingDocId];
    }
    
    // Fetch the document file from the server
    const response = await fetch(`/documents/${filename}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load document: ${response.statusText}`);
    }
    
    // Convert to blob and then File object
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type || 'text/plain' });
    
    // Process the document using the document processor
    const processedDoc = await processDocument(file);
    
    // Create document object
    const newDocument: Document = {
      id: uuidv4(),
      name: filename,
      size: file.size,
      type: file.type || 'text/plain',
      pages: processedDoc.pageCount,
      words: processedDoc.wordCount,
      chunks: processedDoc.chunks.length,
      embeddings: processedDoc.chunks.filter(chunk => chunk.embedding).length,
      createdAt: new Date(),
    };
    
    // Store processed document in memory
    processedDocuments[newDocument.id] = newDocument;
    
    return newDocument;
  } catch (error) {
    console.error("Error loading preloaded document:", error);
    throw new Error("Failed to load document");
  }
}

// Get preloaded document list from the server
export async function getPreloadedDocuments(): Promise<PreloadedDocument[]> {
  // For now, return a static list based on our documents folder
  // In a real app, you would fetch this from the server
  return [
    {
      id: "ai-overview",
      title: "Artificial Intelligence Overview",
      filename: "ai_overview.txt",
      category: "Technology",
      iconType: "file-text"
    },
    {
      id: "great-gatsby",
      title: "The Great Gatsby",
      filename: "great_gatsby.txt",
      category: "Literature",
      iconType: "book"
    },
    {
      id: "python-intro",
      title: "Python Programming Introduction",
      filename: "python_introduction.txt",
      category: "Technology",
      iconType: "file-text"
    }
  ];
}

// Get a document by ID if it's already processed
export function getProcessedDocument(id: string): Document | null {
  return processedDocuments[id] || null;
}