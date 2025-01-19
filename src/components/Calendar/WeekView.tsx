import React from "react";
import { TaskType } from "@/types/task";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, eachHourOfInterval, isToday, isSameHour, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

interface WeekViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const WeekView = ({ tasks, onTaskClick }: WeekViewProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : undefined;
  
  // Get the current week's days
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });
  
  // Generate hours from 1 AM to 11 PM
  const dayHours = eachHourOfInterval({
    start: new Date().setHours(1, 0, 0, 0),
    end: new Date().setHours(23, 0, 0, 0),
  });

  const getTasksForDayAndHour = (date: Date, hour: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = parseISO(task.due_date);
      return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
             isSameHour(taskDate, hour);
    });
  };

  return (
    <div className="flex flex-col">
      {/* Week header */}
      <div className="grid grid-cols-8 gap-px bg-muted border-b">
        <div className="p-2 text-sm font-medium text-muted-foreground text-center">
          GMT-06
        </div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`p-2 text-center ${isToday(day) ? 'bg-primary text-primary-foreground rounded-t-lg' : ''}`}
          >
            <div className="text-xs text-muted-foreground">
              {format(day, 'EEE', { locale })}
            </div>
            <div className="font-semibold">
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-8 gap-px bg-muted">
          {dayHours.map((hour) => (
            <React.Fragment key={hour.toISOString()}>
              {/* Time column */}
              <div className="p-2 text-xs text-muted-foreground border-r">
                {format(hour, 'h a')}
              </div>
              
              {/* Day columns */}
              {weekDays.map((day) => (
                <div
                  key={`${day.toISOString()}-${hour.toISOString()}`}
                  className="min-h-[60px] bg-background p-1 relative border-b"
                >
                  {getTasksForDayAndHour(day, hour).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`
                        absolute inset-x-1 p-1 rounded text-xs cursor-pointer
                        ${task.priority === 'high' ? 'bg-red-100 text-red-700' : ''}
                        ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${task.priority === 'low' ? 'bg-green-100 text-green-700' : ''}
                      `}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};