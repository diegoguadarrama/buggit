import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { data: members, isLoading } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      console.log("Fetching project members for project:", projectId);
      
      const { data: membersData, error } = await supabase
        .from("profiles_projects")
        .select("*")
        .eq("project_id", projectId);

      if (error) {
        console.error("Error fetching project members:", error);
        throw error;
      }

      // For each member, try to get their profile
      const membersWithProfiles = await Promise.all(
        membersData.map(async (member) => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", member.profile_id)
              .maybeSingle();

            if (profileError) {
              console.error("Error fetching profile for member:", member.email, profileError);
            }

            return {
              ...member,
              profile,
            };
          } catch (error) {
            console.error("Error processing member:", member.email, error);
            return {
              ...member,
              profile: null,
            };
          }
        })
      );

      console.log("Members with profiles:", membersWithProfiles);
      return membersWithProfiles;
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Assignee</label>
        <Select disabled value={value} onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Loading members..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Assignee</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select assignee" />
        </SelectTrigger>
        <SelectContent>
          {members?.map((member) => (
            <SelectItem key={member.email} value={member.email}>
              {member.profile?.full_name || member.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};