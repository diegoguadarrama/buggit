import { useState, useEffect } from 'react';
import { parseISO, startOfDay, addDays } from 'date-fns';
import type { TaskType } from '@/types/task';
import { TimelineControls } from './TimelineControls';
import { TaskGanttChart } from './TaskGanttChart';

interface GanttViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const GanttView = ({ tasks, onTaskClick }: GanttViewProps) => {
  console.log('GanttView rendered with tasks:', tasks);

  const [startDate, setStartDate] = useState(() => {
    console.log('Initializing startDate state');
    const dates = tasks
      .filter(task => {
        console.log('Checking task dates for initialization:', {
          task: task.title,
          created_at: task.created_at,
          has_created_at: !!task.created_at
        });
        return task.created_at;
      })
      .map(task => parseISO(task.created_at));
    
    console.log('Filtered dates for initialization:', dates);
    
    if (dates.length > 0) {
      const minDate = startOfDay(Math.min(...dates.map(d => d.getTime())));
      console.log('Using minimum date as start date:', minDate);
      return minDate;
    }
    
    const today = startOfDay(new Date());
    console.log('No valid dates found, using today as start date:', today);
    return today;
  });

  const [daysToShow] = useState(14);

  useEffect(() => {
    console.log('Tasks changed, updating startDate');
    if (tasks.length > 0) {
      const dates = tasks
        .filter(task => task.created_at)
        .map(task => parseISO(task.created_at));
      
      console.log('Filtered dates in useEffect:', dates);
      
      if (dates.length > 0) {
        const minDate = startOfDay(Math.min(...dates.map(d => d.getTime())));
        console.log('Setting new start date:', minDate);
        setStartDate(minDate);
      }
    }
  }, [tasks]);

  const moveTimeline = (direction: 'forward' | 'backward') => {
    console.log('Moving timeline:', direction);
    setStartDate(prev => {
      const newDate = direction === 'forward' 
        ? addDays(prev, daysToShow) 
        : addDays(prev, -daysToShow);
      console.log('New timeline start date:', newDate);
      return newDate;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <TimelineControls
        startDate={startDate}
        daysToShow={daysToShow}
        onTimelineMove={moveTimeline}
      />
      <TaskGanttChart
        tasks={tasks}
        onTaskClick={onTaskClick}
        startDate={startDate}
        daysToShow={daysToShow}
      />
    </div>
  );
};