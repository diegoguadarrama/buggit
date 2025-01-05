import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskMemberSelect } from "../TaskMemberSelect";
import { useProject } from "../ProjectContext";
import { Paperclip, X } from "lucide-react";
import type { TaskType, Stage } from "@/types/task";
import { format, isValid } from 'date-fns';

interface TaskDetailsProps {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  stage: Stage;
  responsible: string;
  attachments: string[];
  dueDate: string;
  uploading: boolean;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPriority: (priority: "low" | "medium" | "high") => void;
  setStage: (stage: Stage) => void;
  setResponsible: (responsible: string) => void;
  setDueDate: (dueDate: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment: (url: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  task: TaskType | null;
}

export const TaskDetails = ({
  title,
  description,
  priority,
  stage,
  responsible,
  attachments,
  dueDate,
  uploading,
  setTitle,
  setDescription,
  setPriority,
  setStage,
  setResponsible,
  setDueDate,
  handleFileUpload,
  removeAttachment,
  onCancel,
  onSubmit,
  task
}: TaskDetailsProps) => {
  const { currentProject } = useProject();

  // Helper to format date for input
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (!isValid(date)) return "";
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
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
              type="date"
              value={dueDate ? formatDateForInput(dueDate) : ''}
              onChange={(e) => {
                const newDate = e.target.value;
                setDueDate(newDate ? `${newDate}T00:00:00` : '');
              }}
            />
          </div>

          <TaskMemberSelect
            projectId={currentProject?.id}
            value={responsible}
            onValueChange={setResponsible}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Attachments</label>
            <div className="space-y-2">
              {attachments.map((url, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4 text-gray-500" />
                    <span className="text-sm truncate max-w-[200px]">
                      {decodeURIComponent(url.split('/').pop() || '')}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t bg-background p-6">
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : task ? "Update Task" : "Add Task"}
          </Button>
        </div>
      </div>
    </form>
  );
};

