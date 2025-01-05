import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Task } from './Task';
import type { TaskType, Stage } from '@/types/task';
import { Plus } from 'lucide-react';
import { stages } from './useTaskBoard';
import { useTranslation } from 'react-i18next';

interface ColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onAddTask: () => void;
  onTaskClick?: (task: TaskType) => void;
}

export const Column = ({ id, title, tasks, onAddTask, onTaskClick }: ColumnProps) => {
  const { t } = useTranslation();
  
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
      className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 min-h-[200px] w-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200">
            {t(`task.stage.${id.toLowerCase()}`)}
          </h2>
          <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-sm text-gray-600 dark:text-gray-300">
            {tasks.length}
          </span>
        </div>
      </div>

      <SortableContext 
        items={tasks.map(task => task.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 flex-1">
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
              className="bg-white dark:bg-gray-700 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center h-[120px] border-2 border-dashed rounded-lg dark:border-gray-600 dark:hover:border-primary/50"
            >
              <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.addTask')}</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};