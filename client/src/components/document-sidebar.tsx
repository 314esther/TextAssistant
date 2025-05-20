import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadCloud, Book, File, MoreVertical, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PreloadedDocument {
  id: string;
  title: string;
  filename: string;
  category?: string;
  icon?: React.ReactNode;
}

interface DocumentSidebarProps {
  preloadedDocuments: PreloadedDocument[];
  onDocumentSelect: (document: PreloadedDocument) => void;
  onUploadClick: () => void;
  selectedDocumentId: string | null;
}

export default function DocumentSidebar({
  preloadedDocuments,
  onDocumentSelect,
  onUploadClick,
  selectedDocumentId
}: DocumentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredDocuments = preloadedDocuments.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.category && doc.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const categories = [...new Set(preloadedDocuments.map(doc => doc.category).filter(Boolean))];
  
  return (
    <div className="w-64 border-r border-gray-200 h-screen flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg flex items-center space-x-2">
          <Book className="h-5 w-5 text-primary-600" />
          <span>Document Library</span>
        </h2>
      </div>
      
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      <div className="p-3">
        <Button onClick={onUploadClick} className="w-full flex items-center justify-center gap-2">
          <UploadCloud className="h-4 w-4" />
          <span>Upload Document</span>
        </Button>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1">
        <div className="p-3">
          {categories.length > 0 && (
            <>
              {categories.map(category => (
                <div key={category} className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{category}</h3>
                  
                  <div className="space-y-1">
                    {filteredDocuments
                      .filter(doc => doc.category === category)
                      .map(doc => (
                        <DocumentItem 
                          key={doc.id} 
                          document={doc}
                          isSelected={doc.id === selectedDocumentId}
                          onSelect={() => onDocumentSelect(doc)}
                        />
                      ))}
                  </div>
                </div>
              ))}
              
              <Separator className="my-3" />
            </>
          )}
          
          <div className="space-y-1">
            {filteredDocuments
              .filter(doc => !doc.category)
              .map(doc => (
                <DocumentItem 
                  key={doc.id} 
                  document={doc}
                  isSelected={doc.id === selectedDocumentId} 
                  onSelect={() => onDocumentSelect(doc)}
                />
              ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

interface DocumentItemProps {
  document: PreloadedDocument;
  isSelected: boolean;
  onSelect: () => void;
}

function DocumentItem({ document, isSelected, onSelect }: DocumentItemProps) {
  return (
    <div 
      className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer text-sm ${
        isSelected 
          ? 'bg-primary-100 text-primary-900' 
          : 'hover:bg-gray-100'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-2 truncate">
        {document.icon || <File className="h-4 w-4 flex-shrink-0 text-gray-500" />}
        <span className="truncate">{document.title}</span>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>Copy Link</DropdownMenuItem>
          <DropdownMenuItem>Export</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}