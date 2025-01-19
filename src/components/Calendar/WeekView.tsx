import React from "react";
import { TaskType } from "@/types/task";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { CheckCircle2, CalendarIcon, UserCircle2 } from "lucide-react";

interface WeekViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const WeekView = ({ tasks, onTaskClick }: WeekViewProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : undefined;
  
  // Get the current week's days
  const start = startOfWeek(new Date(), { weekStartsOn: 0 });
  const end = endOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start, end });

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = parseISO(task.due_date);
      return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-4 p-4">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDay(day);
          if (dayTasks.length === 0) return null; // Skip days with no tasks

          return (
            <div key={day.toISOString()} className="space-y-2">
              {/* Day Header */}
              <div className={`
                flex items-center gap-2 p-2 sticky top-0 bg-background z-10
                ${isToday(day) ? 'text-primary font-medium' : 'text-muted-foreground'}
              `}>
                <CalendarIcon className="h-5 w-5" />
                <span className="text-lg">
                  {format(day, 'EEEE, MMMM d', { locale })}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({dayTasks.length} {dayTasks.length === 1 ? t('task.single') : t('task.plural')})
                  </span>
                )}
              </div>

              {/* Tasks for the day */}
              <div className="space-y-2 pl-7">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`
                      p-3 rounded-lg cursor-pointer
                      ${task.stage === 'Done' 
                        ? 'bg-green-50 border-green-100'
                        : 'bg-card hover:bg-accent'
                      }
                      border transition-colors
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Task Title and Details */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {task.stage === 'Done' && (
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                          <span className={`font-medium ${task.stage === 'Done' ? 'line-through text-green-700' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                        
                        {/* Task Metadata */}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className={`
                            px-2 py-0.5 rounded-full text-xs
                            ${task.priority === 'high' ? 'bg-red-100 text-red-700' : ''}
                            ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${task.priority === 'low' ? 'bg-gray-100 text-gray-700' : ''}
                          `}>
                            {t(`task.priority.${task.priority}`)}
                          </span>
                          <span>•</span>
                          <span>{t(`task.stage.${task.stage.toLowerCase()}`)}</span>
                        </div>
                      </div>

                      {/* Assignee */}
                      {task.assignee && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <UserCircle2 className="h-4 w-4" />
                          <span>{task.assignee}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
