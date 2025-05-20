import { useState } from "react";
import AppHeader from "@/components/app-header";
import DocumentPanel from "@/components/document-panel";
import QueryPanel from "@/components/query-panel";
import HelpModal from "@/components/help-modal";
import ErrorAlert from "@/components/error-alert";
import { Document, Query, Answer } from "@shared/schema";
import { useDocumentStore } from "@/hooks/use-document-store";
import { useQuestionHistory } from "@/hooks/use-question-history";

export default function Home() {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    document, 
    isProcessing, 
    uploadDocument, 
    removeDocument 
  } = useDocumentStore();
  
  const { 
    currentQuestion, 
    currentAnswer, 
    isLoadingAnswer, 
    questionHistory, 
    askQuestion, 
    setQuestion 
  } = useQuestionHistory(document);

  const handleHelpOpen = () => setIsHelpModalOpen(true);
  const handleHelpClose = () => setIsHelpModalOpen(false);
  
  const handleErrorDismiss = () => setError(null);
  
  const handleUpload = async (file: File) => {
    try {
      await uploadDocument(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process document");
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader onHelpClick={handleHelpOpen} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:flex lg:gap-8">
          <DocumentPanel
            document={document}
            isProcessing={isProcessing}
            onUpload={handleUpload}
            onRemove={removeDocument}
          />
          
          <QueryPanel
            document={document}
            question={currentQuestion}
            answer={currentAnswer}
            isLoadingAnswer={isLoadingAnswer}
            questionHistory={questionHistory}
            onSubmit={askQuestion}
            onQuestionSelect={setQuestion}
          />
        </div>
      </main>
      
      <HelpModal isOpen={isHelpModalOpen} onClose={handleHelpClose} />
      
      <ErrorAlert 
        error={error} 
        onDismiss={handleErrorDismiss} 
      />
    </div>
  );
}
