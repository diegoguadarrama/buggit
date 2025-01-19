import React, { useState } from "react";
import { TaskType } from "@/types/task";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isToday, 
  parseISO,
  addWeeks,
  subWeeks 
} from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { CheckCircle2, CalendarIcon, UserCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface WeekViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const WeekView = ({ tasks, onTaskClick }: WeekViewProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : undefined;
  
  // Add state for current week
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get the current week's days
  const start = startOfWeek(currentDate, { weekStartsOn: 0 });
  const end = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start, end });

  // Navigation functions
  const previousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = parseISO(task.due_date);
      return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  // Helper function to get avatar fallback
  const getAvatarFallback = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            {t('common.today')}
          </Button>
        </div>
        <div className="text-sm font-medium">
          {format(start, 'MMMM d')} - {format(end, 'MMMM d, yyyy')}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4 p-4">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            if (dayTasks.length === 0) return null;

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
                  <span className="text-sm text-muted-foreground">
                    ({dayTasks.length} {dayTasks.length === 1 ? t('task.single') : t('task.plural')})
                  </span>
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
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            {task.stage === 'Done' && (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                            <span className={`font-medium ${task.stage === 'Done' ? 'line-through text-green-700' : ''}`}>
                              {task.title}
                            </span>
                          </div>
                          
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

                        {task.assignee ? (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={undefined} /> {/* Add avatar URL when available */}
                            <AvatarFallback className="bg-[#123524] text-white text-xs dark:bg-[#00ff80] dark:text-black">
                              {getAvatarFallback(task.assignee)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-gray-200 text-gray-600">
                              ?
                            </AvatarFallback>
                          </Avatar>
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
    </div>
  );
};
