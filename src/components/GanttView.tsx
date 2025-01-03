import { format, parseISO, differenceInDays, addDays, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { TaskType } from '@/types/task';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface GanttViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const GanttView = ({ tasks, onTaskClick }: GanttViewProps) => {
  const [startDate, setStartDate] = useState(() => {
    const dates = tasks
      .filter(task => task.due_date)
      .map(task => parseISO(task.due_date!));
    return dates.length > 0 ? startOfDay(Math.min(...dates.map(d => d.getTime()))) : new Date();
  });

  const [daysToShow, setDaysToShow] = useState(14);

  const moveTimeline = (direction: 'forward' | 'backward') => {
    setStartDate(prev => 
      direction === 'forward' 
        ? addDays(prev, daysToShow) 
        : addDays(prev, -daysToShow)
    );
  };

  const data = tasks
    .filter(task => task.due_date)
    .map(task => {
      const dueDate = parseISO(task.due_date!);
      const daysFromStart = differenceInDays(dueDate, startDate);
      
      return {
        name: task.title,
        start: 0,
        duration: Math.max(1, daysFromStart),
        task,
      };
    })
    .filter(item => item.duration >= 0 && item.duration <= daysToShow);

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
                      Due: {format(parseISO(data.task.due_date!), 'MMM d, yyyy')}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="duration"
              fill="#3b82f6"
              onClick={(data) => onTaskClick(data.task)}
              cursor="pointer"
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};