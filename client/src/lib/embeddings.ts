import { TextChunk } from "@shared/schema";
import { pipeline } from "@xenova/transformers";

// Cache for embedding model
let embeddingModel: any = null;

// Generate embeddings for text chunks
export async function generateEmbeddings(chunks: TextChunk[]): Promise<TextChunk[]> {
  // Load the embedding model if not already loaded
  if (!embeddingModel) {
    try {
      embeddingModel = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );
    } catch (error) {
      console.error("Error loading embedding model:", error);
      throw new Error("Failed to load embedding model");
    }
  }
  
  // Process chunks in batches to avoid memory issues
  const batchSize = 5;
  const results: TextChunk[] = [];
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    
    try {
      // Process batch
      const batchPromises = batch.map(async (chunk) => {
        try {
          const output = await embeddingModel(chunk.text, {
            pooling: 'mean',
            normalize: true
          });
          
          // Extract embedding vector
          const embedding = Array.from(output.data);
          
          return {
            ...chunk,
            embedding
          };
        } catch (error) {
          console.error(`Error generating embedding for chunk: ${error}`);
          return chunk; // Return chunk without embedding
        }
      });
      
      const processedBatch = await Promise.all(batchPromises);
      results.push(...processedBatch);
      
      // Give browser time to breathe
      await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
      console.error(`Error processing batch ${i}-${i + batchSize}: ${error}`);
      // Add unprocessed chunks
      results.push(...batch);
    }
  }
  
  return results;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
