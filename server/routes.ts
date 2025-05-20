import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Replicate from "replicate";
import path from "path";

// Format messages from OpenAI format to LLaMA prompt format
function formatMessagesForLlama(messages: any[]) {
  let prompt = "";
  
  // Extract system message if present
  const systemMessage = messages.find(msg => msg.role === "system");
  const userMessages = messages.filter(msg => msg.role === "user");
  
  // Add system message as context
  if (systemMessage) {
    prompt += systemMessage.content + "\n\n";
  }
  
  // Format the last user message as the main query
  if (userMessages.length > 0) {
    const lastUserMessage = userMessages[userMessages.length - 1];
    prompt += lastUserMessage.content;
  }
  
  return prompt;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from the documents directory
  app.use('/documents', (req, res, next) => {
    const options = {
      root: path.join(process.cwd(), 'documents'),
      dotfiles: 'deny' as 'deny',
      headers: {
        'Content-Type': 'text/plain',
      }
    };
    
    const fileName = req.path;
    res.sendFile(fileName, options, (err) => {
      if (err) {
        next(err);
      }
    });
  });
  // Replicate LLaMA proxy endpoint to avoid exposing API token to client
  app.post("/api/generate", async (req, res) => {
    try {
      const { 
        messages, 
        temperature = 0.7, 
        max_tokens = 1000 
      } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid request: messages array is required" });
      }
      
      // Get the API token from the environment
      const apiToken = process.env.REPLICATE_API_TOKEN;
      if (!apiToken) {
        return res.status(500).json({ message: "Replicate API token not configured" });
      }
      
      // Initialize Replicate client
      const replicate = new Replicate({
        auth: apiToken,
      });
      
      // Format the messages for Replicate's LLaMA model
      const prompt = formatMessagesForLlama(messages);
      
      // Call Replicate's LLaMA model
      const output: any = await replicate.run(
        "meta/llama-3-8b-instruct:dd8d943c1b902573eff68542273de4c9c8108b85a9db66be6dd3655821d8a393",
        {
          input: {
            prompt: prompt,
            max_new_tokens: max_tokens,
            temperature: temperature,
          }
        }
      );
      
      // Format response to match the OpenAI structure for compatibility
      const formattedResponse = {
        choices: [
          {
            message: {
              content: Array.isArray(output) ? output.join("") : String(output)
            }
          }
        ]
      };
      
      res.json(formattedResponse);
    } catch (error: any) {
      console.error("Replicate API error:", error);
      res.status(500).json({ message: `Error: ${error?.message || 'Unknown error occurred'}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
