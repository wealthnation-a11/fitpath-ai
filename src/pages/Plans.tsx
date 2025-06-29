import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePlans } from "@/context/PlanContext";
import { usePayment, SUBSCRIPTION_PLANS } from "@/context/PaymentContext";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Info, Loader2, AlertTriangle, Gift } from "lucide-react";
import { toast } from "sonner";

const Plans = () => {
  const { user } = useAuth();
  const { createPlan, loading: planLoading, hasUsedFreeTrial, loadUserPlans, plans } = usePlans();
  const { 
    subscription, 
    initiatePayment, 
    checkSubscription, 
    startFreeTrial, 
    loading: paymentLoading, 
    currency,
    formatPrice,
    resetPaymentState
  } = usePayment();
  const navigate = useNavigate();

  const [selectedDuration, setSelectedDuration] = useState<"30" | "180" | "365">("30");
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[0].id);
  const [generating, setGenerating] = useState(false);

  // Check if user has already used free trial
  const userHasUsedFreeTrial = hasUsedFreeTrial();
  const hasExistingFreePlan = plans.some(plan => plan.planType === 'free');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Check subscription status on load and reset payment state
  useEffect(() => {
    if (user) {
      checkSubscription();
      resetPaymentState();
      loadUserPlans();
    }
  }, [user, checkSubscription, resetPaymentState, loadUserPlans]);

  // Auto-redirect to existing free plan if user has one
  useEffect(() => {
    if (hasExistingFreePlan && !userHasUsedFreeTrial) {
      const freePlan = plans.find(plan => plan.planType === 'free');
      if (freePlan) {
        toast.info("Redirecting to your existing free trial plan");
        navigate(`/plan/${freePlan.id}`);
      }
    }
  }, [hasExistingFreePlan, userHasUsedFreeTrial, plans, navigate]);

  // Reset payment state when component unmounts
  useEffect(() => {
    return () => {
      resetPaymentState();
    };
  }, [resetPaymentState]);

  // Reset payment loading when plan selection changes
  useEffect(() => {
    resetPaymentState();
  }, [selectedPlan, resetPaymentState]);

  const handleGeneratePlan = async () => {
    if (!user) {
      toast.error("Please login to generate a plan");
      navigate("/login");
      return;
    }

    // Prevent multiple clicks during processing
    if (generating || planLoading || paymentLoading) {
      console.log("Operation already in progress, ignoring click");
      return;
    }

    console.log("Starting plan generation for:", selectedPlan);

    // Handle free trial plan creation
    if (selectedPlan === "free-trial") {
      // Check if they already have a free plan
      if (hasExistingFreePlan) {
        const freePlan = plans.find(plan => plan.planType === 'free');
        if (freePlan) {
          toast.info("Redirecting to your existing free trial plan");
          navigate(`/plan/${freePlan.id}`);
          return;
        }
      }

      // Check if they've already used the free trial
      if (userHasUsedFreeTrial) {
        toast.error("You've already used your free trial. Upgrade to access more personalized plans.");
        return;
      }
      
      // Create the free trial plan
      setGenerating(true);
      try {
        const plan = await createPlan(30, 'free'); // Create 30-day plan but limit to 3 days
        toast.success("Free trial plan created successfully!");
        navigate(`/plan/${plan.id}`);
      } catch (error) {
        console.error("Error generating free trial plan:", error);
        toast.error(error instanceof Error ? error.message : "Failed to generate plan. Please try again.");
      } finally {
        setGenerating(false);
      }
      return;
    }

    // Handle paid plan selection
    if (selectedPlan !== "free-trial") {
      // Check if user already has this plan active
      if (subscription.active && subscription.plan?.id === selectedPlan) {
        // User already has this plan, just generate
        setGenerating(true);
        try {
          console.log("Generating plan for user with active subscription");
          const duration = parseInt(selectedDuration) as 30 | 180 | 365;
          const plan = await createPlan(duration, 'paid');
          toast.success("Plan generated successfully!");
          navigate(`/plan/${plan.id}`);
        } catch (error) {
          console.error("Error generating plan:", error);
          toast.error("Failed to generate plan. Please try again.");
        } finally {
          setGenerating(false);
        }
        return;
      }

      // User needs to pay for this plan
      const planObj = SUBSCRIPTION_PLANS.find((plan) => plan.id === selectedPlan);
      if (!planObj) {
        toast.error("Invalid plan selected");
        return;
      }

      try {
        console.log("Initiating payment for plan:", planObj);
        await initiatePayment(planObj);
      } catch (error) {
        console.error("Payment failed:", error);
        toast.error("Payment failed. Please try again.");
      }
      return;
    }
  };

  // Only disable the generate button when actually processing
  const isButtonDisabled = generating || planLoading || paymentLoading;

  const getButtonText = () => {
    if (generating) return "Creating Your Plan...";
    if (planLoading) return "Processing...";
    if (paymentLoading) return "Processing Payment...";
    
    // Check if user already has the selected plan
    if (subscription.active && subscription.plan?.id === selectedPlan) {
      return "Generate Plan";
    }
    
    if (selectedPlan === "free-trial") {
      if (hasExistingFreePlan) return "View Your Free Trial";
      return userHasUsedFreeTrial ? "Trial Already Used" : "Start Free Trial";
    }
    
    return "Pay & Generate Plan";
  };

  const isPlanCurrentlyActive = (planId: string) => {
    return subscription.active && subscription.plan?.id === planId;
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case "30":
        return "Month";
      case "180":
        return "6 Months";
      case "365":
        return "Year";
      default:
        return "Month";
    }
  };

  // Show special free trial banner for new users
  const showFreeTrialBanner = !userHasUsedFreeTrial && !hasExistingFreePlan;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Generate Your Fitness Plan</h1>
          <p className="text-muted-foreground">
            Choose your preferences to create a personalized fitness and meal plan
          </p>
        </div>

        {/* Free Trial Welcome Banner */}
        {showFreeTrialBanner && (
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Gift className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">🎉 Welcome! Start with a Free Trial</h3>
                  <p className="text-green-800">
                    Get started with your personalized 3-day free trial. Experience our full workout and meal plans before committing to a subscription.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show warning if user has already used free trial */}
        {userHasUsedFreeTrial && selectedPlan === "free-trial" && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">Free Trial Already Used</p>
                  <p className="text-sm text-amber-700">
                    You've already created your free trial plan. Upgrade to access more personalized plans.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Duration Card - Hidden for free trial */}
        {selectedPlan !== "free-trial" && (
          <Card>
            <CardHeader>
              <CardTitle>Plan Duration</CardTitle>
              <CardDescription>
                Select how long you want your fitness plan to cover
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["30", "180", "365"].map((duration) => (
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
                          {getDurationLabel(duration)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {duration === "30" ? "30 Days" : duration === "180" ? "6 Months" : "1 Year"}
                        </span>
                      </div>
                    </Label>
                    <input
                      type="radio"
                      id={`duration-${duration}`}
                      value={duration}
                      checked={selectedDuration === duration}
                      onChange={(e) =>
                        setSelectedDuration(e.target.value as "30" | "180" | "365")
                      }
                      className="sr-only"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Selection Card */}
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
              onValueChange={(value) => {
                setSelectedPlan(value);
                resetPaymentState();
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {/* Free Trial Option - Show first for new users */}
              <div key="free-trial">
                <RadioGroupItem
                  value="free-trial"
                  id="plan-free-trial"
                  className="peer sr-only"
                  disabled={userHasUsedFreeTrial}
                />
                <Label
                  htmlFor="plan-free-trial"
                  className={`flex flex-col p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 ${
                    hasExistingFreePlan
                      ? "ring-2 ring-green-500 bg-green-50"
                      : ""
                  } ${
                    userHasUsedFreeTrial
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {hasExistingFreePlan && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full self-start mb-2 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Active Free Trial
                    </span>
                  )}
                  <span className="font-medium mb-1">Free Trial</span>
                  <span className="text-2xl font-bold mb-1">Free</span>
                  <span className="text-sm text-muted-foreground mb-2">
                    3-day trial with full access
                  </span>
                  <div className={`text-xs flex items-center mt-auto ${
                    userHasUsedFreeTrial ? "text-red-600" : "text-green-600"
                  }`}>
                    <Info className="h-3 w-3 mr-1" />
                    {userHasUsedFreeTrial ? "Already used" : "Perfect for beginners"}
                  </div>
                </Label>
              </div>

              {/* Other Subscription Plans */}
              {SUBSCRIPTION_PLANS.filter(plan => plan.id !== "free-trial").map((plan) => (
                <div key={plan.id}>
                  <RadioGroupItem
                    value={plan.id}
                    id={`plan-${plan.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`plan-${plan.id}`}
                    className={`flex flex-col p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 ${
                      isPlanCurrentlyActive(plan.id)
                        ? "ring-2 ring-green-500 bg-green-50"
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
                      {formatPrice(plan.baseAmount)}
                    </span>
                    <span className="text-sm text-muted-foreground mb-2">
                      {plan.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Generate Plan Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGeneratePlan}
            disabled={isButtonDisabled || (selectedPlan === "free-trial" && userHasUsedFreeTrial)}
            className="w-full max-w-md"
          >
            {isButtonDisabled ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {getButtonText()}
              </>
            ) : (
              getButtonText()
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Plans;
