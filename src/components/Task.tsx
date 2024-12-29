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
  // Modified query to fetch assignee's profile through the profiles_projects junction table
  const { data: assigneeProfile } = useQuery({
    queryKey: ['task-assignee', task.project_id, task.assignee],
    queryFn: async () => {
      if (!task.assignee || !task.project_id) return null;

      // First get the profile data from profiles_projects
      const { data: memberProfile, error: memberError } = await supabase
        .from('profiles_projects')
        .select(`
          profiles (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('project_id', task.project_id)
        .eq('email', task.assignee)
        .single();

      if (memberError || !memberProfile?.profiles) {
        // Fallback to direct profiles query if not found in profiles_projects
        const { data: directProfile, error: directError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, email')
          .eq('email', task.assignee)
          .single();

        if (directError) return null;
        return directProfile;
      }

      return memberProfile.profiles;
    },
    enabled: !!task.assignee && !!task.project_id,
  });

  // Rest of the component code remains the same until the assignee section
  // ...

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
      {/* ... previous JSX code ... */}
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          {task.assignee ? (
            <div className="flex items-center space-x-2 group">
              <Avatar className="h-6 w-6 transition-transform group-hover:scale-105">
                <AvatarImage 
                  src={assigneeProfile?.avatar_url || undefined} 
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
        
        {/* ... rest of the component JSX ... */}
      </div>
    </div>
  );
};
