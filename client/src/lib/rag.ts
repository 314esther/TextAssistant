import { TextChunk } from "@shared/schema";
import { cosineSimilarity } from "@/lib/embeddings";
import { getDocumentChunks } from "@/lib/document-processor";
import { generateEmbeddings } from "@/lib/embeddings";
import { pipeline } from "@xenova/transformers";

// Enhanced TextChunk with similarity score
interface ScoredChunk extends TextChunk {
  score?: number;
}

// Find relevant chunks for a question
export async function findRelevantChunks(
  question: string,
  documentId: string,
  topK: number = 3
): Promise<ScoredChunk[]> {
  // Get all chunks for the document
  const chunks = getDocumentChunks(documentId);
  
  if (!chunks || chunks.length === 0) {
    throw new Error("No chunks found for document");
  }
  
  // Generate embedding for the question
  const questionChunk: TextChunk = {
    id: "question",
    documentId: documentId,
    text: question,
    metadata: {}
  };
  
  const [questionWithEmbedding] = await generateEmbeddings([questionChunk]);
  
  if (!questionWithEmbedding.embedding) {
    throw new Error("Failed to generate embedding for question");
  }
  
  // Score chunks by similarity to question
  const scoredChunks: ScoredChunk[] = chunks
    .filter(chunk => chunk.embedding) // Only use chunks with embeddings
    .map(chunk => {
      const score = cosineSimilarity(
        questionWithEmbedding.embedding!,
        chunk.embedding!
      );
      
      return {
        ...chunk,
        score
      };
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, topK);
  
  return scoredChunks;
}
