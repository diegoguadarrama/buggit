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
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: TaskType) => void;
  defaultStage: string;
}

export const TaskSidebar = ({ open, onOpenChange, onTaskCreate, defaultStage }: TaskSidebarProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[400px] flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Create New Task</SheetTitle>
        </SheetHeader>
        
        <TaskForm
          onSubmit={onTaskCreate}
          onCancel={() => onOpenChange(false)}
          defaultStage={defaultStage}
        />
      </SheetContent>
    </Sheet>
  );
};