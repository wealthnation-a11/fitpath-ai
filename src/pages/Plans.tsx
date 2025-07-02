import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePlans } from "@/context/PlanContext";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Plans = () => {
  const { user } = useAuth();
  const { createPlan, loading: planLoading, loadUserPlans, plans } = usePlans();
  const navigate = useNavigate();

  const [selectedDuration, setSelectedDuration] = useState<"30" | "180" | "365">("30");
  const [generating, setGenerating] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Load user plans on mount
  useEffect(() => {
    if (user) {
      loadUserPlans();
    }
  }, [user, loadUserPlans]);

  const handleGeneratePlan = async () => {
    if (!user) {
      toast.error("Please login to generate a plan");
      navigate("/login");
      return;
    }

    // Prevent multiple clicks during processing
    if (generating || planLoading) {
      console.log("Operation already in progress, ignoring click");
      return;
    }

    console.log("Starting plan generation for duration:", selectedDuration);

    setGenerating(true);
    try {
      const duration = parseInt(selectedDuration) as 30 | 180 | 365;
      const plan = await createPlan(duration, 'paid');
      toast.success("Plan generated successfully!");
      navigate(`/plan/${plan.id}`);
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Only disable the generate button when actually processing
  const isButtonDisabled = generating || planLoading;

  const getButtonText = () => {
    if (generating) return "Creating Your Plan...";
    if (planLoading) return "Processing...";
    return "Generate Plan";
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Generate Your Fitness Plan</h1>
          <p className="text-muted-foreground">
            Choose your preferences to create a personalized fitness and meal plan
          </p>
        </div>

        {/* Plan Duration Card */}
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

        {/* Generate Plan Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGeneratePlan}
            disabled={isButtonDisabled}
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