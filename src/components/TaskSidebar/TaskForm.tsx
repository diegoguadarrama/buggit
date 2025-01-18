// src/components/TaskSidebar/TaskForm.tsx
// taskform

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TaskDetails } from './TaskDetails';
import type { TaskType } from '@/types/task';
import { MAX_FILE_SIZE, formatFileSize } from '@/lib/utils';
import { useProject } from '@/components/ProjectContext';

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

    const fileExt = file.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;
    
    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);

      setAttachments(prev => [...prev, publicUrl]);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} (${formatFileSize(file.size)})`,
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
      console.error('Remove attachment error:', error);
      toast({
        title: "Error removing attachment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let formattedDate = null;
    if (dueDate) {
      try {
        formattedDate = `${dueDate}T12:00:00.000Z`;
      } catch (error) {
        console.error('Error formatting date:', error);
        toast({
          title: "Invalid date",
          description: "Please check the due date format",
          variant: "destructive",
        });
        return;
      }
    }

    const taskData: Partial<TaskType> = {
      title,
      description,
      priority,
      stage,
      assignee: responsible === 'unassigned' ? null : responsible,
      attachments,
      due_date: formattedDate,
    };

    await onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-6">
          <TaskDetails
            title={title}
            description={description}
            priority={priority}
            stage={stage}
            responsible={responsible}
            attachments={attachments}
            dueDate={dueDate}
            uploading={uploading}
            setTitle={setTitle}
            setDescription={setDescription}
            setPriority={setPriority}
            setStage={setStage}
            setResponsible={setResponsible}
            setDueDate={setDueDate}
            handleFileUpload={handleFileUpload}
            removeAttachment={removeAttachment}
            projectId={projectId || currentProject?.id}
          />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : task ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </div>
    </form>
  );
};
