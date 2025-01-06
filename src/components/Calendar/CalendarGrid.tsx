import { format, isSameMonth, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskType } from "@/types/task";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CalendarGridProps {
  daysInMonth: Date[];
  currentDate: Date;
  tasksByDate: Record<string, TaskType[]>;
  onTaskClick: (task: TaskType) => void;
}

export const CalendarGrid = ({
  daysInMonth,
  currentDate,
  tasksByDate,
  onTaskClick,
}: CalendarGridProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : undefined;
  
  const weekDays = locale ? 
    ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'] :
    ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <>
      <div className="grid grid-cols-7 gap-px bg-muted">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-sm font-medium text-muted-foreground text-center"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
        {daysInMonth.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayTasks = tasksByDate[dateStr] || [];
          const isCurrentMonth = isSameMonth(date, currentDate);
          
          return (
            <div
              key={dateStr}
              className={`min-h-[120px] bg-background p-2 ${
                !isCurrentMonth ? 'opacity-50' : ''
              } ${isToday(date) ? 'ring-2 ring-primary ring-inset' : ''}`}
            >
              <div className="font-medium text-sm mb-1">
                {format(date, 'd')}
              </div>
              <ScrollArea className="h-[80px]">
                <div className="space-y-1">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`
                        text-xs p-1 rounded cursor-pointer truncate flex items-center gap-1 border
                        ${task.stage === 'Done' ? 'text-gray-500 border-gray-500' : ''}
                        ${task.stage !== 'Done' && task.priority === 'high' ? 'text-red-700 border-red-700 dark:text-red-500 dark:border-red-500' : ''}
                        ${task.stage !== 'Done' && task.priority === 'medium' ? 'text-yellow-700 border-yellow-700 dark:text-yellow-500 dark:border-yellow-500' : ''}
                        ${task.stage !== 'Done' && task.priority === 'low' ? 'text-green-700 border-green-700 dark:text-green-500 dark:border-green-500' : ''}
                      `}
                    >
                      {task.stage === 'Done' && (
                        <CheckCircle2 className="h-3 w-3 text-gray-500 flex-shrink-0" />
                      )}
                      <span>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </>
  );
};