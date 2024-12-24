import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthProvider";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Loader2, UserPlus, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ProjectMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export const ProjectMembersDialog = ({ open, onOpenChange, projectId }: ProjectMembersDialogProps) => {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      console.log('Fetching project members for project:', projectId);
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching project members:', error);
        throw error;
      }

      console.log('Fetched project members:', data);
      return data;
    },
    enabled: !!projectId,
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !projectId) return;

    setIsInviting(true);
    try {
      // Check if user exists in profiles
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('email', email)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: "Already invited",
          description: "This email has already been invited to the project.",
          variant: "destructive"
        });
        return;
      }

      // Add member with or without user_id
      const { error: inviteError } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: projectId,
            email: email,
            user_id: existingProfile?.id || null,
          }
        ]);

      if (inviteError) throw inviteError;

      toast({
        title: existingProfile ? "Member added" : "Invitation sent",
        description: existingProfile 
          ? "The user has been added to the project."
          : "The user will need to sign up with this email to access the project.",
      });

      setEmail("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Error adding member",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "The member has been removed from the project.",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project Members</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to invite"
              type="email"
              required
            />
            <Button type="submit" disabled={isInviting}>
              {isInviting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Members</h4>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-md border">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {member.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-sm">{member.email}</span>
                      {!member.user_id && (
                        <p className="text-xs text-muted-foreground">Pending signup</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};