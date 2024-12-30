import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import { TaskDetails } from "./TaskDetails";
import { TaskComments } from "./TaskComments";
import type { TaskType, Stage } from "@/types/task";

interface TaskSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: Partial<TaskType>) => Promise<TaskType | null>;
  onTaskUpdate: (task: TaskType) => Promise<void>;
  defaultStage: Stage;
  task: TaskType | null;
}

export const TaskSidebar = ({ 
  open, 
  onOpenChange, 
  onTaskCreate, 
  onTaskUpdate,
  defaultStage, 
  task 
}: TaskSidebarProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [stage, setStage] = useState<Stage>(defaultStage);
  const [responsible, setResponsible] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setPriority("low");
      setStage(defaultStage);
      setResponsible("");
      setAttachments([]);
      setDueDate("");
    } else if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setStage(task.stage);
      setResponsible(task.assignee || "");
      setAttachments(task.attachments || []);
      setDueDate(task.due_date || "");
    } else {
      setStage(defaultStage);
    }
  }, [open, defaultStage, task]);

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
      due_date: dueDate || undefined
    };

    if (task) {
      await onTaskUpdate({ ...task, ...taskData });
    } else {
      await onTaskCreate(taskData);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px] flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{task ? 'Edit Task' : 'Create New Task'}</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
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
              onCancel={() => onOpenChange(false)}
              onSubmit={handleSubmit}
              task={task}
            />
            
            {task && (
              <div className="px-6 pb-6 border-t pt-6">
                <TaskComments taskId={task.id} />
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};