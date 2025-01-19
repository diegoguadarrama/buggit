import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isValid,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { TaskType } from "@/types/task";

export const useCalendarTasks = (tasks: TaskType[]) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.due_date) {
      // Create date object from UTC string
      const dueDate = new Date(task.due_date);
      if (isValid(dueDate)) {
        const dateStr = format(dueDate, 'yyyy-MM-dd');
        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        acc[dateStr].push(task);
      }
    }
    return acc;
  }, {} as Record<string, TaskType[]>);

  // Get the start of the first week and end of the last week of the month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 for Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Get all days that should be shown in the calendar
  const daysInMonth = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
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

  return {
    currentDate,
    tasksByDate,
    daysInMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToToday
  };
};
