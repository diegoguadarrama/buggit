import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Task } from './Task';
import type { TaskType, Stage } from '@/types/task';
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
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col min-h-[calc(100vh-12rem)] w-full"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-sm text-gray-600 dark:text-gray-400">
              {tasks.length}
            </span>
          </div>
        </div>
      </div>

      <SortableContext 
        items={tasks.map(task => task.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="p-2 space-y-2 flex-1 overflow-y-auto">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Task 
                key={task.id} 
                task={task} 
                onTaskClick={handleTaskClick}
              />
            ))
          ) : (
            <div 
              onClick={onAddTask}
              className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <Plus className="h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Add a new task</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};