import { Dispatch, SetStateAction } from "react";
import type { TaskType } from "@/types/task";

export interface TaskSidebarProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onTaskCreate: (task: TaskType) => Promise<void>;
  defaultStage: string;
  task: TaskType | null;
}