import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { PricingDialog } from "./PricingDialog";
import { MemberList } from "./ProjectMembers/MemberList";
import { InviteForm } from "./ProjectMembers/InviteForm";

interface ProjectMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export const ProjectMembersDialog = ({ open, onOpenChange, projectId }: ProjectMembersDialogProps) => {
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
        return currentMemberCount < 4;
      case 'pro':
        return currentMemberCount < 6;
      case 'unleashed':
        return true;
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
            Free tier can add up to 3 members per project.{" "}
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

  const handleInvite = async (email: string) => {
    if (!user || !projectId) return;

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

      refetch();
    } catch (error: any) {
      toast({
        title: "Error adding member",
        description: error.message,
        variant: "destructive"
      });
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
          
          <InviteForm
            onInvite={handleInvite}
            canAddMembers={canAddMembers()}
            memberLimitMessage={getMemberLimitMessage()}
          />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Members</h4>
            <MemberList
              members={members || []}
              isLoading={isLoading}
              onRemoveMember={handleRemoveMember}
            />
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
