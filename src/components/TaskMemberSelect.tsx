// src/components/TaskMemberSelect.tsx

import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bug } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Member {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface TaskMemberSelectProps {
  projectId?: string;
  value: string;
  onValueChange: (value: string) => void;
}

export const TaskMemberSelect = ({
  projectId,
  value,
  onValueChange,
}: TaskMemberSelectProps) => {
  const { data: members = [], isLoading, error } = useQuery<Member[]>({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data: membersData, error } = await supabase
        .from('profiles_projects')
        .select(`
          profile:profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching project members:', error);
        throw error;
      }

      return (membersData
        ?.filter((member) => member.profile)
        .map((member) => ({
          id: member.profile.id,
          email: member.profile.email,
          full_name: member.profile.full_name,
          avatar_url: member.profile.avatar_url,
        })) || []) as Member[];
    },
    enabled: !!projectId,
  });

  const getAvatarFallback = (member: Member) => {
    if (member.full_name) {
      return member.full_name
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase();
    }
    return <Bug className="h-4 w-4" />;
  };

  const selectedMember = members.find((m) => m.id === value);

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Error loading members. Please try again.
      </div>
    );
  }

  return (
    <Select 
      value={value || ''} 
      onValueChange={onValueChange}
      disabled={isLoading || !projectId}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Unassigned">
          {selectedMember ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedMember.avatar_url || undefined} />
                <AvatarFallback className="bg-[#123524] text-white text-xs dark:bg-[#00ff80] dark:text-black">
                  {getAvatarFallback(selectedMember)}
                </AvatarFallback>
              </Avatar>
              <span>{selectedMember.full_name || selectedMember.email}</span>
            </div>
          ) : (
            'Unassigned'
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">
        <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-gray-200 text-gray-600">
                ?
              </AvatarFallback>
            </Avatar>
            <span>Unassigned</span>
          </div>
        </SelectItem>
        {members.map((member) => (
          <SelectItem 
            key={member.id} 
            value={member.id}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="bg-[#123524] text-white text-xs dark:bg-[#00ff80] dark:text-black">
                  {getAvatarFallback(member)}
                </AvatarFallback>
              </Avatar>
              <span>{member.full_name || member.email}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
