import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Paperclip, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";

interface TaskAttachmentsProps {
  attachments: string[];
  onAttachmentsChange: (attachments: string[]) => void;
}

export const TaskAttachments = ({ attachments, onAttachmentsChange }: TaskAttachmentsProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;
    
    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);

      onAttachmentsChange([...attachments, publicUrl]);
      toast({
        title: "File uploaded successfully",
        description: file.name,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  const removeAttachment = (urlToRemove: string) => {
    onAttachmentsChange(attachments.filter(url => url !== urlToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Attachments</label>
      <div className="space-y-2">
        {attachments.map((url, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Paperclip className="h-4 w-4 text-gray-500" />
              <span className="text-sm truncate max-w-[200px]">
                {decodeURIComponent(url.split('/').pop() || '')}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeAttachment(url)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
};