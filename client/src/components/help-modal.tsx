import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4 flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold text-gray-900">How to use DocuQuery</DialogTitle>
          <DialogClose className="text-gray-500 hover:text-gray-700">
            <span className="material-icons">close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="prose prose-sm max-w-none">
          <p>DocuQuery allows you to ask questions about your document and get AI-generated answers based on its content.</p>
          
          <h3>Getting Started</h3>
          <ol>
            <li>Upload your document (PDF, TXT, or DOCX format)</li>
            <li>Wait for the document to be processed</li>
            <li>Type your question in the query box</li>
            <li>Review the answer and sources from the document</li>
          </ol>
          
          <h3>How it Works</h3>
          <p>DocuQuery uses RAG (Retrieval Augmented Generation) to:</p>
          <ul>
            <li>Process and split your document into chunks</li>
            <li>Create embeddings (numerical representations) of each chunk</li>
            <li>Match your question with the most relevant chunks</li>
            <li>Send these chunks to an AI model to generate an accurate answer</li>
          </ul>
          
          <h3>Privacy</h3>
          <p>Your document is processed entirely in your browser. It is not uploaded to any server. Only your question and the most relevant chunks are sent to the AI model for answer generation.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
