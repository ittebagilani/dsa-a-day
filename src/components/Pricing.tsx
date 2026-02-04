import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
  buttonVariant?: "default" | "hero" | "outline-primary";
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for casual daily practice",
    features: [
      "1 daily challenge",
      "1 hint per challenge",
      "Basic leaderboard access",
      "Progress tracking",
      "Community access",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline-primary",
  },
  {
    name: "Pro",
    price: "$7",
    period: "/month",
    description: "For serious interview prep",
    features: [
      "Unlimited daily challenges",
      "Unlimited hints",
      "Full solution explanations",
      "Advanced analytics",
      "Premium leaderboard",
      "Difficulty customization",
      "Priority support",
    ],
    highlighted: true,
    buttonText: "Start Pro Trial",
    buttonVariant: "hero",
  },
];

export function Pricing() {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {tiers.map((tier) => (
        <div 
          key={tier.name}
          className={cn(
            "rounded-xl border bg-card p-6 flex flex-col",
            tier.highlighted && "border-primary glow-primary"
          )}
        >
          {tier.highlighted && (
            <div className="text-xs font-medium text-primary mb-4">
              Most Popular
            </div>
          )}
          <h3 className="text-xl font-semibold">{tier.name}</h3>
          <div className="mt-2 mb-4">
            <span className="text-4xl font-bold">{tier.price}</span>
            {tier.period && (
              <span className="text-muted-foreground">{tier.period}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {tier.description}
          </p>
          <ul className="space-y-3 mb-8 flex-1">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">+</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button variant={tier.buttonVariant} size="lg" className="w-full">
            {tier.buttonText}
          </Button>
        </div>
      ))}
    </div>
  );
}
