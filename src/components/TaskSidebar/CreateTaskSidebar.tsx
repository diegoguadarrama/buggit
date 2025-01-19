import {
  SheetContent,
} from "@/components/ui/sheet";
import { TaskForm } from "./TaskForm";
import { TaskHeader } from "./TaskHeader";
import type { TaskType, Stage } from "@/types/task";
import { useProject } from "@/components/ProjectContext";

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
    await onTaskCreate({
      ...taskData,
      title: initialTitle || taskData.title,
      stage: defaultStage,
    });
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
          task={initialTitle ? { 
            title: initialTitle,
            stage: defaultStage,
            priority: 'medium',
            description: '',
            id: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            attachments: [], // Add this line
            assignee: 'unassigned', // Add this line
            due_date: undefined // Add this line
          } as TaskType : {
            // Default values when no initial title
              title: '',
              stage: defaultStage,
              priority: 'medium',
              description: '',
              id: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              attachments: [],
              assignee: 'unassigned',
              due_date: undefined
          } as TaskType}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            projectId={projectId || currentProject?.id}
        />
      </div>
    </SheetContent>
  );
};
