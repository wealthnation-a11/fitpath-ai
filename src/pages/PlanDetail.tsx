import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlans, Plan } from "@/context/PlanContext";
import { useAuth } from "@/context/AuthContext";
import { usePayment } from "@/context/PaymentContext";
import Layout from "@/components/layout/Layout";
import { WorkoutAnimation } from "@/components/workout/WorkoutAnimation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, ArrowLeft, Lock, Info } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { WorkoutSession } from "@/components/workout/WorkoutSession";
import { TrialStatus } from "@/components/trial/TrialStatus";
import { MealTracker } from "@/components/meal/MealTracker";

const PlanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getPlan } = usePlans();
  const { subscription } = usePayment();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  const isPremiumUser = subscription.active && subscription.plan?.id !== "free-trial";
  const isTrialUser = subscription.plan?.id === "free-trial";
  const isTrialExpired = subscription.isTrialExpired || false;
  
  // Calculate if trial is expired based on start date
  useEffect(() => {
    if (isTrialUser && subscription.trialStartDate) {
      const trialStart = new Date(subscription.trialStartDate);
      const now = new Date();
      const trialDuration = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
      const timeElapsed = now.getTime() - trialStart.getTime();
      
      if (timeElapsed >= trialDuration) {
        // If trial expired, redirect to plans page
        toast.error("Your free trial has expired. Please upgrade to continue.");
        navigate('/plans');
      }
    }
  }, [isTrialUser, subscription.trialStartDate, navigate]);

  // Function to check if content should be shown based on trial status
  const showRestrictedContent = (dayNumber: number) => {
    if (isPremiumUser) return true;
    if (!isTrialUser) return true;
    return dayNumber <= 3; // Only show first 3 days for trial users
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (id) {
      const foundPlan = getPlan(id);
      if (foundPlan) {
        setPlan(foundPlan);
      } else {
        navigate("/dashboard");
      }
    }
  }, [id, getPlan, navigate, user]);

  if (!plan) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 w-full max-w-4xl bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const handleDownloadPlan = () => {
    if (!isPremiumUser) {
      setShowUpgradeDialog(true);
      return;
    }
    
    let content = `FitPath AI - ${plan.name}\n`;
    content += `Created: ${formatDate(plan.createdAt)}\n\n`;
    
    content += "WORKOUTS:\n";
    for (const workout of plan.workouts) {
      content += `\nDay ${workout.day}:\n`;
      for (const exercise of workout.exercises) {
        content += `- ${exercise.name}: ${exercise.sets} sets x ${exercise.reps} reps (Rest: ${exercise.rest})\n`;
      }
    }
    
    content += "\n\nNIGERIAN MEAL PLAN (5 MEALS PER DAY):\n";
    for (const meal of plan.meals) {
      content += `\nDay ${meal.day}:\n`;
      content += `Breakfast: ${meal.breakfast}\n`;
      content += `Mid-Morning Snack: ${meal.midMorningSnack}\n`;
      content += `Lunch: ${meal.lunch}\n`;
      content += `Afternoon Snack: ${meal.afternoonSnack}\n`;
      content += `Dinner: ${meal.dinner}\n`;
    }
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitpath-nigerian-plan-${plan.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Nigerian meal plan downloaded successfully!");
  };

  const handleUpgradeClick = () => {
    navigate("/plans");
    toast.info("Upgrade to a premium plan to unlock all features");
  };

  const handleWorkoutFinish = (duration: number, caloriesBurned: number) => {
    toast.success(`Workout completed! Duration: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds. Calories burned: ${caloriesBurned}`);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {isTrialUser && <TrialStatus />}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <p className="text-muted-foreground">
              Created on {formatDate(plan.createdAt)} • {plan.duration} days • Nigerian Cuisine
            </p>
          </div>
          
          <Button 
            onClick={handleDownloadPlan} 
            className={`${!isPremiumUser ? 'bg-gray-400' : ''}`}
          >
            <Download className="mr-2 h-4 w-4" /> 
            {isPremiumUser ? "Download Plan" : "Premium Feature"}
          </Button>
        </div>

        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="meals">Nigerian Meal Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="space-y-4">
            <Card className="shadow-soft rounded-2xl card-hover border-t-4 border-t-fitpath-blue">
              <CardHeader>
                <CardTitle>Your Workout Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {plan.workouts.map((workout) => (
                    <AccordionItem key={workout.day} value={`day-${workout.day}`}>
                      <AccordionTrigger className={`text-lg font-medium ${!showRestrictedContent(workout.day) ? 'text-gray-400' : ''}`}>
                        Day {workout.day}
                        {!showRestrictedContent(workout.day) && (
                          <div className="ml-2 flex items-center text-amber-500">
                            <Lock className="h-4 w-4 mr-1" />
                            <span className="text-xs">Premium</span>
                          </div>
                        )}
                      </AccordionTrigger>
                      <AccordionContent>
                        {showRestrictedContent(workout.day) ? (
                          <div className="space-y-6">
                            <WorkoutSession 
                              workoutName={`Day ${workout.day} Workout`}
                              exercises={workout.exercises}
                              dayNumber={workout.day}
                              onFinish={handleWorkoutFinish}
                            />
                            {workout.exercises.map((exercise, index) => (
                              <div
                                key={index}
                                className="p-4 border rounded-xl bg-gray-50 hover:border-fitpath-blue transition-colors"
                              >
                                <h4 className="font-medium text-fitpath-blue mb-4">
                                  {exercise.name}
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <WorkoutAnimation name={exercise.name} />
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Sets:</span>{" "}
                                        {exercise.sets}
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Reps:</span>{" "}
                                        {exercise.reps}
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Rest:</span>{" "}
                                        {exercise.rest}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <div className="mx-auto bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md">
                              <Lock className="mx-auto h-12 w-12 text-amber-500 mb-3" />
                              <h3 className="text-lg font-semibold text-amber-800 mb-2">Premium Content Locked</h3>
                              <p className="text-amber-700 mb-4">
                                Upgrade to unlock access to this day's workout plan and all premium features.
                              </p>
                              <Button
                                onClick={handleUpgradeClick}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 border-none"
                              >
                                Upgrade Now
                              </Button>
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals" className="space-y-4">
            <Card className="shadow-soft rounded-2xl card-hover border-t-4 border-t-fitpath-green">
              <CardHeader>
                <CardTitle>Your Nigerian Meal Plan</CardTitle>
                <p className="text-sm text-muted-foreground">
                  5 balanced meals per day featuring authentic Nigerian cuisine and seasonal ingredients
                </p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {plan.meals.map((meal) => (
                    <AccordionItem key={meal.day} value={`day-${meal.day}`}>
                      <AccordionTrigger className={`text-lg font-medium ${!showRestrictedContent(meal.day) ? 'text-gray-400' : ''}`}>
                        Day {meal.day}
                        {!showRestrictedContent(meal.day) && (
                          <div className="ml-2 flex items-center text-amber-500">
                            <Lock className="h-4 w-4 mr-1" />
                            <span className="text-xs">Premium</span>
                          </div>
                        )}
                      </AccordionTrigger>
                      <AccordionContent>
                        {showRestrictedContent(meal.day) ? (
                          <div className="space-y-4">
                            <MealTracker dayNumber={meal.day} meals={meal} />
                            
                            <div className="p-4 border rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:border-fitpath-green transition-colors">
                              <h4 className="font-medium text-fitpath-green flex items-center">
                                🌅 Breakfast
                              </h4>
                              <p className="mt-1 text-gray-700">{meal.breakfast}</p>
                            </div>

                            <div className="p-4 border rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:border-blue-400 transition-colors">
                              <h4 className="font-medium text-blue-600 flex items-center">
                                🥜 Mid-Morning Snack
                              </h4>
                              <p className="mt-1 text-gray-700">{meal.midMorningSnack}</p>
                            </div>

                            <div className="p-4 border rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 hover:border-orange-400 transition-colors">
                              <h4 className="font-medium text-orange-600 flex items-center">
                                🍽️ Lunch
                              </h4>
                              <p className="mt-1 text-gray-700">{meal.lunch}</p>
                            </div>

                            <div className="p-4 border rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:border-purple-400 transition-colors">
                              <h4 className="font-medium text-purple-600 flex items-center">
                                🍇 Afternoon Snack
                              </h4>
                              <p className="mt-1 text-gray-700">{meal.afternoonSnack}</p>
                            </div>

                            <div className="p-4 border rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:border-indigo-400 transition-colors">
                              <h4 className="font-medium text-indigo-600 flex items-center">
                                🌙 Dinner
                              </h4>
                              <p className="mt-1 text-gray-700">{meal.dinner}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <div className="mx-auto bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md">
                              <Lock className="mx-auto h-12 w-12 text-amber-500 mb-3" />
                              <h3 className="text-lg font-semibold text-amber-800 mb-2">Premium Content Locked</h3>
                              <p className="text-amber-700 mb-4">
                                Upgrade to unlock access to this day's Nigerian meal plan and all premium features.
                              </p>
                              <Button
                                onClick={handleUpgradeClick}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 border-none"
                              >
                                Upgrade Now
                              </Button>
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {!isPremiumUser && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 flex items-start gap-3 mt-8">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Premium Features Locked</p>
              <p className="text-sm mt-1">
                {isTrialUser ? 
                  "You're currently on a 3-day free trial. Upgrade to a premium subscription to access all days and download your fitness and meal plans." :
                  "You're currently on the free plan. Upgrade to a premium subscription to access all features."}
              </p>
              <Button 
                onClick={handleUpgradeClick} 
                variant="outline" 
                className="mt-3 border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Premium Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Premium Feature</DialogTitle>
              <DialogDescription>
                <div className="flex flex-col items-center py-4">
                  <Download className="h-16 w-16 text-amber-500 mb-4" />
                  <p className="text-center font-medium text-base mb-2">
                    PDF Downloads are available for Premium Members only
                  </p>
                  <p className="text-center text-sm text-muted-foreground">
                    Upgrade your plan to download your customized workout and meal plans
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                Maybe Later
              </Button>
              <Button
                className="bg-gradient-to-r from-amber-500 to-amber-600"
                onClick={() => {
                  setShowUpgradeDialog(false);
                  navigate('/plans');
                }}
              >
                Upgrade Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default PlanDetail;
