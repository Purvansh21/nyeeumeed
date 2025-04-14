
import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUploader = ({
  onFileSelected,
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.zip",
  maxSizeMB = 10
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      validateAndProcessFile(files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    setErrorMessage("");
    
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }
    
    // Validate file type based on extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const acceptedTypes = accept.split(',').map(type => 
      type.trim().startsWith('.') ? type.trim().substring(1) : type.trim()
    );
    
    if (!acceptedTypes.includes(fileExtension) && accept !== "*") {
      setErrorMessage(`Invalid file type. Accepted types are: ${accept}`);
      return;
    }
    
    // File is valid, pass it to parent component
    onFileSelected(file);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud className="h-8 w-8 text-gray-400" />
          <div className="flex flex-col space-y-1 text-sm text-gray-500">
            <span className="font-medium">Click to upload</span>
            <span>or drag and drop</span>
          </div>
          <div className="text-xs text-gray-400">
            Supported formats: PDFs, Documents, Spreadsheets, Videos, Audio
          </div>
          <div className="text-xs text-gray-400">
            Max size: {maxSizeMB}MB
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileInputChange}
        />
      </div>
      
      {errorMessage && (
        <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};
