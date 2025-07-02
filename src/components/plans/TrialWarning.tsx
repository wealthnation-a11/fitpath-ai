
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface TrialWarningProps {
  show: boolean;
}

export const TrialWarning = ({ show }: TrialWarningProps) => {
  if (!show) return null;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-900">Free Trial Already Used</p>
            <p className="text-sm text-amber-700">
              You've already created your free trial plan. Upgrade to access more personalized plans.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
