import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Document } from "@shared/schema";
import { processDocument } from "@/lib/document-processor";

export function useDocumentStore() {
  const [document, setDocument] = useState<Document | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const uploadDocument = async (file: File): Promise<void> => {
    setIsProcessing(true);
    
    try {
      // Process the document using the document processor
      const processedDoc = await processDocument(file);
      
      // Create document object
      const newDocument: Document = {
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        pages: processedDoc.pageCount,
        words: processedDoc.wordCount,
        chunks: processedDoc.chunks.length,
        embeddings: processedDoc.chunks.filter(chunk => chunk.embedding).length,
        createdAt: new Date(),
      };
      
      setDocument(newDocument);
    } catch (error) {
      console.error("Error processing document:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const removeDocument = () => {
    setDocument(null);
  };
  
  return {
    document,
    isProcessing,
    uploadDocument,
    removeDocument,
  };
}
