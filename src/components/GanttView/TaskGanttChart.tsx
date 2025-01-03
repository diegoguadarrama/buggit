import { Gantt } from '@dhtmlx/trial-react-gantt';
import type { TaskType } from '@/types/task';
import { format } from 'date-fns';

interface TaskGanttChartProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
  startDate: Date;
  daysToShow: number;
}

export const TaskGanttChart = ({ tasks, onTaskClick, startDate, daysToShow }: TaskGanttChartProps) => {
  console.log('TaskGanttChart rendered with tasks:', tasks);

  const columns = [
    { name: "text", label: "Task", width: "200" },
    { name: "start_date", label: "Start", width: "130" },
    { name: "end_date", label: "Due", width: "130" },
  ];

  const ganttTasks = tasks.filter(task => {
    console.log('Filtering task:', {
      task: task.title,
      has_due_date: !!task.due_date,
      has_created_at: !!task.created_at
    });
    return task.due_date && task.created_at;
  }).map(task => ({
    id: task.id,
    text: task.title,
    start_date: new Date(task.created_at),
    end_date: new Date(task.due_date!),
    progress: task.stage === 'Done' ? 1 : task.stage === 'In Progress' ? 0.5 : 0,
    priority: task.priority,
    originalTask: task
  }));

  console.log('Transformed Gantt tasks:', ganttTasks);

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      console.log('Task clicked:', task);
      onTaskClick(task);
    }
  };

  if (tasks.length === 0) {
    console.log('No tasks found');
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        No tasks found
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <Gantt
        tasks={ganttTasks}
        columns={columns}
        onClick={handleTaskClick}
        scales={["day"]}
        startDate={startDate}
        endDate={new Date(startDate.getTime() + (daysToShow * 24 * 60 * 60 * 1000))}
      />
    </div>
  );
};