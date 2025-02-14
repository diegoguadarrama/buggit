import {
  SheetContent,
} from "@/components/ui/sheet";
import { TaskForm } from "./TaskForm";
import { TaskHeader } from "./TaskHeader";
import type { TaskType, Stage } from "@/types/task";
import { useProject } from "@/components/ProjectContext";
import { useUser } from "@/components/UserContext";

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
  const { user } = useUser();

  // Create a default task object with today's date and current user
  const defaultTask: TaskType = {
    title: initialTitle || '',
    stage: defaultStage,
    priority: 'medium',
    description: '',
    id: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attachments: [],
    assignee: user?.id || 'unassigned',  // Set current user as default assignee
    due_date: new Date().toISOString(),  // Set today as default due date
    archived: false,
    project_id: projectId || currentProject?.id || '',
    user_id: user?.id || '',
    position: 0,
  };
  
  const handleSubmit = async (taskData: Partial<TaskType>) => {
    await onTaskCreate({
      ...taskData,
      title: initialTitle || taskData.title,
      // Remove the stage override here, let the form's selected stage be used
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
          task={null}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          projectId={projectId || currentProject?.id}
        />
      </div>
    </SheetContent>
  );
};
