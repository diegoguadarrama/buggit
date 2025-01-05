import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import { TaskDetails } from "./TaskDetails";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TaskType, Stage } from "@/types/task";

interface TaskFormProps {
  defaultStage: Stage;
  onSubmit: (taskData: Partial<TaskType>) => Promise<void>;
  onCancel: () => void;
}

export const TaskForm = ({ 
  defaultStage, 
  onSubmit, 
  onCancel 
}: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [stage, setStage] = useState<Stage>(defaultStage);
  const [responsible, setResponsible] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
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

      setAttachments(prev => [...prev, publicUrl]);
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
      e.target.value = '';
    }
  };

  const removeAttachment = (urlToRemove: string) => {
    setAttachments(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Partial<TaskType> = {
      title,
      description,
      priority,
      stage,
      assignee: responsible,
      attachments,
      due_date: dueDate ? new Date(dueDate + 'T00:00:00.000Z').toISOString() : undefined,
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
            onCancel={onCancel}
            onSubmit={handleSubmit}
            task={null}
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
            {uploading ? "Uploading..." : "Add Task"}
          </Button>
        </div>
      </div>
    </form>
  );
};