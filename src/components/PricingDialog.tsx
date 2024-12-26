import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "3 Projects",
      "Core Features",
      "100 MB of File Storage"
    ],
    priceId: null // Free plan doesn't need a price ID
  },
  {
    name: "Pro",
    price: "$14.99",
    period: "month",
    description: "Best for growing teams",
    features: [
      "Unlimited Projects",
      "5 members per project*",
      "10 GB of File Storage",
      "*$1.99 per month for each additional member"
    ],
    priceId: "price_1Qa9ZeGzG3fnRtlNnBE0md7z"
  },
  {
    name: "Unleashed",
    price: "$39.99",
    period: "month",
    description: "For power users",
    features: [
      "Unlimited Projects",
      "Unlimited Project Members",
      "100 GB of File Storage",
      "Billed annually"
    ],
    priceId: "price_1Qa9XvGzG3fnRtlNY3wKcn3c"
  },
];

interface PricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingDialog({ open, onOpenChange }: PricingDialogProps) {
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

  const handleUpgrade = async (planName: string, priceId: string | null) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upgrade your plan.",
          variant: "destructive",
        });
        return;
      }

      if (!priceId) {
        toast({
          title: "Invalid plan",
          description: "Cannot upgrade to this plan.",
          variant: "destructive",
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Pricing Plans</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 mt-4">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.tier.toLowerCase() === plan.name.toLowerCase();
            
            return (
              <Card key={plan.name} className={isCurrentPlan ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan || plan.name === "Free"}
                    onClick={() => handleUpgrade(plan.name, plan.priceId)}
                  >
                    {isCurrentPlan ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
