import type { TaskType, Stage } from "@/types/task";

export interface TaskSidebarProps {
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