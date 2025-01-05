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
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .upload(`${taskId}/${file.name}`, file);

      if (error) throw error;

      if (data) {
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
      <input type="file" onChange={handleFileUpload} disabled={isUploading} />
      <ul>
        {attachments.map((attachment) => (
          <li key={attachment.url}>
            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
              {attachment.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};