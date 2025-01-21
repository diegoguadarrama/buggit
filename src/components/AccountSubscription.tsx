import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { useQuery } from "@tanstack/react-query";

export function AccountSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: subscription, isLoading } = useQuery({
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

  const handleManageSubscription = async () => {
    try {
      const response = await supabase.functions.invoke('create-portal-session', {
        body: {},
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to open subscription management",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Subscription</h3>
        <p className="text-sm text-muted-foreground">
          You are currently on the {subscription.tier} plan.
        </p>
      </div>
      <Button onClick={handleManageSubscription}>
        Manage Subscription
      </Button>
    </div>
  );
}
