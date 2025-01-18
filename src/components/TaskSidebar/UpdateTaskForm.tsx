import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import { TaskDetails } from "./TaskDetails";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TaskType, Stage } from "@/types/task";
import { parseISO, isValid } from "date-fns";
import { useProject } from "../ProjectContext";

interface UpdateTaskFormProps {
  task: TaskType;
  onSubmit: (taskData: Partial<TaskType>) => Promise<void>;
  onCancel: () => void;
}

export const UpdateTaskForm = ({ 
  task, 
  onSubmit, 
  onCancel 
}: UpdateTaskFormProps) => {
  const { currentProject } = useProject();
  // Format the initial due date if it exists, accounting for timezone
  const initialDueDate = task.due_date ? task.due_date.split('T')[0] : "";

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task.priority);
  const [stage, setStage] = useState<Stage>(task.stage);
  const [responsible, setResponsible] = useState(task.assignee || "");
  const [attachments, setAttachments] = useState<string[]>(task.attachments || []);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setStage(task.stage);
      setResponsible(task.assignee || "");
      setAttachments(task.attachments || []);
      // Just use the date part from the stored date
      setDueDate(task.due_date ? task.due_date.split('T')[0] : "");
    }
  }, [task]);

  const handleFileUpload = async (file: File) => {
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

      setAttachments(prev => [...prev, publicUrl]);
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
        // Create a date object and ensure it's at noon UTC
        const date = new Date(dueDate);
        date.setUTCHours(12, 0, 0, 0);
        formattedDate = date.toISOString();
      } catch (error) {
        console.error('Error formatting date:', error);
        toast({
          title: "Error updating task",
          description: "Invalid date format",
          variant: "destructive",
        });
        return;
      }
    }

    const updatedTask: TaskType = {
      ...task,
      title,
      description,
      priority,
      stage,
      assignee: responsible,
      attachments,
      due_date: formattedDate,
    };

    await onSubmit(updatedTask);
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6">
          <div className="space-y-6 py-4">
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
              task={task}
              projectId={currentProject?.id}
            />
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Update Task"}
          </Button>
        </div>
      </div>
    </form>
  );
};