import { Dispatch, SetStateAction } from "react";
import type { TaskType, Stage } from "@/types/task";

export interface TaskSidebarProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onTaskCreate: (task: TaskType) => Promise<TaskType>;
  onTaskUpdate: (task: TaskType) => Promise<void>;
  defaultStage: Stage;
  task: TaskType | null;
}