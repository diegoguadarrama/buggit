import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectMember {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface TaskMemberSelectProps {
  projectId: string | undefined;
  value: string;
  onValueChange: (value: string) => void;
}

export const TaskMemberSelect = ({ projectId, value, onValueChange }: TaskMemberSelectProps) => {
  const { data: projectMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      console.log('Fetching project members for project:', projectId);
      
      // First get all member profiles through the profiles_projects junction table
      const { data: memberships, error: membershipsError } = await supabase
        .from('profiles_projects')
        .select('profile_id')
        .eq('project_id', projectId);

      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
        throw membershipsError;
      }

      // Get the actual profiles for these members
      const profileIds = memberships
        .map(m => m.profile_id)
        .filter((id): id is string => id !== null);

      if (profileIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .in('id', profileIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Fetched project members:', profiles);
      return profiles as ProjectMember[];
    },
    enabled: !!projectId,
  });

  if (isLoadingMembers) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Assign To</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a Project Member">
            {value && projectMembers.find(m => m.email === value) && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage 
                    src={projectMembers.find(m => m.email === value)?.avatar_url || ''} 
                    alt={projectMembers.find(m => m.email === value)?.full_name || value} 
                  />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span>
                  {projectMembers.find(m => m.email === value)?.full_name || value}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {projectMembers.map((member) => (
            <SelectItem key={member.id} value={member.email}>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member.avatar_url || ''} alt={member.full_name || member.email} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span>{member.full_name || member.email}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};