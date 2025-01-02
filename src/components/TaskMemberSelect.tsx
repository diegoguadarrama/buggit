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
        .select(`
          profile:profiles (
            id,
            email,
            full_name
          )
        `)
        .eq("project_id", projectId);

      if (error) {
        console.error("Error fetching project members:", error);
        throw error;
      }

      // Filter out any members without a profile and transform the data
      const validMembers = membersData
        ?.filter(member => member.profile?.id)
        .map(member => ({
          id: member.profile.id,
          email: member.profile.email,
          full_name: member.profile.full_name
        })) || [];
        
      console.log("Valid members with profiles:", validMembers);
      return validMembers;
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
          <SelectItem value="">Unassigned</SelectItem>
          {members?.map((member) => (
            <SelectItem 
              key={member.id} 
              value={member.id}
            >
              {member.full_name || member.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};