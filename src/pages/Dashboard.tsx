
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePlans, Plan } from "@/context/PlanContext";
import { usePayment } from "@/context/PaymentContext";
import { getDailyQuote, getFirstName } from "@/utils/dailyQuotes";
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
import { Download, Eye, FilePlus, Clock, Quote, ArrowUp } from "lucide-react";
import { format } from "date-fns";
import { TrialStatus } from "@/components/trial/TrialStatus";

const Dashboard = () => {
  const { user, loading: userLoading } = useAuth();
  const { plans, loading: plansLoading, hasUsedFreeTrial } = usePlans();
  const { subscription, checkSubscription } = usePayment();
  const navigate = useNavigate();

  const isTrialUser = subscription.plan?.id === "free-trial";
  const userHasUsedFreeTrial = hasUsedFreeTrial();

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/login");
    }
  }, [user, userLoading, navigate]);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      const subscriptionStatus = await checkSubscription();
      
      if (subscriptionStatus.isTrialExpired) {
        navigate("/plans");
      }
    };
    
    if (user) {
      checkSubscriptionStatus();
    }
  }, [checkSubscription, navigate, user]);

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
    // Disable download for free trial plans
    if (plan.duration === 7) {
      navigate("/plans");
      return;
    }
    
    if (subscription.plan?.id === "free-trial") {
      navigate("/plans");
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
    
    content += "\n\nMEAL PLAN:\n";
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
    a.download = `fitpath-plan-${plan.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dailyQuote = getDailyQuote();
  const firstName = getFirstName(user.name);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Hello {firstName}! 👋
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

        {/* Daily Motivational Quote */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Quote className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary mb-2">Daily Motivation</h3>
                <p className="text-lg italic text-foreground leading-relaxed">
                  "{dailyQuote}"
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProgressSection />

        {subscription.plan?.id === "free-trial" && <TrialStatus />}

        {/* Upgrade CTA for trial users who have used their free trial */}
        {userHasUsedFreeTrial && !subscription.active && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <ArrowUp className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">Unlock Full Access</h3>
                  <p className="text-amber-800 mb-4">
                    You've completed your free trial. Upgrade now to create unlimited personalized fitness and meal plans.
                  </p>
                  <Button
                    onClick={() => navigate("/plans")}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                        Duration: {plan.duration === 7 ? "3" : plan.duration} days
                        {plan.duration === 7 && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                            Free Trial
                          </span>
                        )}
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
                        disabled={plan.duration === 7 || subscription.plan?.id === "free-trial"}
                        className={plan.duration === 7 || subscription.plan?.id === "free-trial" ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        <Download className="mr-2 h-4 w-4" /> 
                        {plan.duration === 7 ? "Premium Only" : "Download"}
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
                    <div className={`p-4 ${subscription.plan?.id === "free-trial" ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"} border rounded-lg`}>
                      <h3 className={`font-semibold ${subscription.plan?.id === "free-trial" ? "text-amber-800" : "text-green-800"}`}>
                        {subscription.plan?.id === "free-trial" ? "Free Trial Active" : "Active Subscription"}
                      </h3>
                      <p className={subscription.plan?.id === "free-trial" ? "text-amber-700" : "text-green-700"}>
                        You are currently on the {subscription.plan?.name}
                      </p>
                      {subscription.expiresAt && (
                        <p className={`text-sm ${subscription.plan?.id === "free-trial" ? "text-amber-600" : "text-green-600"}`}>
                          Your subscription will expire on{" "}
                          {formatDate(subscription.expiresAt)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant={subscription.plan?.id === "free-trial" ? "default" : "outline"}
                      onClick={() => navigate("/plans")}
                      className={subscription.plan?.id === "free-trial" ? "bg-gradient-to-r from-amber-500 to-amber-600" : ""}
                    >
                      {subscription.plan?.id === "free-trial" ? "Upgrade Now" : "Manage Subscription"}
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
