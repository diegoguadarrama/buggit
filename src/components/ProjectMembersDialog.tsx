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
import { PricingDialog } from "./PricingDialog";

interface ProjectMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export const ProjectMembersDialog = ({ open, onOpenChange, projectId }: ProjectMembersDialogProps) => {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      console.log('Fetching project members for project:', projectId);
      const { data, error } = await supabase
        .from('profiles_projects')
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

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const canAddMembers = () => {
    if (!subscription) return false;
    
    const currentMemberCount = members?.length || 0;
    
    switch (subscription.tier) {
      case 'free':
        return false; // Free tier cannot add members
      case 'pro':
        return currentMemberCount < 5; // Pro tier limited to 5 members
      case 'unleashed':
        return true; // Unleashed tier has no limit
      default:
        return false;
    }
  };

  const getMemberLimitMessage = () => {
    if (!subscription) return "Loading...";
    
    switch (subscription.tier) {
      case 'free':
        return (
          <span>
            Free tier cannot add project members.{" "}
            <button 
              onClick={() => setShowPricing(true)}
              className="underline text-primary hover:text-primary/80"
            >
              Upgrade
            </button>
            {" "}to Pro or Unleashed to add members.
          </span>
        );
      case 'pro':
        const remainingSlots = 5 - (members?.length || 0);
        if (remainingSlots <= 0) {
          return (
            <span>
              You've reached the 5 member limit for Pro tier.{" "}
              <button 
                onClick={() => setShowPricing(true)}
                className="underline text-primary hover:text-primary/80"
              >
                Upgrade
              </button>
              {" "}to Unleashed for unlimited members.
            </span>
          );
        }
        return `Pro tier: ${remainingSlots} member slot${remainingSlots === 1 ? '' : 's'} remaining`;
      case 'unleashed':
        return "Unleashed tier: Unlimited members";
      default:
        return "";
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !projectId) return;

    if (!canAddMembers()) {
      toast({
        title: "Cannot add members",
        description: getMemberLimitMessage(),
        variant: "destructive"
      });
      return;
    }

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
        .from('profiles_projects')
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

      // Add member with or without profile_id
      const { error: inviteError } = await supabase
        .from('profiles_projects')
        .insert([
          {
            project_id: projectId,
            email: email,
            profile_id: existingProfile?.id || null,
          }
        ]);

      if (inviteError) throw inviteError;

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'project_invitation',
          to: email,
          projectName: project?.name
        },
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
      }

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
        .from('profiles_projects')
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
    <>
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
                disabled={!canAddMembers()}
              />
              <Button type="submit" disabled={isInviting || !canAddMembers()}>
                {isInviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {getMemberLimitMessage()}
            </p>
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
                        {!member.profile_id && (
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

      <PricingDialog
        open={showPricing}
        onOpenChange={setShowPricing}
      />
    </>
  );
};