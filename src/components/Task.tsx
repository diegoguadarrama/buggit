import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskType } from '@/types/task';
import { Avatar } from './ui/avatar';
import { AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar, Eye, User } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskProps {
  task: TaskType;
  isDragging?: boolean;
  onTaskClick: (task: TaskType) => void;
}

export const Task = ({ task, isDragging, onTaskClick }: TaskProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const { data: assigneeProfile, isError } = useQuery({
    queryKey: ['profile', task.assignee],
    queryFn: async () => {
      if (!task.assignee) return null;
      
      // First try to get the profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', task.assignee);

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      // If profile exists, return the first one
      if (profileData && profileData.length > 0) {
        return profileData[0];
      }

      // If no profile found, return a basic object with the email
      return {
        id: null,
        email: task.assignee,
        full_name: null,
        avatar_url: null
      };
    },
    enabled: !!task.assignee,
    // Don't retry on error for this query
    retry: false
  });

  const handleTitleOrDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskClick(task);
  };

  const firstImage = task.attachments?.[0];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className={`
        bg-white p-4 rounded-lg border shadow-sm
        cursor-grab active:cursor-grabbing
        hover:shadow-md hover:border-primary/20
        transition-all duration-200 touch-none
        ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}
      `}
    >
      {/* ... rest of your task header JSX ... */}

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          {task.assignee ? (
            <div className="flex items-center space-x-2 group">
              <Avatar className="h-6 w-6 transition-transform group-hover:scale-105">
                <AvatarImage 
                  src={assigneeProfile?.avatar_url || ''} 
                  alt={assigneeProfile?.full_name || task.assignee} 
                />
                <AvatarFallback>
                  {assigneeProfile?.full_name?.[0] || task.assignee[0].toUpperCase()}
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

        {/* ... rest of your task footer JSX ... */}
      </div>
    </div>
  );
};
