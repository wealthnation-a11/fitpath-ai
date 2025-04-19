import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePlans } from "@/context/PlanContext";
import { usePayment, BASE_SUBSCRIPTION_PLANS } from "@/context/PaymentContext";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Plans = () => {
  const { user } = useAuth();
  const { createPlan, loading: planLoading } = usePlans();
  const { subscription, initiatePayment, checkSubscription, loading: paymentLoading } = usePayment();
  const navigate = useNavigate();

  const [selectedDuration, setSelectedDuration] = useState<"7" | "14" | "21" | "30">("7");
  const [selectedPlan, setSelectedPlan] = useState(BASE_SUBSCRIPTION_PLANS[0].id);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  const handleGeneratePlan = async () => {
    if (!user) {
      toast.error("Please login to generate a plan");
      navigate("/login");
      return;
    }

    if (!subscription.active && selectedPlan === "free-trial") {
      const existingPlans = JSON.parse(localStorage.getItem(`fitpath-plans-${user.id}`) || "[]");
      const freeTrialCount = existingPlans.length;
      
      if (freeTrialCount >= 1) {
        toast.error("You have reached your free trial limit. Please upgrade to continue.");
        return;
      }
    }

    try {
      if (selectedPlan !== "free-trial" && (!subscription.active || (subscription.plan?.id !== selectedPlan))) {
        const planObj = BASE_SUBSCRIPTION_PLANS.find((plan) => plan.id === selectedPlan);
        if (!planObj) {
          toast.error("Invalid plan selected");
          return;
        }

        try {
          await initiatePayment(planObj);
          return;
        } catch (error) {
          console.error("Payment failed:", error);
          toast.error("Payment failed. Please try again.");
          return;
        }
      }

      setGenerating(true);
      const duration = parseInt(selectedDuration) as 7 | 14 | 21 | 30;
      const plan = await createPlan(duration);
      toast.success("Plan generated successfully!");
      navigate(`/plan/${plan.id}`);
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Failed to generate plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const loading = planLoading || paymentLoading || generating;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Generate Your Fitness Plan</h1>
          <p className="text-muted-foreground">
            Choose your preferences to create a personalized fitness and meal plan
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plan Duration</CardTitle>
            <CardDescription>
              Select how many days you want your fitness plan to cover
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["7", "14", "21", "30"].map((duration) => (
                <div key={duration}>
                  <Label
                    htmlFor={`duration-${duration}`}
                    className="cursor-pointer"
                  >
                    <div
                      className={`p-4 border rounded-lg text-center hover:border-primary transition-colors ${
                        selectedDuration === duration
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <span className="block text-2xl font-bold mb-1">
                        {duration}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Days
                      </span>
                    </div>
                  </Label>
                  <input
                    type="radio"
                    id={`duration-${duration}`}
                    value={duration}
                    checked={selectedDuration === duration}
                    onChange={(e) =>
                      setSelectedDuration(e.target.value as "7" | "14" | "21" | "30")
                    }
                    className="sr-only"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              onValueChange={setSelectedPlan}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {BASE_SUBSCRIPTION_PLANS.map((plan) => (
                <div key={plan.id}>
                  <RadioGroupItem
                    value={plan.id}
                    id={`plan-${plan.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`plan-${plan.id}`}
                    className={`flex flex-col p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 ${
                      subscription.active &&
                      subscription.plan?.id === plan.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    {subscription.active &&
                      subscription.plan?.id === plan.id && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full self-start mb-2">
                          Current Plan
                        </span>
                      )}
                    <span className="font-medium mb-1">{plan.name}</span>
                    <span className="text-2xl font-bold mb-1">
                      {plan.amount === 0 ? "Free" : `₦${plan.amount / 100}`}
                    </span>
                    <span className="text-sm text-muted-foreground mb-2">
                      {plan.description}
                    </span>
                    {plan.id === "free-trial" && (
                      <div className="text-xs text-amber-600 flex items-center mt-auto">
                        <Info className="h-3 w-3 mr-1" />
                        Limited to 1 plan
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full max-w-md"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {generating ? "Generating Plan..." : "Processing..."}
              </>
            ) : (
              <>
                {selectedPlan === "free-trial" || subscription.active
                  ? "Generate Plan"
                  : "Pay & Generate Plan"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Plans;
