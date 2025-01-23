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

      // Create file options with metadata
      const fileOptions = {
        cacheControl: '3600',
        upsert: false
      };

      // Upload file with metadata
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .upload(`${taskId}/${file.name}`, file, {
          ...fileOptions,
          metadata: {
            size: file.size.toString(), // Convert size to string
            owner: user.id,
            taskId: taskId,
            contentType: file.type
          }
        });

      if (error) throw error;

      if (data) {
        // Debug log
        console.log('Upload successful:', data);

        const { data: publicUrl } = supabase.storage
          .from('task-attachments')
          .getPublicUrl(data.path);

        const newAttachment = {
          name: file.name,
          url: publicUrl.publicUrl,
          type: file.type,
          size: file.size,
        };

        onUpdate([...(attachments || []), newAttachment]);
        
        // Verify storage usage update
        const { data: usageData, error: usageError } = await supabase
          .from('storage_usage')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('Storage usage after upload:', usageData);

        toast({
          title: "File uploaded",
          description: "Your file has been uploaded successfully.",
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={handleFileUpload} 
        disabled={isUploading}
        className="mb-2"
      />
      {isUploading && <div>Uploading...</div>}
      <ul className="space-y-2">
        {attachments.map((attachment) => (
          <li key={attachment.url} className="flex items-center gap-2">
            <a 
              href={attachment.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {attachment.name}
            </a>
            <span className="text-sm text-gray-500">
              ({Math.round(attachment.size / 1024)} KB)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
