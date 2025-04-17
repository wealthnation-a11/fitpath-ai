
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlans, Plan } from "@/context/PlanContext";
import { useAuth } from "@/context/AuthContext";
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
import { Download, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const PlanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getPlan } = usePlans();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);

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
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
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
              Created on {formatDate(plan.createdAt)} • {plan.duration} days
            </p>
          </div>
          <Button onClick={handleDownloadPlan}>
            <Download className="mr-2 h-4 w-4" /> Download Plan
          </Button>
        </div>

        <Tabs defaultValue="workouts">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="meals">Meal Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Workout Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {plan.workouts.map((workout) => (
                    <AccordionItem key={workout.day} value={`day-${workout.day}`}>
                      <AccordionTrigger>
                        Day {workout.day}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {workout.exercises.map((exercise, index) => (
                            <div
                              key={index}
                              className="p-4 border rounded-lg bg-gray-50"
                            >
                              <h4 className="font-medium">{exercise.name}</h4>
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
            <Card>
              <CardHeader>
                <CardTitle>Your Meal Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {plan.meals.map((meal) => (
                    <AccordionItem key={meal.day} value={`day-${meal.day}`}>
                      <AccordionTrigger>
                        Day {meal.day}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-medium">Breakfast</h4>
                            <p className="mt-1">{meal.breakfast}</p>
                          </div>

                          <div className="p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-medium">Lunch</h4>
                            <p className="mt-1">{meal.lunch}</p>
                          </div>

                          <div className="p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-medium">Dinner</h4>
                            <p className="mt-1">{meal.dinner}</p>
                          </div>

                          <div className="p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-medium">Snacks</h4>
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
      </div>
    </Layout>
  );
};

export default PlanDetail;
