import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TaskForm } from "./TaskForm";
import { TaskComments } from "./TaskComments";
import type { TaskSidebarProps } from "./TaskSidebarProps";
import type { TaskType } from "@/types/task";

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
      <SheetContent className="sm:max-w-[450px] flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{task ? 'Edit Task' : 'Create New Task'}</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <TaskForm
              task={task}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              defaultStage={defaultStage}
            />
            
            {task && (
              <div className="pt-6 border-t">
                <TaskComments taskId={task.id} />
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};