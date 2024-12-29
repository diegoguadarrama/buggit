import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TaskForm } from "./TaskForm";
import type { TaskSidebarProps } from "./TaskSidebarProps";

export const TaskSidebar = ({ 
  open, 
  onOpenChange, 
  onTaskCreate, 
  onTaskUpdate, 
  defaultStage, 
  task 
}: TaskSidebarProps) => {
  const handleSubmit = async (taskData: Partial<TaskType>) => {
    if (task) {
      await onTaskUpdate(taskData as TaskType);
    } else {
      await onTaskCreate(taskData);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[400px] flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{task ? 'Edit Task' : 'Create New Task'}</SheetTitle>
        </SheetHeader>
        
        <TaskForm
          task={task}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          defaultStage={defaultStage}
        />
      </SheetContent>
    </Sheet>
  );
};