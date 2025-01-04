import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";

interface MemberListProps {
  members: any[];
  isLoading: boolean;
  onRemoveMember: (memberId: string) => void;
}

export const MemberList = ({ members, isLoading, onRemoveMember }: MemberListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members?.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-2 rounded-md border">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {member.email ? member.email[0].toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm">{member.email || 'No email provided'}</span>
              {!member.profile_id && member.email && (
                <p className="text-xs text-muted-foreground">Pending signup</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveMember(member.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};