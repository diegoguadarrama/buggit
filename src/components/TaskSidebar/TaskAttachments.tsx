import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Constants for storage limits
const MAX_FILE_SIZE_MB = 50;  // Maximum size per file in MB
const MAX_STORAGE_MB = 500;   // Maximum total storage per user in MB
const MB_TO_BYTES = 1024 * 1024;

interface TaskAttachmentsProps {
  taskId: string;
  attachments?: { name: string; url: string; type: string; size: number }[];
  onUpdate: (attachments: { name: string; url: string; type: string; size: number }[]) => void;
}

export const TaskAttachments = ({ taskId, attachments = [], onUpdate }: TaskAttachmentsProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const checkStorageQuota = async (fileSize: number): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check file size limit
      const fileSizeMB = fileSize / MB_TO_BYTES;
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${MAX_FILE_SIZE_MB}MB. Your file is ${fileSizeMB.toFixed(1)}MB.`,
          variant: "destructive",
        });
        return false;
      }

      // Get current storage usage
      const { data: usageData, error: usageError } = await supabase
        .from('storage_usage')
        .select('total_size, file_count')
        .eq('user_id', user.id)
        .single();

      if (usageError && usageError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking storage quota:', usageError);
        throw new Error('Could not verify storage quota');
      }

      const currentUsage = usageData?.total_size || 0;
      const currentUsageMB = currentUsage / MB_TO_BYTES;
      const newTotalUsageMB = currentUsageMB + fileSizeMB;

      // Check total storage limit
      if (newTotalUsageMB > MAX_STORAGE_MB) {
        toast({
          title: "Storage quota exceeded",
          description: `You have ${(MAX_STORAGE_MB - currentUsageMB).toFixed(1)}MB remaining. This file requires ${fileSizeMB.toFixed(1)}MB.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Error checking quota:', error);
      toast({
        title: "Error checking storage quota",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Check quota before starting upload
      const quotaOk = await checkStorageQuota(file.size);
      if (!quotaOk) return;

      setIsUploading(true);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `task-${taskId}-${user.id}-${crypto.randomUUID()}${fileExt ? `.${fileExt}` : ''}`;

      // Debug log
      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        taskId: taskId,
        userId: user.id
      });

      // Upload file with metadata in the correct field
      const { error: uploadError } = await supabase.storage
        .from("task-attachments")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
          duplex: 'half',
          metadata: {  // Changed from fileMetadata to metadata
            owner: user.id,
            size: file.size.toString(),
            contentType: file.type,
            task_id: taskId,
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(fileName);

      // Update attachments list
      const newAttachment = {
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size,
      };

      onUpdate([...attachments, newAttachment]);

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < MB_TO_BYTES) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / MB_TO_BYTES).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input 
          type="file" 
          onChange={handleFileUpload} 
          disabled={isUploading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      
      {isUploading && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span className="text-sm text-gray-500">Uploading...</span>
        </div>
      )}

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((attachment, index) => (
            <li 
              key={`${attachment.url}-${index}`} 
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <a 
                  href={attachment.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline truncate"
                  title={attachment.name}
                >
                  {attachment.name}
                </a>
                <span className="text-sm text-gray-500 shrink-0">
                  ({formatFileSize(attachment.size)})
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};