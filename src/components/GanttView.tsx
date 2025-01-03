import { format, parseISO, differenceInDays, addDays, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { TaskType } from '@/types/task';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

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
      console.log('Using minimum date as start date:', format(minDate, 'yyyy-MM-dd'));
      return minDate;
    }
    
    const today = startOfDay(new Date());
    console.log('No valid dates found, using today as start date:', format(today, 'yyyy-MM-dd'));
    return today;
  });

  const [daysToShow, setDaysToShow] = useState(14);

  useEffect(() => {
    console.log('Tasks changed, updating startDate');
    if (tasks.length > 0) {
      const dates = tasks
        .filter(task => {
          console.log('Checking task dates in useEffect:', {
            task: task.title,
            created_at: task.created_at,
            has_created_at: !!task.created_at
          });
          return task.created_at;
        })
        .map(task => parseISO(task.created_at));
      
      console.log('Filtered dates in useEffect:', dates);
      
      if (dates.length > 0) {
        const minDate = startOfDay(Math.min(...dates.map(d => d.getTime())));
        console.log('Setting new start date:', format(minDate, 'yyyy-MM-dd'));
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
      console.log('New timeline start date:', format(newDate, 'yyyy-MM-dd'));
      return newDate;
    });
  };

  // Transform tasks into data for the Gantt chart
  const data = tasks
    .filter(task => {
      console.log('Filtering task for Gantt data:', {
        task: task.title,
        has_due_date: !!task.due_date,
        has_created_at: !!task.created_at,
        due_date: task.due_date,
        created_at: task.created_at
      });
      return task.due_date && task.created_at;
    })
    .map(task => {
      const creationDate = parseISO(task.created_at);
      const dueDate = parseISO(task.due_date!);
      
      // Calculate start position relative to the timeline start date
      const startPosition = Math.max(0, differenceInDays(creationDate, startDate));
      
      // Calculate duration from creation to due date
      const duration = Math.max(1, differenceInDays(dueDate, creationDate));

      const taskData = {
        name: task.title,
        start: startPosition,
        duration,
        task,
        creationDate: format(creationDate, 'yyyy-MM-dd'),
        dueDate: format(dueDate, 'yyyy-MM-dd'),
      };

      console.log('Transformed task data:', taskData);
      return taskData;
    });

  console.log('Final Gantt data:', data);

  if (tasks.length === 0) {
    console.log('No tasks found');
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        No tasks found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => moveTimeline('backward')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            {format(startDate, 'MMM d, yyyy')} - {format(addDays(startDate, daysToShow), 'MMM d, yyyy')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => moveTimeline('forward')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            barSize={20}
            margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
          >
            <XAxis
              type="number"
              domain={[0, daysToShow]}
              ticks={Array.from({ length: daysToShow + 1 }, (_, i) => i)}
              tickFormatter={(value) => format(addDays(startDate, value), 'MMM d')}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 shadow rounded border">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm text-gray-600">
                      Created: {format(parseISO(data.task.created_at), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Due: {format(parseISO(data.task.due_date!), 'MMM d, yyyy')}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="duration"
              fill="#3b82f6"
              onClick={(data) => {
                console.log('Bar clicked:', data);
                onTaskClick(data.task);
              }}
              cursor="pointer"
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};