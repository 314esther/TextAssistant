import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DocumentSidebar, { PreloadedDocument } from "@/components/document-sidebar";
import ChatInterface from "@/components/chat-interface";
import HelpModal from "@/components/help-modal";
import ErrorAlert from "@/components/error-alert";
import { Document, Query, Answer } from "@shared/schema";
import { useDocumentStore } from "@/hooks/use-document-store";
import { useQuestionHistory } from "@/hooks/use-question-history";
import { getPreloadedDocuments, loadPreloadedDocument } from "@/lib/document-loader";
import { Book, HelpCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preloadedDocuments, setPreloadedDocuments] = useState<PreloadedDocument[]>([]);
  const [selectedPreloadedDoc, setSelectedPreloadedDoc] = useState<PreloadedDocument | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  
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

  // Load the preloaded documents list on component mount
  useEffect(() => {
    async function loadDocuments() {
      try {
        const docs = await getPreloadedDocuments();
        setPreloadedDocuments(docs);
      } catch (err) {
        setError("Failed to load preloaded documents");
      }
    }
    
    loadDocuments();
  }, []);
  
  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleHelpOpen = () => setIsHelpModalOpen(true);
  const handleHelpClose = () => setIsHelpModalOpen(false);
  
  const handleErrorDismiss = () => setError(null);
  
  const handleUploadOpen = () => setIsUploadModalOpen(true);
  const handleUploadClose = () => setIsUploadModalOpen(false);
  
  const handleUpload = async (file: File) => {
    try {
      await uploadDocument(file);
      handleUploadClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process document");
    }
  };
  
  const handleDocumentSelect = async (preloadedDoc: PreloadedDocument) => {
    try {
      setSelectedPreloadedDoc(preloadedDoc);
      await loadPreloadedDocument(preloadedDoc.filename);
      if (isMobile) {
        setSidebarOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load document");
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="h-screen overflow-hidden">
      <header className="h-14 border-b flex items-center justify-between px-4 bg-white">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center">
            <Book className="h-6 w-6 text-primary-600 mr-2" />
            <h1 className="text-xl font-bold">DocuQuery</h1>
          </div>
        </div>
        
        <div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleHelpOpen}
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <div 
          className={`fixed inset-0 z-20 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          transition-transform duration-200 ease-in-out lg:relative lg:inset-0 lg:transform-none`}
        >
          {isMobile && (
            <div className="absolute right-4 top-3 z-30">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          
          <DocumentSidebar 
            preloadedDocuments={preloadedDocuments}
            onDocumentSelect={handleDocumentSelect}
            onUploadClick={handleUploadOpen}
            selectedDocumentId={selectedPreloadedDoc?.id || null}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            document={document}
            question={currentQuestion}
            answer={currentAnswer}
            isLoadingAnswer={isLoadingAnswer}
            questionHistory={questionHistory}
            onSubmit={askQuestion}
            onQuestionSelect={setQuestion}
          />
        </div>
      </div>
      
      {/* Modals */}
      <Dialog open={isUploadModalOpen} onOpenChange={handleUploadClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                const uploadInput = document.getElementById('file-upload');
                if (uploadInput) uploadInput.click();
              }}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.txt,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-50 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PDF, TXT, or DOCX (up to 20MB)</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <HelpModal isOpen={isHelpModalOpen} onClose={handleHelpClose} />
      
      <ErrorAlert 
        error={error} 
        onDismiss={handleErrorDismiss} 
      />
    </div>
  );
}
