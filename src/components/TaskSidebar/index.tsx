import { Sheet } from "@/components/ui/sheet";
import { CreateTaskSidebar } from "./CreateTaskSidebar";
import { UpdateTaskSidebar } from "./UpdateTaskSidebar";
import type { TaskType, Stage } from "@/types/task";

interface TaskSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: Partial<TaskType>) => Promise<TaskType | null>;
  onTaskUpdate: (task: TaskType) => Promise<void>;
  onTaskArchive?: (taskId: string) => Promise<void>;
  defaultStage: Stage;
  task: TaskType | null;
  initialTitle?: string;
  projectId?: string;
}

export const TaskSidebar = ({ 
  open, 
  onOpenChange, 
  onTaskCreate, 
  onTaskUpdate,
  onTaskArchive,
  defaultStage, 
  task,
  initialTitle,
  projectId,
}: TaskSidebarProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {task ? (
        <UpdateTaskSidebar
          task={task}
          onTaskUpdate={onTaskUpdate}
          onTaskArchive={onTaskArchive}
          onOpenChange={onOpenChange}
        />
      ) : (
        <CreateTaskSidebar
          onTaskCreate={onTaskCreate}
          defaultStage={defaultStage}
          onOpenChange={onOpenChange}
          initialTitle={initialTitle}
        />
      )}
    </Sheet>
  );
};