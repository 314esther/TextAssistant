import { TextChunk } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { marked } from 'marked';

// Generate answer using LLM (OpenAI)
export async function generateAnswer(
  question: string,
  relevantChunks: TextChunk[]
): Promise<string> {
  // Extract text from chunks to include in prompt
  const contextText = relevantChunks
    .map(chunk => {
      const pageInfo = chunk.metadata?.pageNumber
        ? `[Page ${chunk.metadata.pageNumber}]`
        : '';
      
      return `${pageInfo}\n${chunk.text}\n`;
    })
    .join('\n---\n');
  
  // Create system prompt for the chatbot
  const systemPrompt = `You are a helpful assistant that answers questions about documents. 
Answer the user's question based ONLY on the provided context. 
If you cannot find the answer in the context, say "I don't see information about that in the document." 
Do not make up information. Use markdown formatting for your response, including bold, lists, and paragraphs as appropriate.
Be concise but thorough.`;

  // Create messages array for the API request
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Context information is below:
\n---\n
${contextText}
\n---\n
Given the context information and not prior knowledge, answer the question: ${question}` }
  ];
  
  try {
    // Send request to the API
    const response = await apiRequest('POST', '/api/generate', {
      messages,
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      temperature: 0.5,
      max_tokens: 1000
    });
    
    const data = await response.json();
    
    // Parse the response and convert markdown to HTML
    let answerText = data.choices[0].message.content.trim();
    
    // Convert markdown to HTML for display
    answerText = marked(answerText);
    
    return answerText;
    
  } catch (error) {
    console.error("Error generating answer:", error);
    throw new Error("Failed to generate answer from AI model");
  }
}
