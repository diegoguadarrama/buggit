import { TaskType } from "@/types/task";
import { CalendarHeader } from "./Calendar/CalendarHeader";
import { CalendarGrid } from "./Calendar/CalendarGrid";
import { useCalendarTasks } from "./Calendar/useCalendarTasks";

interface CalendarViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
  onTaskUpdate?: (task: TaskType) => Promise<void>;
}

export const CalendarView = ({ tasks, onTaskClick, onTaskUpdate }: CalendarViewProps) => {
  const {
    currentDate,
    tasksByDate,
    daysInMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToToday
  } = useCalendarTasks(tasks);

  return (
    <div className="flex flex-col space-y-4">
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />
      <CalendarGrid
        daysInMonth={daysInMonth}
        currentDate={currentDate}
        tasksByDate={tasksByDate}
        onTaskClick={onTaskClick}
      />
    </div>
  );
};