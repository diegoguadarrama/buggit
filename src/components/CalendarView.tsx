import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { TaskType } from "@/types/task";
import { Task } from "./Task";
import { ScrollArea } from "./ui/scroll-area";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface CalendarViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
  onTaskUpdate?: (task: TaskType) => Promise<void>;
}

export const CalendarView = ({ tasks, onTaskClick, onTaskUpdate }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
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

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
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
                        text-xs p-1 rounded cursor-pointer truncate flex items-center gap-1
                        ${task.stage === 'Done' ? 'text-gray-500' : ''}
                        ${task.stage !== 'Done' && task.priority === 'high' ? 'bg-red-100 text-red-700' : ''}
                        ${task.stage !== 'Done' && task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${task.stage !== 'Done' && task.priority === 'low' ? 'bg-green-100 text-green-700' : ''}
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
    </div>
  );
};