import React from "react";
import { TaskType } from "@/types/task";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, eachHourOfInterval, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

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
      
      // Check if it's the same day and hour
      const sameDay = format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      const sameHour = taskDate.getHours() === hour.getHours();
      
      return sameDay && sameHour;
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
                  className="min-h-[60px] bg-background p-1 relative border-b hover:bg-muted/50 transition-colors"
                >
                  {getTasksForDayAndHour(day, hour).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`
                        absolute inset-x-1 p-2 rounded text-xs cursor-pointer
                        flex items-center gap-1 border
                        ${task.stage === 'Done' 
                          ? 'text-green-500 bg-green-100' : '' 
                          : task.priority === 'high'
                          ? 'bg-red-100 text-red-700 text-sm rounded'
                          : task.priority === 'medium'
                          ? 'bg-orange-100 text-orange-700 text-sm rounded'
                          : 'bg-gray-100 text-sm rounded'
                        }
                        hover:brightness-95 transition-all
                      `}
                    >
                      {task.stage === 'Done' && (
                        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className={task.stage === 'Done' ? 'line-through' : ''}>
                        {task.title}
                      </span>
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
