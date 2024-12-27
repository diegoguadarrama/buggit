import { Dispatch, SetStateAction } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TaskType } from "@/types/task";
import { TaskForm } from "./TaskForm";

interface TaskSidebarProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onTaskCreate: (task: TaskType) => Promise<void>;
  defaultStage: string;
  task: TaskType | null;
}

export const TaskSidebar = ({ open, onOpenChange, onTaskCreate, defaultStage, task }: TaskSidebarProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[400px] flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{task ? 'Edit Task' : 'Create New Task'}</SheetTitle>
        </SheetHeader>
        
        <TaskForm
          onSubmit={onTaskCreate}
          onCancel={() => onOpenChange(false)}
          defaultStage={defaultStage}
          task={task}
        />
      </SheetContent>
    </Sheet>
  );
};