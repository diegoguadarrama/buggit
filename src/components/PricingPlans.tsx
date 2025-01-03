import { Button } from "@/components/ui/button";
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
    features: ["Up to 3 projects", "Basic task management", "Core features"],
    priceId: null
  },
  {
    name: "Pro",
    price: "$14.99",
    period: "month",
    description: "Best for professionals",
    features: ["Unlimited projects", "Advanced task tracking", "Priority support", "Custom fields"],
    priceId: "price_1Qa9ZeGzG3fnRtlNnBE0md7z"
  },
  {
    name: "Unleashed",
    price: "$39.99",
    period: "month",
    description: "For power users",
    features: ["Everything in Pro", "API access", "Custom workflows", "Advanced analytics", "24/7 support"],
    priceId: "price_1Qa9XvGzG3fnRtlNY3wKcn3c"
  },
];

export function PricingPlans() {
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
      if (!priceId) {
        toast({
          title: "Invalid plan",
          description: "Cannot upgrade to this plan.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
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
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
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
  );
}