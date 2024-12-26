import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection } from "./ProfileSection";
import { PricingSection } from "./PricingSection";

export interface ProfileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

export function ProfileSidebar({ open, onOpenChange, defaultTab = 'profile' }: ProfileSidebarProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No profile found, creating one');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, email: user.email }])
          .select()
          .single();

        if (createError) throw createError;
        return newProfile;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('Profile fetch error:', error);
    toast({
      title: "Error loading profile",
      description: "Please try again later.",
      variant: "destructive",
    });
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-[400px] sm:w-[540px]"
        style={{ '--removed-close-button': 'none' } as React.CSSProperties}
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Settings</SheetTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </SheetHeader>
        
        <Tabs defaultValue={defaultTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-6">
            <ProfileSection profile={profile} onClose={() => onOpenChange(false)} />
          </TabsContent>
          <TabsContent value="subscription" className="mt-6">
            <PricingSection />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}