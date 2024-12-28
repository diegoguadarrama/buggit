import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProject } from "./ProjectContext";
import type { TaskType } from "@/types/task";

interface TaskFormProps {
  onSubmit: (task: TaskType) => void;
  onCancel: () => void;
  defaultStage: string;
  task?: TaskType;
}

export const TaskForm = ({ onSubmit, onCancel, defaultStage, task }: TaskFormProps) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority || "low");
  const [stage, setStage] = useState<Stage>(task?.stage || defaultStage);
  const [responsible, setResponsible] = useState(task?.assignee || "");
  const [attachments, setAttachments] = useState<string[]>(task?.attachments || []);
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const { currentProject } = useProject();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStage(task.stage);
      setResponsible(task.assignee);
      setAttachments(task.attachments);
      setDueDate(task.due_date || "");
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: TaskType = {
      id: task?.id || crypto.randomUUID(),
      title,
      description,
      priority,
      stage,
      assignee: responsible,
      attachments,
      created_at: task ? task.created_at : new Date().toISOString(),
      due_date: dueDate || undefined,
    };
    onSubmit(newTask);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Select 
          value={stage} 
          onValueChange={(value: Stage) => setStage(value)}
        >
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

      <div className="pt-4 flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Task</Button>
      </div>
    </form>
  );
};
