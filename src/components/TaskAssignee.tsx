import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bug } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskAssigneeProps {
  assignee: string;
  showNameOnDesktop?: boolean;
}

export const TaskAssignee = ({ assignee, showNameOnDesktop = true }: TaskAssigneeProps) => {
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

  const getAvatarFallback = () => {
    if (isError) {
      return <Bug className="h-4 w-4" />;
    }
    
    // If we have a full name, use its initials
    if (assigneeProfile?.full_name) {
      return assigneeProfile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    
    // If no full name or avatar, show bug icon
    return <Bug className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center space-x-2 group">
      <Avatar className="h-6 w-6 transition-transform group-hover:scale-105">
        <AvatarImage 
          src={assigneeProfile?.avatar_url} 
          alt={assigneeProfile?.full_name || ''} 
        />
        <AvatarFallback className="bg-[#00ff00] text-white text-xs">
          {getAvatarFallback()}
        </AvatarFallback>
      </Avatar>
      {showNameOnDesktop && (
        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
          {assigneeProfile?.full_name || assigneeProfile?.email || assignee}
        </span>
      )}
    </div>
  );
};
