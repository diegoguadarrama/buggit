import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateTaskForm } from "./CreateTaskForm";
import type { TaskType } from "@/types/task";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: TaskType) => void;
}

export const CreateTaskDialog = ({ open, onOpenChange, onTaskCreate }: CreateTaskDialogProps) => {
  const handleSubmit = async (taskData: Partial<TaskType>) => {
    await onTaskCreate(taskData as TaskType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <CreateTaskForm
          defaultStage="To Do"
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};