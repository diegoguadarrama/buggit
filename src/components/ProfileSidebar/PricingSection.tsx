import { PricingPlans } from "../PricingPlans";

export function PricingSection() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Subscription Plans</h3>
      <PricingPlans />
    </div>
  );
}