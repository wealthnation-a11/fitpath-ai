
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePlans } from "@/context/PlanContext";
import { usePayment, SUBSCRIPTION_PLANS } from "@/context/PaymentContext";
import { toast } from "sonner";

export const usePlanGeneration = () => {
  const { user } = useAuth();
  const { createPlan, loading: planLoading } = usePlans();
  const { 
    subscription, 
    initiatePayment, 
    checkSubscription, 
    startFreeTrial, 
    loading: paymentLoading, 
    resetPaymentState
  } = usePayment();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);

  const handleGeneratePlan = async (
    selectedPlan: string,
    selectedDuration: "30" | "180" | "365",
    userHasUsedFreeTrial: boolean
  ) => {
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

    // If the user selects free trial
    if (selectedPlan === "free-trial") {
      // Check if they already have an active subscription
      if (subscription.active) {
        // If they have an active subscription, just generate the plan
        setGenerating(true);
        try {
          console.log("Generating plan for subscribed user (free trial selected)");
          const duration = parseInt(selectedDuration) as 30 | 180 | 365;
          const plan = await createPlan(duration);
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

      // Check if they've already used the free trial
      if (userHasUsedFreeTrial) {
        toast.error("You've already created your free trial plan. Upgrade to access more personalized plans.");
        return;
      }
      
      // Start the free trial
      setGenerating(true);
      try {
        startFreeTrial();
        const plan = await createPlan(7); // Create 7-day plan for trial (restricted to 3 days)
        toast.success("Free trial plan generated successfully!");
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
          const plan = await createPlan(duration);
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
        // Use the payment workflow - don't call the function, pass the reference
        await initiatePayment(planObj);
        // Payment handling is done in the payment context workflows
      } catch (error) {
        console.error("Payment failed:", error);
        toast.error("Payment failed. Please try again.");
      }
      return;
    }
  };

  const getButtonText = (
    generating: boolean,
    planLoading: boolean,
    paymentLoading: boolean,
    trialStatusLoading: boolean,
    selectedPlan: string,
    userHasUsedFreeTrial: boolean
  ) => {
    if (generating) return "Generating Plan...";
    if (planLoading) return "Processing...";
    if (paymentLoading) return "Processing Payment...";
    if (trialStatusLoading) return "Loading...";
    
    // Check if user already has the selected plan
    if (subscription.active && subscription.plan?.id === selectedPlan) {
      return "Generate Plan";
    }
    
    if (selectedPlan === "free-trial") {
      return userHasUsedFreeTrial ? "Trial Already Used" : "Start Free Trial";
    }
    
    return "Pay & Generate Plan";
  };

  return {
    handleGeneratePlan,
    getButtonText,
    generating,
    planLoading,
    paymentLoading,
    resetPaymentState,
    checkSubscription
  };
};
