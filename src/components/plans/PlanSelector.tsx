
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Info } from "lucide-react";
import { SUBSCRIPTION_PLANS, usePayment } from "@/context/PaymentContext";

interface PlanSelectorProps {
  selectedPlan: string;
  onChange: (planId: string) => void;
  userHasUsedFreeTrial: boolean;
}

export const PlanSelector = ({ 
  selectedPlan, 
  onChange, 
  userHasUsedFreeTrial 
}: PlanSelectorProps) => {
  const { subscription, formatPrice } = usePayment();

  const isPlanCurrentlyActive = (planId: string) => {
    return subscription.active && subscription.plan?.id === planId;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Plan</CardTitle>
        <CardDescription>
          Select a subscription plan that fits your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedPlan}
          onValueChange={onChange}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div key={plan.id}>
              <RadioGroupItem
                value={plan.id}
                id={`plan-${plan.id}`}
                className="peer sr-only"
                disabled={plan.id === "free-trial" && userHasUsedFreeTrial}
              />
              <Label
                htmlFor={`plan-${plan.id}`}
                className={`flex flex-col p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 ${
                  isPlanCurrentlyActive(plan.id)
                    ? "ring-2 ring-green-500 bg-green-50"
                    : ""
                } ${
                  plan.id === "free-trial" && userHasUsedFreeTrial
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isPlanCurrentlyActive(plan.id) && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full self-start mb-2 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Current Plan
                    </span>
                )}
                <span className="font-medium mb-1">{plan.name}</span>
                <span className="text-2xl font-bold mb-1">
                  {plan.baseAmount === 0 ? "Free" : formatPrice(plan.baseAmount)}
                </span>
                <span className="text-sm text-muted-foreground mb-2">
                  {plan.description}
                </span>
                {plan.id === "free-trial" && (
                  <div className={`text-xs flex items-center mt-auto ${
                    userHasUsedFreeTrial ? "text-red-600" : "text-amber-600"
                  }`}>
                    <Info className="h-3 w-3 mr-1" />
                    {userHasUsedFreeTrial ? "Already used" : "Limited to 1 plan"}
                  </div>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
