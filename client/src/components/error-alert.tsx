import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
}

export default function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  if (!error) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <AlertDescription className="text-sm text-red-700">
              {error}
            </AlertDescription>
          </div>
          <div className="ml-auto pl-3">
            <button 
              type="button" 
              className="text-red-500"
              onClick={onDismiss}
              aria-label="Dismiss error"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Alert>
    </div>
  );
}
