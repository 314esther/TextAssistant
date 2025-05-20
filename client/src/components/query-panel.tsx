import { useState, useRef, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document, Query, Answer, Source } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface QueryPanelProps {
  document: Document | null;
  question: string | null;
  answer: Answer | null;
  isLoadingAnswer: boolean;
  questionHistory: Query[];
  onSubmit: (question: string) => void;
  onQuestionSelect: (question: string) => void;
}

export default function QueryPanel({
  document,
  question,
  answer,
  isLoadingAnswer,
  questionHistory,
  onSubmit,
  onQuestionSelect
}: QueryPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!document) {
      toast({
        title: "No document loaded",
        description: "Please upload a document first",
        variant: "destructive"
      });
      return;
    }
    
    const trimmedQuestion = inputValue.trim();
    if (!trimmedQuestion) {
      toast({
        title: "Empty question",
        description: "Please enter a question",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(trimmedQuestion);
  };
  
  const handleClearQuestion = () => {
    setInputValue("");
    inputRef.current?.focus();
  };
  
  const handleCopyAnswer = () => {
    if (answer) {
      navigator.clipboard.writeText(answer.text)
        .then(() => {
          toast({
            title: "Copied to clipboard",
            duration: 2000,
          });
        })
        .catch(() => {
          toast({
            title: "Failed to copy",
            description: "Couldn't copy to clipboard",
            variant: "destructive"
          });
        });
    }
  };
  
  const handleRegenerateAnswer = () => {
    if (question) {
      onSubmit(question);
    }
  };
  
  const handleExampleQuestion = (exampleQuestion: string) => {
    setInputValue(exampleQuestion);
    inputRef.current?.focus();
  };
  
  const handleHistoryQuestion = (historyQuestion: string) => {
    onQuestionSelect(historyQuestion);
  };
  
  return (
    <div className="lg:w-2/3">
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ask about your document</h2>
          
          {/* Empty State */}
          {!document && (
            <div className="text-center py-12 max-w-md mx-auto">
              <div className="bg-primary-50 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-2xl text-primary-600">search</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload a document to get started</h3>
              <p className="text-gray-500 mb-6">Upload a document and ask any questions about its content. The AI will search through the document and provide relevant answers.</p>
              <div className="space-y-4">
                <div 
                  className="border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleExampleQuestion("What are the main characters in this book?")}
                >
                  <p className="text-gray-700">"What are the main characters in this book?"</p>
                </div>
                <div 
                  className="border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleExampleQuestion("Summarize the key arguments in chapter 3.")}
                >
                  <p className="text-gray-700">"Summarize the key arguments in chapter 3."</p>
                </div>
                <div 
                  className="border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleExampleQuestion("What evidence supports the author's conclusion?")}
                >
                  <p className="text-gray-700">"What evidence supports the author's conclusion?"</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Query Interface */}
          {document && (
            <div>
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex items-center space-x-2">
                  <div className="flex-grow relative">
                    <input 
                      type="text" 
                      ref={inputRef}
                      placeholder="Ask a question about your document..."
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 pr-10"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    {inputValue && (
                      <button 
                        type="button" 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={handleClearQuestion}
                        aria-label="Clear question"
                      >
                        <span className="material-icons">close</span>
                      </button>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center"
                    disabled={isLoadingAnswer}
                  >
                    <span className="material-icons mr-1">send</span>
                    Ask
                  </Button>
                </div>
              </form>

              {/* Answer Loading State */}
              {isLoadingAnswer && (
                <div>
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <p className="font-medium text-gray-900 mb-2">{question}</p>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="animate-pulse flex space-x-2">
                      <div className="rounded-full bg-gray-200 h-2 w-2"></div>
                      <div className="rounded-full bg-gray-300 h-2 w-2"></div>
                      <div className="rounded-full bg-gray-200 h-2 w-2"></div>
                    </div>
                    <p className="text-gray-500 text-sm">Searching document for relevant information...</p>
                  </div>
                </div>
              )}

              {/* Answer Display */}
              {answer && !isLoadingAnswer && (
                <div>
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <p className="font-medium text-gray-900 mb-2">{question}</p>
                    <div className="flex text-sm space-x-4">
                      <button 
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                        onClick={handleCopyAnswer}
                      >
                        <span className="material-icons text-sm mr-1">content_copy</span>
                        Copy
                      </button>
                      <button 
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                        onClick={handleRegenerateAnswer}
                      >
                        <span className="material-icons text-sm mr-1">refresh</span>
                        Regenerate
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div 
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: answer.text }}
                    />
                  </div>

                  {answer.sources.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className="material-icons text-sm mr-1">text_snippet</span>
                        Sources from document
                      </h3>
                      
                      {answer.sources.map((source: Source, index: number) => (
                        <div 
                          key={index}
                          className={`bg-gray-50 rounded-lg p-4 mb-3 document-excerpt ${index === 0 ? 'answer-highlight' : ''}`}
                          style={{
                            fontFamily: "'Menlo', 'Monaco', 'Consolas', monospace",
                            fontSize: "14px",
                            lineHeight: "1.5",
                            ...(index === 0 ? {
                              backgroundColor: "rgba(99, 102, 241, 0.1)",
                              borderLeft: "3px solid #4f46e5"
                            } : {})
                          }}
                        >
                          {source.pageNumber && (
                            <p className="text-xs text-gray-500 mb-1">Page {source.pageNumber}</p>
                          )}
                          <p className="text-gray-700">{source.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Query History */}
              {questionHistory.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="material-icons text-sm mr-1">history</span>
                    Recent Questions
                  </h3>
                  
                  <div className="space-y-2">
                    {questionHistory.map((item: Query) => (
                      <button 
                        key={item.id}
                        className="text-left w-full py-2 px-3 rounded-md hover:bg-gray-50 text-gray-700 flex items-center" 
                        onClick={() => handleHistoryQuestion(item.text)}
                      >
                        <span className="material-icons text-gray-400 mr-2 text-sm">help_outline</span>
                        <span className="truncate">{item.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Panel */}
      <div className="bg-primary-50 rounded-lg p-4 text-sm">
        <div className="flex items-start">
          <span className="material-icons text-primary-600 mr-2 mt-0.5">info</span>
          <div>
            <p className="text-gray-700 mb-1">DocuQuery processes documents entirely in your browser.</p>
            <p className="text-gray-500">Your documents are never uploaded to any server. Queries are sent to the AI model but source text remains private.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
