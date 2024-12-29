import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bug, User, CreditCard } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useState } from "react";

interface UserMenuProps {
  onProfileClick: (tab?: string) => void;
}

export const UserMenu = ({ onProfileClick }: UserMenuProps) => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  
  const getInitials = () => {
    if (!user?.email) return "";
    return user.email
      .split("@")[0]
      .split(".")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleProfileClick = (tab?: string) => {
    setOpen(false);
    onProfileClick(tab);
  };

  const avatarUrl = user?.user_metadata?.avatar_url || `https://avatar.vercel.sh/${user?.email}.png`;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={avatarUrl} 
              alt={user?.email || ""}
            />
            <AvatarFallback>
              {getInitials() || <Bug className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleProfileClick('profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleProfileClick('subscription')}>
          <CreditCard className="mr-2 h-4 w-4" />
          Pricing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setOpen(false);
          signOut();
        }}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
