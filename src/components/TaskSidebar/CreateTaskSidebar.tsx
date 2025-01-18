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
  initialTitle?: string;
  projectId?: string;
}

export const CreateTaskSidebar = ({ 
  onTaskCreate, 
  defaultStage,
  onOpenChange,
  initialTitle,
  projectId,
}: CreateTaskSidebarProps) => {
  const { currentProject } = useProject();
  
  const handleSubmit = async (taskData: Partial<TaskType>) => {
    await onTaskCreate(taskData);
    onOpenChange(false);
  };

  return (
    <SheetContent className="flex flex-col h-full p-0 w-[100vw] sm:max-w-[600px]">
      <TaskHeader 
        task={null}
        onOpenChange={onOpenChange}
      />
      
      <div className="flex-1 overflow-hidden">
        <TaskForm
          defaultStage={defaultStage}
          initialTitle={initialTitle}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          projectId={projectId || currentProject?.id}
        />
      </div>
    </SheetContent>
  );
};
