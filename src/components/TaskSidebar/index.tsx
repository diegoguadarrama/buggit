import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TaskForm } from "./TaskForm";
import type { TaskSidebarProps } from "./TaskSidebarProps";
import type { Stage } from "@/types/task";

export const TaskSidebar = ({ open, onOpenChange, onTaskCreate, onTaskUpdate, defaultStage, task }: TaskSidebarProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[400px] flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{task ? 'Edit Task' : 'Create New Task'}</SheetTitle>
        </SheetHeader>
        
        <TaskForm
          onSubmit={task ? onTaskUpdate : onTaskCreate}
          onCancel={() => onOpenChange(false)}
          defaultStage={defaultStage as Stage}
          task={task}
        />
      </SheetContent>
    </Sheet>
  );
};