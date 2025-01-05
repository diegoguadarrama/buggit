import {
  SheetContent,
} from "@/components/ui/sheet";
import { TaskForm } from "./TaskForm";
import { TaskHeader } from "./TaskHeader";
import type { TaskType, Stage } from "@/types/task";

interface CreateTaskSidebarProps {
  onTaskCreate: (task: Partial<TaskType>) => Promise<TaskType | null>;
  defaultStage: Stage;
  onOpenChange: (open: boolean) => void;
}

export const CreateTaskSidebar = ({ 
  onTaskCreate, 
  defaultStage,
  onOpenChange,
}: CreateTaskSidebarProps) => {
  const handleSubmit = async (taskData: Partial<TaskType>) => {
    await onTaskCreate(taskData);
    onOpenChange(false);
  };

  return (
    <SheetContent className="sm:max-w-[450px] flex flex-col h-full p-0">
      <TaskHeader 
        task={null}
        onOpenChange={onOpenChange}
      />
      
      <div className="flex-1">
        <TaskForm
          defaultStage={defaultStage}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </div>
    </SheetContent>
  );
};