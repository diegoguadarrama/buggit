import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useState } from "react";
import { TaskForm } from "./TaskForm";
import { TaskComments } from "./TaskComments";
import { TaskHeader } from "./TaskHeader";
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
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <TaskForm
              task={task}
              defaultStage={defaultStage}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
            />
            
            {task && (
              <div className="px-6 pb-6 border-t pt-6">
                <TaskComments taskId={task.id} />
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};