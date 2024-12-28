import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import type { TaskType } from "@/types/task";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProject } from "./ProjectContext";
import { TaskMemberSelect } from "./TaskMemberSelect";
import { Paperclip, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface TaskSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: TaskType) => void;
  onTaskUpdate?: (task: TaskType) => void; // Add this prop for handling updates
  defaultStage: string;
  task: TaskType | null;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({ 
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
  const [stage, setStage] = useState<string>(defaultStage);
  const [responsible, setResponsible] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const { currentProject } = useProject();
  const { toast } = useToast();

  // Populate form when task is provided
  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStage(task.stage);
      setResponsible(task.assignee || "");
      setAttachments(task.attachments || []);
      setDueDate(task.due_date || "");
    } else if (!open) {
      // Reset form when closing
      setTitle("");
      setDescription("");
      setPriority("low");
      setStage(defaultStage);
      setResponsible("");
      setAttachments([]);
      setDueDate("");
    }
  }, [task, open, defaultStage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... existing file upload code ...
  };

  const removeAttachment = (urlToRemove: string) => {
    setAttachments(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: TaskType = {
      id: task?.id || crypto.randomUUID(),
      title,
      description,
      priority,
      stage,
      assignee: responsible,
      attachments,
      created_at: task?.created_at || new Date().toISOString(),
      due_date: dueDate || undefined
    };

    if (task) {
      // Update existing task
      onTaskUpdate?.(taskData);
    } else {
      // Create new task
      onTaskCreate(taskData);
    }
    
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[400px] flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{task ? 'Edit Task' : 'Create New Task'}</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* ... existing form content ... */}

          <div className="sticky bottom-0 border-t bg-background p-6">
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : task ? "Update Task" : "Add Task"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
