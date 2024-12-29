import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskType } from '@/types/task';
import { Avatar } from './ui/avatar';
import { AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar, Eye, User } from 'lucide-react';
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
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Add query to fetch assignee's profile with better error handling
  const { data: assigneeProfile, isError } = useQuery({
    queryKey: ['profile', task.assignee],
    queryFn: async () => {
      if (!task.assignee) return null;
      console.log('Fetching profile for assignee:', task.assignee);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, email')
        .eq('email', task.assignee)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching assignee profile:', error);
        throw error;
      }
      
      console.log('Fetched assignee profile:', data);
      return data;
    },
    enabled: !!task.assignee,
  });

  const handleClick = () => {
    console.log('Task handleClick called');
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

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
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Dialog>
            <DialogTrigger asChild>
              <button 
                onClick={handleClick}
                className="text-left hover:text-primary transition-colors"
              >
                <h3 className="font-medium">{task.title}</h3>
              </button>
            </DialogTrigger>
            <DialogContent>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{task.title}</h2>
                {task.description && (
                  <p className="text-gray-600">{task.description}</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <button
            onClick={handleClick}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Eye className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          {task.assignee ? (
            <div className="flex items-center space-x-2 group">
              <Avatar className="h-6 w-6 transition-transform group-hover:scale-105">
                <AvatarImage 
                  src={assigneeProfile?.avatar_url || undefined} 
                  alt={assigneeProfile?.full_name || task.assignee} 
                />
                <AvatarFallback>
                  {isError ? (
                    <User className="h-4 w-4" />
                  ) : (
                    (assigneeProfile?.full_name?.[0] || task.assignee[0]).toUpperCase()
                  )}
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

          {task.due_date && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};