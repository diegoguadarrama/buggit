import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Task } from './Task';
import type { TaskType } from './TaskBoard';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface ColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onAddTask: () => void;
}

export const Column = ({ id, title, tasks, onAddTask }: ColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: id
  });

  return (
    <div 
      ref={setNodeRef}
      className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[500px] flex flex-col"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">{title}</h2>
        <span className="bg-gray-200 px-2 py-0.5 rounded-full text-sm text-gray-600">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1">
          {tasks.map((task) => (
            <Task key={task.id} task={task} />
          ))}
          
          {tasks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 min-h-[200px]">
              <p className="text-sm mb-4">No tasks yet</p>
              <Button variant="outline" size="sm" onClick={onAddTask}>
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};