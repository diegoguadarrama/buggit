import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isValid } from "date-fns";
import { TaskType } from "@/types/task";

export const useCalendarTasks = (tasks: TaskType[]) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.due_date) {
      // Create date object from UTC string and adjust for timezone
      const dueDate = new Date(task.due_date);
      if (isValid(dueDate)) {
        // Add the timezone offset to get the correct local date
        const adjustedDate = new Date(dueDate.getTime() + dueDate.getTimezoneOffset() * 60000);
        const dateStr = format(adjustedDate, 'yyyy-MM-dd');
        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        acc[dateStr].push(task);
      }
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

  return {
    currentDate,
    tasksByDate,
    daysInMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToToday
  };
};