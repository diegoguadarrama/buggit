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
                        ${task.stage === 'Done' ? 'text-green-500 bg-green-100' : ''}
                        ${task.stage !== 'Done' && task.priority === 'high' ? 'px-2 py-1 bg-red-100 text-red-700 text-sm rounded dark:border-red-500 dark:text-red-500' : ''}
                        ${task.stage !== 'Done' && task.priority === 'medium' ? 'px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded dark:border-orange-500 dark:text-orange-500' : ''}
                        ${task.stage !== 'Done' && task.priority === 'low' ? 'px-2 py-1 bg-gray-100 text-sm rounded dark:border-gray-500 dark:text-gray-500' : ''}
                      `}
                    >
                      {task.stage === 'Done' && (
                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      )}
                      <span className={`${task.stage === 'Done' ? 'line-through' : ''}`}>
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
