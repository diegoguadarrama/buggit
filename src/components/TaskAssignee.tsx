import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskAssigneeProps {
  assignee: string;
}

export const TaskAssignee = ({ assignee }: TaskAssigneeProps) => {
  const { data: assigneeProfile, isError } = useQuery({
    queryKey: ['profile', assignee],
    queryFn: async () => {
      if (!assignee) return null;
      
      console.log('Fetching profile for assignee:', assignee);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', assignee)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching assignee profile:', profileError);
        return null;
      }

      console.log('Found profile:', profileData);
      return profileData;
    },
    enabled: !!assignee,
  });

  return (
    <div className="flex items-center space-x-2 group">
      <Avatar className="h-6 w-6 transition-transform group-hover:scale-105">
        <AvatarImage 
          src={assigneeProfile?.avatar_url} 
          alt={assigneeProfile?.full_name || assigneeProfile?.email || ''} 
        />
        <AvatarFallback>
          {isError ? (
            <User className="h-4 w-4" />
          ) : (
            (assigneeProfile?.full_name?.[0] || assigneeProfile?.email?.[0] || '?').toUpperCase()
          )}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
        {assigneeProfile?.full_name || assigneeProfile?.email || 'Unknown'}
      </span>
    </div>
  );
};