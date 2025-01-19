import { TaskType } from "@/types/task";
import { CalendarHeader } from "./Calendar/CalendarHeader";
import { CalendarGrid } from "./Calendar/CalendarGrid";
import { TodayView } from "./Calendar/TodayView";
import { WeekView } from "./Calendar/WeekView";
import { useCalendarTasks } from "./Calendar/useCalendarTasks";
import { useState } from "react";
import { Button } from "./ui/button";
import { CalendarDays, Calendar as CalendarIcon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CalendarViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
  onTaskUpdate?: (task: TaskType) => Promise<void>;
}

type CalendarViewMode = 'month' | 'week' | 'today';

export const CalendarView = ({ tasks, onTaskClick, onTaskUpdate }: CalendarViewProps) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const { t } = useTranslation();
  
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
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            {t('calendar.month')}
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            {t('calendar.week')}
          </Button>
          <Button
            variant={viewMode === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('today')}
          >
            <Sun className="h-4 w-4 mr-2" />
            {t('calendar.today')}
          </Button>
        </div>
      </div>

      {viewMode === 'month' && (
        <>
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
        </>
      )}

      {viewMode === 'week' && (
        <WeekView
          tasks={tasks}
          onTaskClick={onTaskClick}
        />
      )}

      {viewMode === 'today' && (
        <TodayView
          tasks={tasks}
          onTaskClick={onTaskClick}
        />
      )}
    </div>
  );
};