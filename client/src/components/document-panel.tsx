import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Document } from "@shared/schema";

interface DocumentPanelProps {
  document: Document | null;
  isProcessing: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

export default function DocumentPanel({ 
  document, 
  isProcessing, 
  onUpload, 
  onRemove 
}: DocumentPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Set up processing status messages and progress update
  if (isProcessing && processingProgress < 100) {
    // This simulates progress updates
    const statusMessages = [
      'Extracting text from document...',
      'Splitting text into chunks...',
      'Generating embeddings...',
      'Creating search index...',
      'Processing complete!'
    ];
    
    setTimeout(() => {
      const newProgress = Math.min(processingProgress + 5, 100);
      setProcessingProgress(newProgress);
      
      const statusIndex = Math.min(Math.floor(newProgress / 20), statusMessages.length - 1);
      setProcessingStatus(statusMessages[statusIndex]);
    }, 200);
  }
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndUploadFile(file);
    }
  };
  
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndUploadFile(file);
    }
  };
  
  const validateAndUploadFile = (file: File) => {
    const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Unsupported file type. Please upload a PDF, TXT, or DOCX file.');
    }
    
    if (file.size > 20 * 1024 * 1024) { // 20MB
      throw new Error('File is too large. Maximum size is 20MB.');
    }
    
    onUpload(file);
    setProcessingProgress(0);
    setProcessingStatus('Starting document processing...');
  };
  
  return (
    <div className="lg:w-1/3">
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document</h2>
          
          {/* Upload State */}
          {!document && !isProcessing && (
            <div className="block">
              <div 
                className={`file-upload-area rounded-lg p-8 text-center cursor-pointer ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleFileSelect}
                style={{ 
                  border: '2px dashed #d1d5db', 
                  transition: 'all 0.2s ease',
                  borderColor: isDragging ? '#6366f1' : '#d1d5db',
                  backgroundColor: isDragging ? '#eef2ff' : 'transparent'
                }}
              >
                <span className="material-icons text-4xl text-gray-400 mb-2">upload_file</span>
                <p className="text-gray-500 mb-2">Drag & drop your document here</p>
                <p className="text-sm text-gray-400 mb-4">Supports PDF, TXT, DOCX files up to 20MB</p>
                <Button
                  className="bg-primary-600 hover:bg-primary-700 text-white inline-flex items-center"
                >
                  <span className="material-icons text-sm mr-1">add</span>
                  Select File
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf,.txt,.docx" 
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}
          
          {/* Processing State */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-700 mb-2 font-medium">Processing document...</p>
              <p className="text-sm text-gray-500">{processingStatus}</p>
              <div className="w-full mt-4">
                <Progress value={processingProgress} className="h-2" />
              </div>
            </div>
          )}
          
          {/* Document Loaded State */}
          {document && !isProcessing && (
            <>
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">{document.name}</p>
                    <p className="text-sm text-gray-500">
                      {document.pages ? `${document.pages} pages · ` : ''}
                      {document.words ? `${document.words.toLocaleString()} words` : ''}
                    </p>
                  </div>
                  <button 
                    className="text-gray-400 hover:text-gray-700" 
                    onClick={onRemove}
                    aria-label="Remove document"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Document Analysis</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Text chunks</span>
                    <span className="text-sm font-medium text-gray-900">{document.chunks?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Embeddings</span>
                    <span className="text-sm font-medium text-gray-900">{document.embeddings?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Indexed</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center">
                      <span className="material-icons text-green-500 text-sm mr-1">check_circle</span>
                      Complete
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="chunk-size" className="text-sm text-gray-700 block mb-1">Chunk Size</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="chunk-size" className="w-full">
                        <SelectValue placeholder="Select chunk size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (better for specific facts)</SelectItem>
                        <SelectItem value="medium">Medium (balanced)</SelectItem>
                        <SelectItem value="large">Large (better for summaries)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="model" className="text-sm text-gray-700 block mb-1">Model</Label>
                    <Select defaultValue="llama-3-8b">
                      <SelectTrigger id="model" className="w-full">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="llama-3-8b">LLaMA 3 (8B)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
