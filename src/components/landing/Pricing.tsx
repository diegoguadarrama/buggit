import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from 'lucide-react'

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
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    isCurrentPlan: true,
    checkoutUrl: "https://www.buggit.com/login"
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
  const handleUpgrade = (url: string) => {
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className="w-full py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col ${plan.isCurrentPlan ? 'border-primary border-2' : ''}`}>
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={plan.buttonVariant}
                  className={`w-full mt-6 ${plan.isCurrentPlan ? 'bg-white text-primary border-primary hover:bg-gray-100' : 'bg-primary text-white hover:bg-primary/90'}`}
                  onClick={() => handleUpgrade(plan.checkoutUrl)}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
