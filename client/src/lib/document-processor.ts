import { v4 as uuidv4 } from "uuid";
import { TextChunk } from "@shared/schema";
import { splitTextIntoChunks } from "@/lib/text-splitter";
import { generateEmbeddings } from "@/lib/embeddings";

// TextNode with metadata for document structure
interface TextNode {
  text: string;
  metadata: {
    pageNumber?: number;
    location?: number;
  };
}

// Processed document result
interface ProcessedDocument {
  pageCount: number;
  wordCount: number;
  chunks: TextChunk[];
}

// In-memory storage for chunks
const documentChunks: Record<string, TextChunk[]> = {};

// Process document file
export async function processDocument(file: File): Promise<ProcessedDocument> {
  // Extract text based on file type
  const extractedText = await extractText(file);
  
  // Create text nodes with metadata
  const textNodes = createTextNodes(extractedText);
  
  // Split text into chunks
  const chunks = await splitTextIntoChunks(textNodes);
  
  // Generate word count
  const wordCount = countWords(extractedText.text);
  
  // Generate embeddings for chunks
  const chunksWithEmbeddings = await generateEmbeddings(chunks);
  
  // Create document ID to reference chunks
  const documentId = uuidv4();
  
  // Add unique IDs to chunks and store them in memory
  const finalChunks = chunksWithEmbeddings.map(chunk => ({
    ...chunk,
    id: uuidv4(),
    documentId
  }));
  
  // Store chunks in memory
  documentChunks[documentId] = finalChunks;
  
  return {
    pageCount: extractedText.pageCount,
    wordCount,
    chunks: finalChunks
  };
}

// Get chunks for a document
export function getDocumentChunks(documentId: string): TextChunk[] {
  return documentChunks[documentId] || [];
}

// Extract text from documents based on file type
async function extractText(file: File): Promise<{ text: string; pageCount: number }> {
  if (file.type === 'application/pdf') {
    return extractPdfText(file);
  } else if (file.type === 'text/plain') {
    return extractPlainText(file);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractDocxText(file);
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
}

// Extract text from PDF
async function extractPdfText(file: File): Promise<{ text: string; pageCount: number }> {
  // Dynamically import PDF.js to avoid loading it on initial page load
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker path
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    
    fileReader.onload = async (event) => {
      try {
        const typedArray = new Uint8Array(event.target!.result as ArrayBuffer);
        const loadingTask = pdfjsLib.getDocument({ data: typedArray });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        const pageCount = pdf.numPages;
        
        for (let i = 1; i <= pageCount; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        resolve({ text: fullText, pageCount });
      } catch (error) {
        reject(error);
      }
    };
    
    fileReader.onerror = () => {
      reject(new Error('Error reading PDF file'));
    };
    
    fileReader.readAsArrayBuffer(file);
  });
}

// Extract text from plain text file
async function extractPlainText(file: File): Promise<{ text: string; pageCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const text = event.target!.result as string;
      // Estimate page count based on average lines per page
      const lines = text.split('\n').length;
      const estimatedPageCount = Math.max(1, Math.ceil(lines / 40)); // Assuming ~40 lines per page
      
      resolve({ text, pageCount: estimatedPageCount });
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading text file'));
    };
    
    reader.readAsText(file);
  });
}

// Extract text from DOCX file
async function extractDocxText(file: File): Promise<{ text: string; pageCount: number }> {
  // Use mammoth.js to extract text from DOCX
  const mammoth = await import('mammoth');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target!.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        
        // Estimate page count based on word count (average 500 words per page)
        const wordCount = text.split(/\s+/).length;
        const estimatedPageCount = Math.max(1, Math.ceil(wordCount / 500));
        
        resolve({ text, pageCount: estimatedPageCount });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading DOCX file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Create text nodes with metadata
function createTextNodes(extractedText: { text: string; pageCount: number }): TextNode[] {
  const { text, pageCount } = extractedText;
  
  // Simple approach: split by newlines and assign estimated page numbers
  const lines = text.split('\n');
  const linesPerPage = Math.ceil(lines.length / pageCount);
  
  return lines.map((line, index) => ({
    text: line.trim(),
    metadata: {
      pageNumber: Math.floor(index / linesPerPage) + 1,
      location: index
    }
  })).filter(node => node.text.length > 0); // Remove empty lines
}

// Count words in text
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}
