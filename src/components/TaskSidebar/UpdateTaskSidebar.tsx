import {
  SheetContent,
} from "@/components/ui/sheet";
import { UpdateTaskForm } from "./UpdateTaskForm";
import { TaskComments } from "./TaskComments";
import { TaskHeader } from "./TaskHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TaskType } from "@/types/task";

interface UpdateTaskSidebarProps {
  task: TaskType;
  onTaskUpdate: (task: TaskType) => Promise<void>;
  onTaskArchive?: (taskId: string) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export const UpdateTaskSidebar = ({ 
  task,
  onTaskUpdate,
  onTaskArchive,
  onOpenChange,
}: UpdateTaskSidebarProps) => {
  const handleSubmit = async (taskData: Partial<TaskType>) => {
    await onTaskUpdate({ ...task, ...taskData });
    onOpenChange(false);
  };

  return (
    <SheetContent className="sm:max-w-[450px] flex flex-col h-full p-0">
      <TaskHeader 
        task={task}
        onTaskArchive={onTaskArchive}
        onTaskUpdate={onTaskUpdate}
        onOpenChange={onOpenChange}
      />
      
      <Tabs defaultValue="details" className="flex-1 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="details" className="mt-0 h-full">
            <UpdateTaskForm
              task={task}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="comments" className="mt-0 px-6 py-4 h-full">
            <TaskComments taskId={task.id} />
          </TabsContent>
        </div>
      </Tabs>
    </SheetContent>
  );
};