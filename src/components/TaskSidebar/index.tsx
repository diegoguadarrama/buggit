import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { TaskForm } from "./TaskForm";
import { TaskComments } from "../TaskSidebar/TaskComments";
import { TaskHeader } from "./TaskHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TaskType, Stage } from "@/types/task";

interface TaskSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: Partial<TaskType>) => Promise<TaskType | null>;
  onTaskUpdate: (task: TaskType) => Promise<void>;
  defaultStage: Stage;
  task: TaskType | null;
  onTaskArchive?: (taskId: string) => Promise<void>;
}

export const TaskSidebar = ({ 
  open, 
  onOpenChange, 
  onTaskCreate, 
  onTaskUpdate,
  defaultStage, 
  task,
  onTaskArchive
}: TaskSidebarProps) => {
  const handleSubmit = async (taskData: Partial<TaskType>) => {
    if (task) {
      await onTaskUpdate({ ...task, ...taskData });
    } else {
      await onTaskCreate(taskData);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px] flex flex-col h-full p-0">
        <TaskHeader 
          task={task}
          onTaskArchive={onTaskArchive}
          onTaskUpdate={onTaskUpdate}
          onOpenChange={onOpenChange}
        />
        
        {!task && (
          <div className="flex-1 overflow-y-auto">
            <TaskForm
              task={null}
              defaultStage={defaultStage}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        )}

        {task && (
          <Tabs defaultValue="details" className="flex-1 overflow-hidden">
            <div className="px-6 py-4 border-b">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="details" className="mt-0 h-full">
                <TaskForm
                  task={task}
                  defaultStage={defaultStage}
                  onSubmit={handleSubmit}
                  onCancel={() => onOpenChange(false)}
                />
              </TabsContent>

              <TabsContent value="comments" className="mt-0 px-6 py-4 h-full">
                <TaskComments taskId={task.id} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};