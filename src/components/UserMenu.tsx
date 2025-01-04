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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserMenuProps {
  onProfileClick: (tab?: string) => void;
}

export const UserMenu = ({ onProfileClick }: UserMenuProps) => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  
  // Add query to fetch profile data including avatar_url
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getAvatarFallback = () => {
    // If we have a full name, use its initials
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    
    // If no full name or avatar, show bug icon
    return <Bug className="h-4 w-4" />;
  };

  const handleProfileClick = (tab?: string) => {
    setOpen(false);
    onProfileClick(tab);
  };

  // Use profile avatar_url if available, fallback to user metadata
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={avatarUrl} 
              alt={profile?.full_name || user?.email || ""} 
            />
            <AvatarFallback className="bg-[#123524] text-white">
              {getAvatarFallback()}
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