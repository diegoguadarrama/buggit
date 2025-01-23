import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Check } from 'lucide-react'
import { supabase } from "@/integrations/supabase/client"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Up to 3 Projects",
      "Access to all Features",
      "100 MB of File Storage"
    ],
    priceId: null
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "month",
    description: "Best for growing teams",
    features: [
      "Everything in Free",
      "Unlimited projects",
      "10 GB of File Storage"
    ],
    priceId: "price_1QjlXeGzG3fnRtlNZ42xtgNB"
  },
  {
    name: "Unleashed",
    price: "$8.25",
    period: "month",
    description: "For power users. Billed annually.",
    features: [
      "Everything in Pro",
      "100 GB of File Storage"
    ],
    priceId: "price_1QcrzyGzG3fnRtlNkBROAAQY"
  },
];

export default function Pricing() {
  const handleUpgrade = async (planName: string, priceId: string | null) => {
    try {
      console.log('Starting upgrade process for plan:', planName);
      
      if (!priceId) {
        // Redirect to login for free plan
        window.location.href = '/login';
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login for authenticated plans
        window.location.href = '/login';
        return;
      }

      console.log('Invoking create-checkout-session with priceId:', priceId);
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
      });

      console.log('Checkout session response:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { checkoutUrl, portalUrl } = response.data;
      console.log('Received URLs:', { checkoutUrl, portalUrl });

      // Store portal URL for later use
      if (portalUrl) {
        localStorage.setItem('stripePortalUrl', portalUrl);
      }

      // Redirect to checkout
      if (checkoutUrl) {
        console.log('Redirecting to:', checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        console.error('No checkoutUrl received in response');
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      // For landing page, we'll just redirect to login on error
      window.location.href = '/login';
    }
  };

  return (
    <div className="w-full py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-500">/{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={plan.name === "Free" ? "outline" : "default"}
                  onClick={() => handleUpgrade(plan.name, plan.priceId)}
                >
                  {plan.name === "Free" ? "Get Started" : "Upgrade"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
