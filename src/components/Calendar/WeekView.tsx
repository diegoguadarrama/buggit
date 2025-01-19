import { TaskType } from "@/types/task";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface WeekViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const WeekView = ({ tasks, onTaskClick }: WeekViewProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : undefined;
  
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  return (
    <div className="space-y-4">
      {weekDays.map((day) => (
        <div key={day.toISOString()} className="space-y-2">
          <h3 className={`text-lg font-medium ${isToday(day) ? 'text-primary' : ''}`}>
            {format(day, 'EEEE, MMMM d', { locale })}
          </h3>
          <ScrollArea className="h-[150px]">
            <div className="space-y-2">
              {getTasksForDay(day).length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks due</p>
              ) : (
                getTasksForDay(day).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`
                      p-2 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors
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
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
};