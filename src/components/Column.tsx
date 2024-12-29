import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Task } from './Task';
import type { TaskType, Stage } from '@/types/task';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { stages } from './useTaskBoard';

interface ColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onAddTask: () => void;
  onTaskClick?: (task: TaskType) => void;
}

export const Column = ({ id, title, tasks, onAddTask, onTaskClick }: ColumnProps) => {
  // Make sure 'id' is one of the valid stages
  if (!stages.includes(id as Stage)) {
    console.error('Invalid stage ID:', id);
    return null;
  }

  const handleTaskClick = (task: TaskType) => {
    console.log('Column handleTaskClick called with task:', task);
    console.log('onTaskClick is:', onTaskClick ? 'defined' : 'undefined');
    if (onTaskClick) {
      onTaskClick(task);
      console.log('onTaskClick was called');
    }
  };
  
  const { setNodeRef } = useDroppable({
    id: id
  });

  return (
    <div 
      ref={setNodeRef}
      className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">{title}</h2>
        <span className="bg-gray-200 px-2 py-0.5 rounded-full text-sm text-gray-600">
          {tasks.length}
        </span>
      </div>

      <SortableContext 
        items={tasks.map(task => task.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 flex-1 overflow-y-auto min-h-[500px]">
          {tasks.map((task) => (
            <Task 
              key={task.id} 
              task={task} 
              onTaskClick={handleTaskClick}
            />
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