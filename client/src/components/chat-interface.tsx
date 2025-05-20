import { useState, useRef, FormEvent } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Send, Clipboard, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Document, Query, Answer, Source } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  document: Document | null;
  question: string | null;
  answer: Answer | null;
  isLoadingAnswer: boolean;
  questionHistory: Query[];
  onSubmit: (question: string) => void;
  onQuestionSelect: (question: string) => void;
}

export default function ChatInterface({
  document,
  question,
  answer,
  isLoadingAnswer,
  questionHistory,
  onSubmit,
  onQuestionSelect
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!document) {
      toast({
        title: "No document selected",
        description: "Please select or upload a document first",
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
    setInputValue("");
  };
  
  const handleClearQuestion = () => {
    setInputValue("");
    inputRef.current?.focus();
  };
  
  const handleCopyAnswer = () => {
    if (answer) {
      navigator.clipboard.writeText(answer.text.replace(/<[^>]*>/g, ''))
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
  
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea ref={chatContainerRef} className="flex-1 p-4">
          {!document && (
            <div className="max-w-2xl mx-auto my-16 text-center">
              <div className="bg-primary-50 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-primary-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Select a document to get started</h2>
              <p className="text-gray-600 mb-8">
                Choose a document from the library or upload your own document to start asking questions.
              </p>
            </div>
          )}
          
          {document && (
            <div className="space-y-8 max-w-3xl mx-auto pb-4">
              {/* Question/Answer pairs */}
              {questionHistory.map((item: Query) => {
                const historyAnswer = item.id === answer?.queryId ? answer : null;
                return (
                  <div key={item.id} className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          className="w-5 h-5 text-gray-600"
                        >
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 16v-4M12 8h.01"/>
                        </svg>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4 relative w-full">
                        <p className="text-gray-800">{item.text}</p>
                      </div>
                    </div>
                    
                    {historyAnswer && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            className="w-5 h-5 text-primary-600"
                          >
                            <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                          </svg>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 w-full">
                          <div className="prose max-w-none text-gray-700 mb-3" dangerouslySetInnerHTML={{ __html: historyAnswer.text }} />
                          
                          <div className="flex gap-2 mt-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs flex items-center gap-1" 
                              onClick={handleCopyAnswer}
                            >
                              <Clipboard className="h-3 w-3" />
                              Copy
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs flex items-center gap-1" 
                              onClick={handleRegenerateAnswer}
                            >
                              <RefreshCw className="h-3 w-3" />
                              Regenerate
                            </Button>
                          </div>
                          
                          {historyAnswer.sources.length > 0 && (
                            <div className="mt-4 border-t pt-3">
                              <p className="text-xs font-medium text-gray-500 mb-2">Sources:</p>
                              <div className="space-y-2">
                                {historyAnswer.sources.map((source: Source, index: number) => (
                                  <div 
                                    key={index}
                                    className={cn(
                                      "bg-gray-50 rounded-md p-3 text-xs text-gray-700 border border-gray-100",
                                      index === 0 && "border-l-2 border-l-primary-500"
                                    )}
                                  >
                                    {source.pageNumber && (
                                      <p className="text-xs text-gray-500 mb-1">Page {source.pageNumber}</p>
                                    )}
                                    <p>{source.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Current question with loading state */}
              {question && isLoadingAnswer && !questionHistory.find(q => q.text === question) && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      className="w-5 h-5 text-gray-600"
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 w-full">
                    <p className="text-gray-800">{question}</p>
                    <div className="mt-2 flex items-center text-gray-500">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="ml-2 text-sm">Searching document for relevant information...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
      
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                ref={inputRef}
                placeholder={document ? "Ask a question about the document..." : "Select a document to start asking questions"}
                className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={!document}
              />
              {inputValue && (
                <button
                  type="button"
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={handleClearQuestion}
                  aria-label="Clear question"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={!document || isLoadingAnswer}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            Ask questions about the document content. For best results, be specific.
          </div>
        </form>
      </div>
    </div>
  );
}