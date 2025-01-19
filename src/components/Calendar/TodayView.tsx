import { TaskType } from "@/types/task";
import { format, isToday } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";

interface TodayViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const TodayView = ({ tasks, onTaskClick }: TodayViewProps) => {
  const todayTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return isToday(new Date(task.due_date));
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">
        {format(new Date(), 'EEEE, MMMM d')}
      </h2>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-2">
          {todayTasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No tasks due today</p>
          ) : (
            todayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={`
                  p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors
                  ${task.stage === 'Done' ? 'text-gray-500 border-gray-500' : ''}
                  ${task.stage !== 'Done' && task.priority === 'high' ? 'text-red-700 border-red-700 dark:text-red-500 dark:border-red-500' : ''}
                  ${task.stage !== 'Done' && task.priority === 'medium' ? 'text-yellow-700 border-yellow-700 dark:text-yellow-500 dark:border-yellow-500' : ''}
                  ${task.stage !== 'Done' && task.priority === 'low' ? 'text-green-700 border-green-700 dark:text-green-500 dark:border-green-500' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  {task.stage === 'Done' && (
                    <CheckCircle2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  )}
                  <span className="font-medium">{task.title}</span>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};