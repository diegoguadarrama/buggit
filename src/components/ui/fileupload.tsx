// src/components/ui/file-upload.tsx

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatFileSize, MAX_FILE_SIZE } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploading: boolean;
  accept?: Record<string, string[]>;
}

export const FileUpload = ({ onFileUpload, uploading, accept }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}. Current file size: ${formatFileSize(file.size)}`,
          variant: "destructive",
        });
        return;
      }
      onFileUpload(file);
    }
  }, [onFileUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
    multiple: false,
    accept,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-colors duration-200 relative
        ${dragActive || isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <div className="flex items-center justify-center">
          {uploading ? (
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <div className="text-sm text-gray-600">
          {uploading ? (
            <p>Uploading file...</p>
          ) : (
            <>
              <p className="font-medium">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
