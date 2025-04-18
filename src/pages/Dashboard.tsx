import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePlans } from "@/context/PlanContext";
import { usePayment } from "@/context/PaymentContext";
import Layout from "@/components/layout/Layout";
import { ProgressSection } from "@/components/progress/ProgressSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Eye, FilePlus, Clock } from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const { user, loading: userLoading } = useAuth();
  const { plans, loading: plansLoading } = usePlans();
  const { subscription, checkSubscription } = usePayment();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/login");
    }
  }, [user, userLoading, navigate]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  if (userLoading || plansLoading || !user) {
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const handleViewPlan = (plan: Plan) => {
    navigate(`/plan/${plan.id}`);
  };

  const handleDownloadPlan = (plan: Plan) => {
    let content = `FitPath AI - ${plan.name}\n`;
    content += `Created: ${formatDate(plan.createdAt)}\n\n`;
    
    content += "WORKOUTS:\n";
    for (const workout of plan.workouts) {
      content += `\nDay ${workout.day}:\n`;
      for (const exercise of workout.exercises) {
        content += `- ${exercise.name}: ${exercise.sets} sets x ${exercise.reps} reps (Rest: ${exercise.rest})\n`;
      }
    }
    
    content += "\n\nMEAL PLAN:\n";
    for (const meal of plan.meals) {
      content += `\nDay ${meal.day}:\n`;
      content += `Breakfast: ${meal.breakfast}\n`;
      content += `Lunch: ${meal.lunch}\n`;
      content += `Dinner: ${meal.dinner}\n`;
      content += `Snacks: ${meal.snacks.join(", ")}\n`;
    }
    
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
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user.name}!
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your fitness journey
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.email}</p>
              {subscription.active ? (
                <p className="text-xs text-muted-foreground">
                  {subscription.plan?.name} (Expires: {subscription.expiresAt ? formatDate(subscription.expiresAt) : "N/A"})
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Free Plan</p>
              )}
            </div>
          </div>
        </div>

        <ProgressSection />

        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList>
            <TabsTrigger value="plans">Your Plans</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">📚 Your Previous Fitness Plans</h2>
              <Button onClick={() => navigate("/plans")}>
                <FilePlus className="mr-2 h-4 w-4" /> Create New Plan
              </Button>
            </div>

            {plans.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <Clock className="h-12 w-12 text-muted-foreground" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">No plans yet</h3>
                      <p className="text-muted-foreground">
                        You haven't created any fitness plans yet. Generate your first plan now!
                      </p>
                    </div>
                    <Button onClick={() => navigate("/plans")}>
                      <FilePlus className="mr-2 h-4 w-4" /> Generate Your First Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>
                        Duration: {plan.duration} days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Created on {formatDate(plan.createdAt)}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPlan(plan)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadPlan(plan)}
                      >
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Your Subscription</CardTitle>
                <CardDescription>
                  Manage your FitPath AI subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscription.active ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800">Active Subscription</h3>
                      <p className="text-green-700">
                        You are currently on the {subscription.plan?.name}
                      </p>
                      <p className="text-sm text-green-600">
                        Your subscription will expire on{" "}
                        {subscription.expiresAt ? formatDate(subscription.expiresAt) : "N/A"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/plans")}
                    >
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="font-semibold text-yellow-800">No Active Subscription</h3>
                      <p className="text-yellow-700">
                        You are currently on the free plan with limited features
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate("/plans")}
                    >
                      Upgrade Your Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
