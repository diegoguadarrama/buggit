// src/components/TaskSidebar/CreateTaskSidebar.tsx
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

  // Create a default task object
  const defaultTask: TaskType = {
    title: initialTitle || '',
    stage: defaultStage,
    priority: 'medium',
    description: '',
    id: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attachments: [], // Ensure attachments is always initialized as an empty array
    assignee: 'unassigned',
    due_date: undefined,
    archived: false, // Add the missing archived property
    project_id: projectId || currentProject?.id || '', // Add the missing project_id property
  };
  
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
          task={defaultTask}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          projectId={projectId || currentProject?.id}
        />
      </div>
    </SheetContent>
  );
};