// src/components/TaskSidebar/TaskForm.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TaskDetails } from './TaskDetails';
import type { TaskType } from '@/types/task';
import { MAX_FILE_SIZE, formatFileSize } from '@/lib/utils';
import { useProject } from '@/components/ProjectContext';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface TaskFormProps {
  task?: TaskType | null;
  onSubmit: (taskData: Partial<TaskType>) => Promise<void>;
  onCancel: () => void;
  projectId?: string;
}

export const TaskForm = ({
  task,
  onSubmit,
  onCancel,
  projectId,
}: TaskFormProps) => {
  const { currentProject } = useProject();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [stage, setStage] = useState(task?.stage || 'To Do');
  const [responsible, setResponsible] = useState(task?.assignee || 'unassigned');
  const [attachments, setAttachments] = useState<string[]>(task?.attachments || []);
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Handle paste events for the description field
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          e.preventDefault(); // Prevent image from being pasted into textarea
          const file = item.getAsFile();
          if (file) {
            // Create a preview of the pasted image
            toast({
              title: "Processing image...",
              description: `Uploading ${file.name || 'pasted image'}`,
            });
            await handleFileUpload(file);
          }
        }
      }
    };

    // Add paste event listener to the description textarea
    const textarea = document.querySelector('textarea[name="description"]');
    textarea?.addEventListener('paste', handlePaste);

    return () => {
      textarea?.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleFileUpload = async (file: File) => {
    // File size check
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}. Current file size: ${formatFileSize(file.size)}`,
        variant: "destructive",
      });
      return;
    }

    // For pasted images without extension, default to PNG
    const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'png';
    const timestamp = new Date().getTime();
    const filePath = `${crypto.randomUUID()}-${timestamp}.${fileExt}`;
    
    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type // Ensure correct content type is set
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);

      setAttachments(prev => [...prev, publicUrl]);
      toast({
        title: "File uploaded successfully",
        description: `${file.name || 'Image'} (${formatFileSize(file.size)})`,
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
    }
  };

  const removeAttachment = async (urlToRemove: string) => {
    try {
      // Extract file path from URL
      const filePath = urlToRemove.split('/').pop();
      if (!filePath) throw new Error('Invalid file path');

      const { error } = await supabase.storage
        .from('task-attachments')
        .remove([filePath]);

      if (error) throw error;

      setAttachments(prev => prev.filter(url => url !== urlToRemove));
      toast({
        title: "Attachment removed",
        description: "File has been removed successfully",
      });
    } catch (error: any) {
      console.error('Remove error:', error);
      toast({
        title: "Remove failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <ScrollArea className="h-full px-6">
      <form className="space-y-6 pb-6">
        <TaskDetails
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          priority={priority}
          setPriority={setPriority}
          stage={stage}
          setStage={setStage}
          responsible={responsible}
          setResponsible={setResponsible}
          dueDate={dueDate}
          setDueDate={setDueDate}
          projectId={projectId || currentProject?.id}
        />

        {/* Attachments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Attachments</h3>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {attachments.map((url, index) => (
              <div
                key={index}
                className="relative group rounded-lg border overflow-hidden"
              >
                {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeAttachment(url)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={async (e) => {
                e.preventDefault();
                await onSubmit({
                  title,
                  description,
                  priority,
                  stage,
                  assignee: responsible,
                  attachments,
                  due_date: dueDate ? new Date(dueDate + 'T00:00:00.000Z').toISOString() : undefined,
                });
              }}
            >
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </div>
      </form>
    </ScrollArea>
  );
};
