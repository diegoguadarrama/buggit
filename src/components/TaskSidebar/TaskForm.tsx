import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TaskMemberSelect } from "../TaskMemberSelect";
import { TaskAttachments } from "./TaskAttachments";
import type { TaskType, Stage } from "@/types/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject } from "../ProjectContext";

interface TaskFormProps {
  task: TaskType | null;
  defaultStage: Stage;
  onSubmit: (taskData: Partial<TaskType>) => Promise<void>;
  onCancel: () => void;
}

export const TaskForm = ({ task, defaultStage, onSubmit, onCancel }: TaskFormProps) => {
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
      setDescription(task.description || "");
      setPriority(task.priority);
      setStage(task.stage);
      setResponsible(task.assignee || "");
      setAttachments(task.attachments || []);
      setDueDate(task.due_date || "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("low");
      setStage(defaultStage);
      setResponsible("");
      setAttachments([]);
      setDueDate("");
    }
  }, [task, defaultStage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Partial<TaskType> = {
      title,
      description,
      priority,
      stage,
      assignee: responsible,
      attachments,
      due_date: dueDate || undefined,
      project_id: currentProject?.id,
    };

    await onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
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
              className="w-full"
            />
          </div>

          <TaskMemberSelect
            projectId={currentProject?.id}
            value={responsible}
            onValueChange={setResponsible}
          />

          <TaskAttachments
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 p-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
