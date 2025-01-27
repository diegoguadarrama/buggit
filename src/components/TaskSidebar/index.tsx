import { CreateTaskSidebar } from "./CreateTaskSidebar";
import { UpdateTaskSidebar } from "./UpdateTaskSidebar";
import type { TaskType, Stage } from "@/types/task";

interface TaskSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: Partial<TaskType>) => Promise<TaskType | null>;
  onTaskUpdate?: (task: TaskType) => Promise<void>;
  onTaskArchive?: (taskId: string) => Promise<void>;
  defaultStage?: Stage;
  task?: TaskType | null;
  initialTitle?: string;
  projectId?: string | null;
}

export function TaskSidebar({
  open,
  onOpenChange,
  onTaskCreate,
  onTaskUpdate,
  onTaskArchive,
  defaultStage = "To Do",
  task,
  initialTitle,
  projectId,
}: TaskSidebarProps) {
  if (task && onTaskUpdate && onTaskArchive) {
    return (
      <UpdateTaskSidebar
        open={open}
        onOpenChange={onOpenChange}
        task={task}
        onTaskUpdate={onTaskUpdate}
        onTaskArchive={onTaskArchive}
        projectId={projectId}
      />
    );
  }

  return (
    <CreateTaskSidebar
      open={open}
      onOpenChange={onOpenChange}
      onTaskCreate={onTaskCreate}
      defaultStage={defaultStage}
      initialTitle={initialTitle}
      projectId={projectId}
    />
  );
}