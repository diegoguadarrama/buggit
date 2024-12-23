import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import type { TaskType } from "./TaskBoard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface TaskSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: TaskType) => void;
}

export const TaskSidebar = ({ open, onOpenChange, onTaskCreate }: TaskSidebarProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [assignee, setAssignee] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      // Reset form when sidebar closes
      setTitle("");
      setDescription("");
      setPriority("low");
      setAssignee("");
      setAttachments([]);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: TaskType = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      stage: "To Do",
      assignee,
      attachments,
    };

    onTaskCreate(newTask);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Create New Task</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            <label className="text-sm font-medium">Assignee</label>
            <Input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Enter assignee name"
              required
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};