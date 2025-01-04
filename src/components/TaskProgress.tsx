import { Progress } from "@/components/ui/progress";
import type { TaskType } from "@/types/task";

interface TaskProgressProps {
  tasks: TaskType[];
}

export const TaskProgress = ({ tasks }: TaskProgressProps) => {
  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.stage === 'Done').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  return (
    <div className="w-full space-y-2 mb-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Project Progress</span>
        <span>{calculateProgress()}%</span>
      </div>
      <Progress value={calculateProgress()} className="h-2" />
    </div>
  );
};