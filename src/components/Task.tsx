import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskType } from '@/types/task';
import { Archive, Calendar, Undo2 } from 'lucide-react';
import { format, isPast, isToday, addDays } from 'date-fns';
import { Avatar, AvatarFallback } from './ui/avatar';
import { TaskAssignee } from './TaskAssignee';
import { TaskAttachment } from './TaskAttachment';
import { Button } from './ui/button';

interface TaskProps {
  task: TaskType;
  isDragging?: boolean;
  onTaskClick: (task: TaskType) => void;
  onTaskUpdate?: (task: TaskType) => Promise<void>;
}

const getDateColor = (dueDate: string | undefined) => {
  if (!dueDate) return 'text-gray-500';
  
  const date = new Date(dueDate);
  
  if (isPast(date)) {
    return 'text-red-500';
  }
  
  if (isToday(date)) {
    return 'text-red-500';
  }
  
  if (isPast(addDays(new Date(), 2))) {
    return 'text-orange-500';
  }
  
  return 'text-gray-500';
};

export const Task = ({ task, isDragging, onTaskClick, onTaskUpdate }: TaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: task.id });

  const taskStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.task-attachment')) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Task handleClick called with task:', task);
      onTaskClick(task);
    }
  };

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTaskUpdate) {
      await onTaskUpdate({
        ...task,
        archived: false
      });
    }
  };

  const firstImage = task.attachments?.[0];

  return (
    <div
      ref={setNodeRef}
      style={taskStyle}
      {...attributes}
      className={`
        bg-white p-4 rounded-lg border shadow-sm
        cursor-pointer
        hover:shadow-md hover:border-primary/20
        transition-all duration-200 touch-none
        ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}
        ${isSortableDragging ? 'opacity-50' : ''}
        ${task.archived ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div {...listeners} className="cursor-grab active:cursor-grabbing h-3 w-full mb-2">
        <div className="w-8 h-1 bg-gray-200 rounded mx-auto" />
      </div>

      <div onClick={handleClick}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">
            {task.title}
          </h3>
          {task.archived && onTaskUpdate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-2"
              onClick={handleUnarchive}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {firstImage && (
          <div className="task-attachment">
            <TaskAttachment image={firstImage} title={task.title} />
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            {task.assignee ? (
              <TaskAssignee assignee={task.assignee} />
            ) : (
              <div className="flex items-center space-x-2 group">
                <Avatar className="h-6 w-6 transition-transform group-hover:scale-105">
                  <AvatarFallback className="bg-[#123524] text-white text-xs">?</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Unassigned
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div 
              className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${task.priority === 'high' ? 'bg-red-100 text-red-700' : ''}
                ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${task.priority === 'low' ? 'bg-green-100 text-green-700' : ''}
              `}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </div>
            <div className="flex items-center gap-2">
              {task.due_date && (
                <div className={`flex items-center ${getDateColor(task.due_date)}`}>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {format(new Date(task.due_date + 'T00:00:00'), 'MMM d')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
