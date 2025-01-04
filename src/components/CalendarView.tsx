import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { TaskType } from "@/types/task";
import { Task } from "./Task";
import { ScrollArea } from "./ui/scroll-area";

interface CalendarViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
  onTaskUpdate?: (task: TaskType) => Promise<void>;
}

export const CalendarView = ({ tasks, onTaskClick, onTaskUpdate }: CalendarViewProps) => {
  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.due_date) {
      const date = format(new Date(task.due_date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
    }
    return acc;
  }, {} as Record<string, TaskType[]>);

  return (
    <div className="flex gap-6">
      <div className="w-auto">
        <Calendar
          mode="single"
          modifiers={{
            hasTasks: (date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              return !!tasksByDate[dateStr];
            }
          }}
          modifiersClassNames={{
            hasTasks: "bg-primary/10 font-semibold"
          }}
          className="rounded-md border"
        />
      </div>
      <ScrollArea className="flex-1 h-[calc(100vh-12rem)]">
        <div className="space-y-4">
          {Object.entries(tasksByDate).map(([date, dateTasks]) => (
            <div key={date} className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">
                {format(new Date(date), 'MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {dateTasks.map((task) => (
                  <Task
                    key={task.id}
                    task={task}
                    onTaskClick={onTaskClick}
                    onTaskUpdate={onTaskUpdate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};