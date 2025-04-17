
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlans, Plan } from "@/context/PlanContext";
import { useAuth } from "@/context/AuthContext";
import { usePayment } from "@/context/PaymentContext";
import Layout from "@/components/layout/Layout";
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
import { Download, ArrowLeft, LockIcon, Info } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PlanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getPlan } = usePlans();
  const { subscription } = usePayment();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  
  // Check if user is on free trial or has active subscription
  const isPremiumUser = subscription.active && subscription.plan?.id !== "free-trial";

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
      toast.error("PDF download is available for premium users only. Upgrade to access full features.");
      return;
    }
    
    // In a real implementation, this would generate a PDF or other document
    // For now, we'll just generate a text version and trigger a download
    
    let content = `FitPath AI - ${plan.name}\n`;
    content += `Created: ${formatDate(plan.createdAt)}\n\n`;
    
    // Add workouts
    content += "WORKOUTS:\n";
    for (const workout of plan.workouts) {
      content += `\nDay ${workout.day}:\n`;
      for (const exercise of workout.exercises) {
        content += `- ${exercise.name}: ${exercise.sets} sets x ${exercise.reps} reps (Rest: ${exercise.rest})\n`;
      }
    }
    
    // Add meals
    content += "\n\nMEAL PLAN:\n";
    for (const meal of plan.meals) {
      content += `\nDay ${meal.day}:\n`;
      content += `Breakfast: ${meal.breakfast}\n`;
      content += `Lunch: ${meal.lunch}\n`;
      content += `Dinner: ${meal.dinner}\n`;
      content += `Snacks: ${meal.snacks.join(", ")}\n`;
    }
    
    // Create blob and trigger download
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitpath-plan-${plan.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Plan downloaded successfully!");
  };

  const handleUpgradeClick = () => {
    navigate("/plans");
    toast.info("Upgrade to a premium plan to download your fitness plans");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 btn-hover"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <p className="text-muted-foreground">
              Created on {formatDate(plan.createdAt)} • {plan.duration} days
            </p>
          </div>
          
          {isPremiumUser ? (
            <Button onClick={handleDownloadPlan} className="btn-hover">
              <Download className="mr-2 h-4 w-4" /> Download Plan
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      onClick={handleUpgradeClick} 
                      variant="outline" 
                      className="flex gap-2 btn-hover"
                    >
                      <LockIcon className="h-4 w-4" />
                      <span>Upgrade to Download</span>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-amber-500" />
                    <span>PDF download is available for premium users only</span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="meals">Meal Plan</TabsTrigger>
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
                      <AccordionTrigger className="text-lg font-medium">
                        Day {workout.day}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {workout.exercises.map((exercise, index) => (
                            <div
                              key={index}
                              className="p-4 border rounded-xl bg-gray-50 hover:border-fitpath-blue transition-colors"
                            >
                              <h4 className="font-medium text-fitpath-blue">{exercise.name}</h4>
                              <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
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
                          ))}
                        </div>
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
                <CardTitle>Your Meal Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {plan.meals.map((meal) => (
                    <AccordionItem key={meal.day} value={`day-${meal.day}`}>
                      <AccordionTrigger className="text-lg font-medium">
                        Day {meal.day}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-xl bg-gray-50 hover:border-fitpath-green transition-colors">
                            <h4 className="font-medium text-fitpath-green">Breakfast</h4>
                            <p className="mt-1">{meal.breakfast}</p>
                          </div>

                          <div className="p-4 border rounded-xl bg-gray-50 hover:border-fitpath-green transition-colors">
                            <h4 className="font-medium text-fitpath-green">Lunch</h4>
                            <p className="mt-1">{meal.lunch}</p>
                          </div>

                          <div className="p-4 border rounded-xl bg-gray-50 hover:border-fitpath-green transition-colors">
                            <h4 className="font-medium text-fitpath-green">Dinner</h4>
                            <p className="mt-1">{meal.dinner}</p>
                          </div>

                          <div className="p-4 border rounded-xl bg-gray-50 hover:border-fitpath-green transition-colors">
                            <h4 className="font-medium text-fitpath-green">Snacks</h4>
                            <ul className="mt-1 list-disc list-inside">
                              {meal.snacks.map((snack, index) => (
                                <li key={index}>{snack}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
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
              <p className="font-medium">Premium Feature Locked</p>
              <p className="text-sm mt-1">
                You're currently on the free plan. Upgrade to a premium subscription to download your fitness and meal plans as PDF files.
              </p>
              <Button 
                onClick={handleUpgradeClick} 
                variant="outline" 
                className="mt-3 border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800 btn-hover"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PlanDetail;
