import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Paperclip, X, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TaskAttachmentsProps {
  attachments: string[];
  onAttachmentsChange: (attachments: string[]) => void;
}

export const TaskAttachments = ({ attachments, onAttachmentsChange }: TaskAttachmentsProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const isImageFile = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
  };

  const getFileName = (url: string) => decodeURIComponent(url.split('/').pop() || '');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const newFiles = Array.from(e.target.files);
    const uploadPromises = newFiles.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      try {
        const { error: uploadError } = await supabase.storage
          .from('task-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('task-attachments')
          .getPublicUrl(filePath);

        return publicUrl;
      } catch (error: any) {
        console.error('Upload error:', error);
        toast({
          title: `Failed to upload ${file.name}`,
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
    });

    const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
    onAttachmentsChange([...attachments, ...uploadedUrls]);
    setUploading(false);
    
    if (uploadedUrls.length > 0) {
      toast({
        title: "Files uploaded successfully",
        description: `${uploadedUrls.length} file(s) uploaded`,
      });
    }
    
    // Reset the input
    e.target.value = '';
  };

  const removeAttachment = (urlToRemove: string) => {
    onAttachmentsChange(attachments.filter(url => url !== urlToRemove));
  };

  const downloadFile = async (url: string) => {
    const fileName = getFileName(url);
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Attachments</label>
      <div className="space-y-2">
        {attachments.map((url, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {isImageFile(url) ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <img 
                      src={url} 
                      alt={getFileName(url)}
                      className="h-8 w-8 object-cover rounded cursor-pointer"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <img 
                      src={url} 
                      alt={getFileName(url)}
                      className="w-full h-auto"
                    />
                  </DialogContent>
                </Dialog>
              ) : (
                <Paperclip className="h-4 w-4 text-gray-500 flex-shrink-0" />
              )}
              <span className="text-sm truncate">
                {getFileName(url)}
              </span>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => downloadFile(url)}
              >
                <Download className="h-4 w-4" />
              </Button>
              {isImageFile(url) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <img 
                      src={url} 
                      alt={getFileName(url)}
                      className="w-full h-auto"
                    />
                  </DialogContent>
                </Dialog>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(url)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="cursor-pointer"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
};