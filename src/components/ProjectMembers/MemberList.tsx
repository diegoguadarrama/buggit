import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Member {
  id: string;
  email: string;
  profile_id: string | null;
  profile: Profile | null;
}

interface MemberListProps {
  members: Member[];
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

  const getAvatarFallback = (member: any) => {
    if (member.profile?.full_name) {
      return member.profile.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase();
    }
    return member.email[0].toUpperCase();
  };

  return (
    <div className="space-y-2">
      {members?.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-2 rounded-md border">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.profile?.avatar_url} />
              <AvatarFallback className="bg-[#123524] text-white text-xs dark:bg-[#00ff80] dark:text-black">
                {getAvatarFallback(member)}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm">
                {member.profile?.full_name || member.email}
              </span>
              {(!member.profile_id || !member.profile) && ( // Updated condition
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
