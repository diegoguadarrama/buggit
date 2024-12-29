import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskType } from '@/types/task';
import { Avatar } from './ui/avatar';
import { AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "./ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskProps {
  task: TaskType;
  isDragging?: boolean;
  onTaskClick?: (task: TaskType) => void;
}

export const Task = ({ task, isDragging, onTaskClick }: TaskProps) => {
  // Add query to fetch assignee's profile
  const { data: assigneeProfile } = useQuery({
    queryKey: ['profile', task.assignee],
    queryFn: async () => {
      if (!task.assignee) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, email')
        .eq('email', task.assignee)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!task.assignee,
  });

  // Rest of the existing code...

  return (
    <div
      ref={setNodeRef}
      style={style}
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
      
      {firstImage && (
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative mb-3 cursor-pointer group">
              <img 
                src={firstImage} 
                alt={task.title}
                className="w-full h-32 object-cover rounded-md"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-md flex items-center justify-center">
                <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <img 
              src={firstImage} 
              alt={task.title}
              className="w-full h-auto"
            />
          </DialogContent>
        </Dialog>
      )}
      
      <p 
        className="text-sm text-gray-600 mb-3 line-clamp-2 cursor-pointer hover:text-gray-900 transition-colors"
        onClick={handleTitleOrDescriptionClick}
      >
        {task.description}
      </p>
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          {task.assignee ? (
            <div className="flex items-center space-x-2 group">
              <Avatar className="h-6 w-6 transition-transform group-hover:scale-105">
                <AvatarImage 
                  src={assigneeProfile?.avatar_url} 
                  alt={assigneeProfile?.full_name || task.assignee} 
                />
                <AvatarFallback>
                  {(assigneeProfile?.full_name?.[0] || task.assignee[0]).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {assigneeProfile?.full_name || task.assignee}
              </span>
            </div>
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
