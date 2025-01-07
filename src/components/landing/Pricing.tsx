import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from 'lucide-react'

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    period: "",
    features: [
      "3 Projects",
      "Core Features",
      "100 MB of File Storage"
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    isCurrentPlan: true,
    checkoutUrl: ""
  },
  {
    name: "Pro",
    description: "Best for growing teams",
    price: "$1.99",
    period: "/month",
    features: [
      "Unlimited Projects",
      "5 members per project",
      "10 GB of File Storage"
    ],
    buttonText: "Upgrade",
    buttonVariant: "default" as const,
    isCurrentPlan: false,
    checkoutUrl: "https://buy.stripe.com/fZe4hW5RBdpd1CUdQU"
  },
  {
    name: "Unleashed",
    description: "For power users. Billed annually.",
    price: "$8.25",
    period: "/month",
    features: [
      "Unlimited Projects",
      "Unlimited Project Members",
      "100 GB of File Storage"
    ],
    buttonText: "Upgrade",
    buttonVariant: "default" as const,
    isCurrentPlan: false,
    checkoutUrl: "https://buy.stripe.com/fZeg0E6VFfxl4P65kp"
  }
]

export default function Pricing() {
  const handleUpgrade = (url: string) => {
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <section id="pricing" className="py-20">
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
    </section>
  )
}