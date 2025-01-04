import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

interface InviteFormProps {
  onInvite: (email: string) => Promise<void>;
  canAddMembers: boolean;
  memberLimitMessage: React.ReactNode;
}

export const InviteForm = ({ onInvite, canAddMembers, memberLimitMessage }: InviteFormProps) => {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await onInvite(email);
      setEmail("");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email to invite"
          type="email"
          required
          disabled={!canAddMembers}
        />
        <Button type="submit" disabled={isInviting || !canAddMembers}>
          {isInviting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {memberLimitMessage}
      </p>
    </form>
  );
};