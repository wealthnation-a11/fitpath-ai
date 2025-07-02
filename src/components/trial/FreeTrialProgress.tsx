
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowUp } from "lucide-react";

interface FreeTrialProgressProps {
  currentDay: number;
  totalFreeDays: number;
  totalPlanDays: number;
  onUpgrade: () => void;
}

export const FreeTrialProgress = ({ 
  currentDay, 
  totalFreeDays, 
  totalPlanDays, 
  onUpgrade 
}: FreeTrialProgressProps) => {
  const navigate = useNavigate();
  const progressPercentage = (currentDay / totalFreeDays) * 100;
  const remainingDays = totalPlanDays - totalFreeDays;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-amber-900">
            Day {currentDay} of {totalFreeDays} Free Trial
          </h3>
          <p className="text-amber-700 text-sm">
            Upgrade to unlock the remaining {remainingDays} days of your plan
          </p>
        </div>
        <div className="flex items-center gap-2 text-amber-600">
          <Lock className="h-5 w-5" />
          <span className="text-sm font-medium">{remainingDays} days locked</span>
        </div>
      </div>
      
      <div className="mb-4">
        <Progress 
          value={progressPercentage} 
          className="h-3 bg-amber-100"
        />
        <div className="flex justify-between text-xs text-amber-600 mt-1">
          <span>Free Trial Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      <Button
        onClick={onUpgrade}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 rounded-lg shadow-lg transform transition hover:scale-105"
      >
        <ArrowUp className="mr-2 h-4 w-4" />
        Unlock Full {totalPlanDays}-Day Plan
      </Button>
    </div>
  );
};
