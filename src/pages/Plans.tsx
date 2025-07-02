
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePayment, SUBSCRIPTION_PLANS } from "@/context/PaymentContext";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { usePlanGeneration } from "@/hooks/usePlanGeneration";
import Layout from "@/components/layout/Layout";
import { PlanDurationSelector } from "@/components/plans/PlanDurationSelector";
import { PlanSelector } from "@/components/plans/PlanSelector";
import { TrialWarning } from "@/components/plans/TrialWarning";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Plans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userHasUsedFreeTrial, trialStatusLoading } = useTrialStatus();
  const {
    handleGeneratePlan,
    getButtonText,
    generating,
    planLoading,
    paymentLoading,
    resetPaymentState,
    checkSubscription
  } = usePlanGeneration();

  const [selectedDuration, setSelectedDuration] = useState<"30" | "180" | "365">("30");
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[0].id);

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
    }
  }, [user, checkSubscription, resetPaymentState]);

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

  const onGeneratePlan = () => {
    handleGeneratePlan(selectedPlan, selectedDuration, userHasUsedFreeTrial);
  };

  // Only disable the generate button when actually processing
  const isButtonDisabled = generating || planLoading || paymentLoading || trialStatusLoading;

  const buttonText = getButtonText(
    generating,
    planLoading,
    paymentLoading,
    trialStatusLoading,
    selectedPlan,
    userHasUsedFreeTrial
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Generate Your Fitness Plan</h1>
          <p className="text-muted-foreground">
            Choose your preferences to create a personalized fitness and meal plan
          </p>
        </div>

        <TrialWarning 
          show={userHasUsedFreeTrial && selectedPlan === "free-trial"} 
        />

        <PlanDurationSelector
          selectedDuration={selectedDuration}
          onChange={setSelectedDuration}
        />

        <PlanSelector
          selectedPlan={selectedPlan}
          onChange={(value) => {
            setSelectedPlan(value);
            resetPaymentState();
          }}
          userHasUsedFreeTrial={userHasUsedFreeTrial}
        />

        {/* Generate Plan Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={onGeneratePlan}
            disabled={isButtonDisabled || (selectedPlan === "free-trial" && userHasUsedFreeTrial)}
            className="w-full max-w-md"
          >
            {isButtonDisabled ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {buttonText}
              </>
            ) : (
              buttonText
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Plans;
