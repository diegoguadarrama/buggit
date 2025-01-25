import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bug } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

interface TaskAssigneeProps {
  assignee: string;
  showNameOnDesktop?: boolean;
}

export const TaskAssignee = ({ assignee, showNameOnDesktop = true }: TaskAssigneeProps) => {
  // Only fetch profile if assignee is not "unassigned" and looks like a UUID
  const isValidUUID = useMemo(() => 
    assignee && 
    assignee !== 'unassigned' && 
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignee),
    [assignee]
  );
  
  const { data: assigneeProfile, isError } = useQuery({
    queryKey: ['profile', assignee],
    queryFn: async () => {
      if (!isValidUUID) return null;
      
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
    enabled: isValidUUID,
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
  });

  const getAvatarFallback = () => {
    if (!isValidUUID) {
      return 'U';
    }
    
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
        <AvatarFallback className="bg-[#123524] text-white text-xs dark:bg-[#00ff80] dark:text-black">
          {getAvatarFallback()}
        </AvatarFallback>
      </Avatar>
      {showNameOnDesktop && (
        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
          {!isValidUUID ? 'Unassigned' : (assigneeProfile?.full_name || assigneeProfile?.email || 'Unknown User')}
        </span>
      )}
    </div>
  );
};