
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, Clock, FilePlus } from "lucide-react";
import { format } from "date-fns";
import { Plan } from "@/context/PlanContext";

interface PlansGridProps {
  plans: Plan[];
  onViewPlan: (plan: Plan) => void;
  onDownloadPlan: (plan: Plan) => void;
  onCreateNewPlan: () => void;
  subscription: {
    plan?: { id: string };
  };
}

export const PlansGrid = ({ 
  plans, 
  onViewPlan, 
  onDownloadPlan, 
  onCreateNewPlan,
  subscription 
}: PlansGridProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  if (plans.length === 0) {
    return (
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
            <Button onClick={onCreateNewPlan}>
              <FilePlus className="mr-2 h-4 w-4" /> Generate Your First Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
              onClick={() => onViewPlan(plan)}
            >
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
            <Button
              size="sm"
              onClick={() => onDownloadPlan(plan)}
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
  );
};
