import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
      
      // First, get all members through the profiles_projects junction table
      const { data: memberships, error: membershipsError } = await supabase
        .from('profiles_projects')
        .select(`
          email,
          profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId);

      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
        throw membershipsError;
      }

      // For any member without a profile, fetch their profile directly
      const membersWithoutProfiles = memberships
        .filter(m => !m.profiles)
        .map(m => m.email);

      let additionalProfiles: any[] = [];
      if (membersWithoutProfiles.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url')
          .in('email', membersWithoutProfiles);

        if (!profilesError && profiles) {
          additionalProfiles = profiles;
        }
      }

      // Combine all member data
      const allMembers = memberships.map(m => {
        if (m.profiles) {
          return {
            id: m.profiles.id,
            email: m.profiles.email,
            full_name: m.profiles.full_name,
            avatar_url: m.profiles.avatar_url
          };
        }
        
        // Look for profile in additional profiles
        const additionalProfile = additionalProfiles.find(p => p.email === m.email);
        if (additionalProfile) {
          return {
            id: additionalProfile.id,
            email: additionalProfile.email,
            full_name: additionalProfile.full_name,
            avatar_url: additionalProfile.avatar_url
          };
        }

        // Fallback for members without profiles
        return {
          id: '',
          email: m.email,
          full_name: null,
          avatar_url: null
        };
      });

      console.log('Processed project members:', allMembers);
      return allMembers;
    },
    enabled: !!projectId,
  });

  if (isLoadingMembers) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Assign To</label>
        <div className="flex items-center space-x-2 h-10 px-3 rounded-md border border-input bg-transparent">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Loading members...</span>
        </div>
      </div>
    );
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
                    {(projectMembers.find(m => m.email === value)?.full_name?.[0] || value[0]).toUpperCase()}
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
            <SelectItem key={member.email} value={member.email}>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage 
                    src={member.avatar_url || ''} 
                    alt={member.full_name || member.email} 
                  />
                  <AvatarFallback>
                    {(member.full_name?.[0] || member.email[0]).toUpperCase()}
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
