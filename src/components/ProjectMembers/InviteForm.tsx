import { Input } from "../ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";

interface InviteFormProps {
  onInvite: (email: string) => Promise<void>;
  canAddMembers: boolean;
  memberLimitMessage: React.ReactNode;
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const InviteForm = ({ onInvite, canAddMembers, memberLimitMessage }: InviteFormProps) => {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAddMembers) {
      return; // Don't process form if members can't be added
    }
    
    if (!email.trim()) {
      toast({
        title: "Invalid email",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email.trim())) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      await onInvite(email.trim());
      setEmail("");
    } catch (error) {
      console.error('Invite error:', error);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!canAddMembers || isInviting}
        />
        <Button 
          type="submit" 
          disabled={!canAddMembers || isInviting}
        >
          {isInviting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        {memberLimitMessage}
      </p>
    </div>
  );
};