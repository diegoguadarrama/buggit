import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskType } from '@/types/task';
import { Calendar, User } from 'lucide-react';
import { format, isPast, isToday, addDays } from 'date-fns';
import { Avatar, AvatarFallback } from './ui/avatar';
import { TaskAssignee } from './TaskAssignee';
import { TaskAttachment } from './TaskAttachment';

interface TaskProps {
  task: TaskType;
  isDragging?: boolean;
  onTaskClick: (task: TaskType) => void;
}

const getDateColor = (dueDate: string | undefined) => {
  if (!dueDate) return 'text-gray-500';
  
  const date = new Date(dueDate);
  
  if (isPast(date) && !isToday(date)) {
    return 'text-red-500';
  }
  
  if (isToday(date)) {
    return 'text-orange-500';
  }
  
  if (isPast(addDays(new Date(), 2))) {
    return 'text-yellow-500';
  }
  
  return 'text-green-500';
};

export const Task = ({ task, isDragging, onTaskClick }: TaskProps) => {
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

  const handleTitleOrDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskClick(task);
  };

  const firstImage = task.attachments?.[0];

  return (
    <div
      ref={setNodeRef}
      style={taskStyle}
      {...attributes}
      {...listeners}
      className={`
        bg-white p-4 rounded-lg border shadow-sm
        cursor-grab active:cursor-grabbing
        hover:shadow-md hover:border-primary/20
        transition-all duration-200 touch-none
        ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}
        ${isSortableDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 
          className="font-medium cursor-pointer hover:text-primary transition-colors"
          onClick={handleTitleOrDescriptionClick}
        >
          {task.title}
        </h3>
      </div>
      
      {firstImage && <TaskAttachment image={firstImage} title={task.title} />}
      
      <p 
        className="text-sm text-gray-600 mb-3 line-clamp-2 cursor-pointer hover:text-gray-900 transition-colors"
        onClick={handleTitleOrDescriptionClick}
      >
        {task.description}
      </p>
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          {task.assignee ? (
            <TaskAssignee assignee={task.assignee} />
          ) : (
            <div className="flex items-center space-x-2 group">
              <Avatar className="h-6 w-6 transition-transform group-hover:scale-105">
                <AvatarFallback>?</AvatarFallback>
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
                  {format(new Date(task.due_date), 'MMM d')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};