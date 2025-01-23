import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Bug, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/components/ProjectContext';
import { useState } from 'react';
import { ProjectMembersDialog } from './ProjectMembersDialog';
import { useQuery } from '@tanstack/react-query';

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
  const { currentProject } = useProject();
  const effectiveProjectId = projectId || currentProject?.id;
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['project-members', effectiveProjectId],
    queryFn: async () => {
      if (!effectiveProjectId) return [];
      console.log("Fetching project members for project:", effectiveProjectId);
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
        .eq('project_id', effectiveProjectId);

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
    enabled: !!effectiveProjectId,
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

  // Only find selectedMember if value is not 'unassigned'
  const selectedMember = value && value !== 'unassigned' 
    ? members.find((m) => m.id === value)
    : null;

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Error loading members. Please try again.
      </div>
    );
  }

  const handleInviteClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMembersDialog(true);
  };

  return (
    <>
      <Select 
        value={value}
        onValueChange={onValueChange}
        disabled={isLoading || !effectiveProjectId}
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
            <SelectItem key={member.id} value={member.id}>
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
          <div 
            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleInviteClick}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-green-100 text-green-600">
                <UserPlus className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span>Invite Members</span>
          </div>
        </SelectContent>
      </Select>
      {showMembersDialog && (
        <ProjectMembersDialog
          open={showMembersDialog}
          onOpenChange={setShowMembersDialog}
        />
      )}
    </>
  );
};
