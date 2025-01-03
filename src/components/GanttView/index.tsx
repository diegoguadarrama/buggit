import { useState, useEffect } from 'react';
import { parseISO, startOfDay, addDays, format } from 'date-fns';
import type { TaskType } from '@/types/task';
import { TimelineControls } from './TimelineControls';
import { Gantt } from '@dhtmlx/trial-react-gantt';

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

  // Transform tasks for DHTMLX Gantt format
  const ganttTasks = tasks
    .filter(task => task.due_date && task.created_at)
    .map(task => ({
      id: task.id,
      text: task.title,
      start_date: format(parseISO(task.created_at), 'yyyy-MM-dd'),
      end_date: format(parseISO(task.due_date!), 'yyyy-MM-dd'),
      progress: 0,
      originalTask: task
    }));

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        No tasks found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TimelineControls
        startDate={startDate}
        daysToShow={daysToShow}
        onTimelineMove={moveTimeline}
      />
      <div className="flex-1 min-h-[400px]">
        <Gantt
          tasks={ganttTasks}
          onClick={(task) => {
            const originalTask = tasks.find(t => t.id === task.id);
            if (originalTask) {
              onTaskClick(originalTask);
            }
          }}
        />
      </div>
    </div>
  );
};