import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import type { TaskType, Stage } from "@/types/task";
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
  onTaskUpdate?: (task: TaskType) => void;
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
    // Handle file upload logic here
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
    <SheetHeader className="p-6 border-b sticky top-0 bg-background z-10">
      <SheetTitle>{task ? 'Edit Task' : 'Create New Task'}</SheetTitle>
    </SheetHeader>
    
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Stage</label>
          <Select value={stage} onValueChange={(value: Stage) => setStage(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date</label>
          <Input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Assignee</label>
          <Input
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            placeholder="Enter assignee name"
            required
          />
        </div>
      </div>

      <div className="sticky bottom-0 border-t bg-background p-6 mt-auto">
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
