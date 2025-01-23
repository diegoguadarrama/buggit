import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaskAttachmentsProps {
  taskId: string;
  attachments?: { name: string; url: string; type: string; size: number }[];
  onUpdate: (attachments: { name: string; url: string; type: string; size: number }[]) => void;
}

export const TaskAttachments = ({ taskId, attachments = [], onUpdate }: TaskAttachmentsProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Debug log
      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        taskId: taskId,
        userId: user.id
      });

      // Create unique filename to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `task-${taskId}-${user.id}-${crypto.randomUUID()}${fileExt ? `.${fileExt}` : ''}`;

      // Upload file with metadata
      const { error: uploadError } = await supabase.storage
        .from("task-attachments")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            owner: user.id,        // Must match the trigger's expected format
            size: file.size.toString(),  // Must be a string
            contentType: file.type,
            task_id: taskId,
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        });

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(fileName);

      // Create new attachment object
      const newAttachment = {
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size,
      };

      // Update attachments list
      onUpdate([...attachments, newAttachment]);

      // Verify storage usage update
      const { data: usageData, error: usageError } = await supabase
        .from('storage_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (usageError) {
        console.warn('Could not fetch storage usage:', usageError);
      } else {
        console.log('Storage usage after upload:', usageData);
      }

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
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
