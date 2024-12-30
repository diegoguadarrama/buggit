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
      
      // Try to find profile by email first
      const { data: emailProfileData, error: emailError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', assignee)
        .maybeSingle();
      
      if (emailError) {
        console.error('Error fetching assignee profile by email:', emailError);
      } else if (emailProfileData) {
        console.log('Found profile by email:', emailProfileData);
        return emailProfileData;
      }
      
      // If no profile found by email or there was an error, try by ID (UUID)
      if (assignee.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', assignee)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error fetching assignee profile by ID:', profileError);
          return null;
        }

        console.log('Found profile by ID:', profileData);
        return profileData;
      }

      return null;
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