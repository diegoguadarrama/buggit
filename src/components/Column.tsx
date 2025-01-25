import { useEffect, useRef, useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Task } from './Task';
import type { TaskType, Stage } from '@/types/task';
import { Plus, ArrowDownAZ, ArrowUpAZ, Calendar, Clock, User } from 'lucide-react';
import { stages } from './useTaskBoard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type SortField = 'title' | 'priority' | 'assignee' | 'due_date' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

interface ColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onAddTask: () => void;
  onTaskClick?: (task: TaskType) => void;
  onSort?: (field: SortField, direction: SortDirection) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  activeId?: string | null;
  previewStage?: Stage | null;
}

export const Column = ({ 
  id, 
  title, 
  tasks, 
  onAddTask, 
  onTaskClick,
  onSort,
  sortField,
  sortDirection,
  activeId,
  previewStage
}: ColumnProps) => {
  const { setNodeRef } = useDroppable({ id });

  if (!stages.includes(id as Stage)) {
    console.error('Invalid stage ID:', id);
    return null;
  }

  const handleTaskClick = (task: TaskType) => {
    onTaskClick?.(task);
  };

  const handleSort = (field: SortField) => {
    if (onSort) {
      const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(field, newDirection);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />;
  };

  const isPreviewTarget = previewStage === id;

  return (
    <div 
      ref={setNodeRef}
      className={`
        rounded-lg bg-gray-100 dark:bg-gray-500 p-4 
        flex flex-col w-full h-fit
        ${isPreviewTarget ? 'ring-2 ring-primary ring-opacity-50' : ''}
      `}
    >
      {/* Column Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200">{title}</h2>
          <span className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full text-sm text-gray-600 dark:text-gray-300">
            {tasks.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8">
              {sortField ? getSortIcon(sortField) : <ArrowDownAZ className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort('title')}>
              <ArrowDownAZ className="h-4 w-4 mr-2" />
              Sort by Title
              {getSortIcon('title')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('priority')}>
              <ArrowDownAZ className="h-4 w-4 mr-2" />
              Sort by Priority
              {getSortIcon('priority')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('assignee')}>
              <User className="h-4 w-4 mr-2" />
              Sort by Assignee
              {getSortIcon('assignee')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('due_date')}>
              <Calendar className="h-4 w-4 mr-2" />
              Sort by Due Date
              {getSortIcon('due_date')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('created_at')}>
              <Clock className="h-4 w-4 mr-2" />
              Sort by Created Date
              {getSortIcon('created_at')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('updated_at')}>
              <Clock className="h-4 w-4 mr-2" />
              Sort by Updated Date
              {getSortIcon('updated_at')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

     <SortableContext 
        items={tasks.map(task => task.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div 
          className={`
            flex flex-col gap-3 
            ${tasks.length === 0 ? 'min-h-[120px]' : 'min-h-fit'}
          `}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Task 
                key={task.id} 
                task={task} 
                onTaskClick={handleTaskClick}
                className={`
                  ${task.id === activeId ? 'opacity-50' : ''}
                  transition-all duration-200
                `}
              />
            ))
          ) : (
            <div 
              onClick={onAddTask}
              className="
                bg-white dark:bg-gray-600 
                cursor-pointer 
                hover:border-primary/50 
                hover:shadow-md 
                transition-all duration-200 
                flex flex-col items-center justify-center 
                h-[120px] 
                border-2 border-dashed border-gray-200 dark:border-gray-600 
                rounded-lg
              "
            >
              <Plus className="h-6 w-6 text-gray-400 dark:text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Add a new task</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};
