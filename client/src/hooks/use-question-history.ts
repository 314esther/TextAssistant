import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Document, Query, Answer, Source } from "@shared/schema";
import { generateAnswer } from "@/lib/llm";
import { findRelevantChunks } from "@/lib/rag";

export function useQuestionHistory(document: Document | null) {
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [questionHistory, setQuestionHistory] = useState<Query[]>([]);
  
  const askQuestion = useCallback(async (question: string) => {
    if (!document) return;
    
    setCurrentQuestion(question);
    setIsLoadingAnswer(true);
    
    try {
      // Find relevant chunks from the document
      const relevantChunks = await findRelevantChunks(question, document.id);
      
      // Generate answer using LLM
      const answerText = await generateAnswer(question, relevantChunks);
      
      // Create sources from relevant chunks
      const sources: Source[] = relevantChunks.map(chunk => ({
        chunkId: chunk.id,
        text: chunk.text,
        pageNumber: chunk.metadata?.pageNumber,
        score: chunk.score
      }));
      
      // Create query object
      const queryId = uuidv4();
      const query: Query = {
        id: queryId,
        documentId: document.id,
        text: question,
        createdAt: new Date()
      };
      
      // Create answer object
      const answer: Answer = {
        id: uuidv4(),
        queryId,
        text: answerText,
        sources,
        createdAt: new Date()
      };
      
      setCurrentAnswer(answer);
      
      // Add to history if not already there
      setQuestionHistory(prev => {
        const exists = prev.some(q => q.text === question);
        if (exists) return prev;
        return [query, ...prev.slice(0, 4)]; // Keep last 5 questions
      });
    } catch (error) {
      console.error("Error generating answer:", error);
      throw error;
    } finally {
      setIsLoadingAnswer(false);
    }
  }, [document]);
  
  const setQuestion = useCallback((question: string) => {
    setCurrentQuestion(question);
    askQuestion(question);
  }, [askQuestion]);
  
  return {
    currentQuestion,
    currentAnswer,
    isLoadingAnswer,
    questionHistory,
    askQuestion,
    setQuestion
  };
}
