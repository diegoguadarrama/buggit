import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from './Task';
import type { TaskType } from './TaskBoard';

interface ColumnProps {
  title: string;
  tasks: TaskType[];
}

export const Column = ({ title, tasks }: ColumnProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h2 className="font-semibold mb-4">{title}</h2>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};