import { TextChunk } from "@shared/schema";

interface TextNode {
  text: string;
  metadata: {
    pageNumber?: number;
    location?: number;
  };
}

// Default chunk size (characters)
const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

// Split text into chunks
export async function splitTextIntoChunks(
  textNodes: TextNode[],
  chunkSize = DEFAULT_CHUNK_SIZE,
  chunkOverlap = DEFAULT_CHUNK_OVERLAP
): Promise<TextChunk[]> {
  const chunks: TextChunk[] = [];
  let currentChunk = "";
  let currentMetadata = { ...textNodes[0]?.metadata };
  
  for (const node of textNodes) {
    // If adding this node would exceed chunk size, create a new chunk
    if (currentChunk.length + node.text.length > chunkSize && currentChunk.length > 0) {
      // Add current chunk to chunks array
      chunks.push({
        id: "", // Will be assigned later
        documentId: "", // Will be assigned later
        text: currentChunk.trim(),
        metadata: currentMetadata
      });
      
      // Start a new chunk with overlap
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(chunkOverlap / 5)); // Approximate word count for overlap
      currentChunk = overlapWords.join(" ") + " " + node.text;
      currentMetadata = { ...node.metadata };
    } else {
      // Add to current chunk
      currentChunk += (currentChunk ? " " : "") + node.text;
      // Keep the earliest page number
      if (node.metadata.pageNumber && (!currentMetadata.pageNumber || node.metadata.pageNumber < currentMetadata.pageNumber)) {
        currentMetadata.pageNumber = node.metadata.pageNumber;
      }
    }
  }
  
  // Add the last chunk if not empty
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: "", // Will be assigned later
      documentId: "", // Will be assigned later
      text: currentChunk.trim(),
      metadata: currentMetadata
    });
  }
  
  return chunks;
}

// Function to get chunk size based on setting
export function getChunkSize(setting: string): number {
  switch (setting) {
    case "small":
      return 500;
    case "medium":
      return 1000;
    case "large":
      return 2000;
    default:
      return DEFAULT_CHUNK_SIZE;
  }
}
