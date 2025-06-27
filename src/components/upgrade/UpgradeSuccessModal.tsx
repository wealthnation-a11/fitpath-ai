
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle, Sparkles } from "lucide-react";

interface UpgradeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  duration: number;
  onStartPlan: () => void;
}

export const UpgradeSuccessModal = ({
  isOpen,
  onClose,
  planName,
  duration,
  onStartPlan
}: UpgradeSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="h-16 w-16 text-yellow-500" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Congratulations! 🎉
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <div className="text-lg font-semibold text-foreground">
              You've unlocked the {planName}!
            </div>
            <div className="text-sm">
              Your {duration}-day personalized fitness and meal plan is now ready.
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
              <CheckCircle className="h-4 w-4" />
              What's Included:
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• {duration} days of personalized workouts</li>
              <li>• Custom Nigerian meal plans</li>
              <li>• Progress tracking & analytics</li>
              <li>• Downloadable PDF plans</li>
              <li>• 24/7 support chat</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            View Later
          </Button>
          <Button onClick={onStartPlan} className="bg-gradient-to-r from-green-500 to-green-600">
            Start My Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
