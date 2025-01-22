import { Input } from "../ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";

interface InviteFormProps {
  onInvite: (email: string) => Promise<void>;
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const InviteForm = ({ onInvite }: InviteFormProps) => {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      toast({
        title: "Error sending invitation",
        description: "Please try again later",
        variant: "destructive",
      });
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
          disabled={isInviting}
        />
        <Button 
          type="submit" 
          disabled={isInviting}
        >
          {isInviting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};