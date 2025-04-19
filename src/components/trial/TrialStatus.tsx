
import { useEffect, useState } from 'react';
import { usePayment } from '@/context/PaymentContext';
import { useAuth } from '@/context/AuthContext';
import { Timer, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TrialStatus = () => {
  const { subscription } = usePayment();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [daysLeft, setDaysLeft] = useState<number>(3);
  const [showTrialEndedDialog, setShowTrialEndedDialog] = useState(false);

  useEffect(() => {
    if (subscription.trialStartDate && subscription.plan?.id === "free-trial") {
      const trialStart = new Date(subscription.trialStartDate);
      const now = new Date();
      const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      const remaining = Math.max(0, 3 - daysPassed);
      setDaysLeft(remaining);

      if (remaining === 0) {
        setShowTrialEndedDialog(true);
      }
    }
  }, [subscription]);

  // Fixed the boolean/string comparison issue here
  if (!user || subscription.plan?.id !== "free-trial") {
    return null;
  }

  return (
    <>
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-900">
              {daysLeft > 0 ? (
                `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in your free trial`
              ) : (
                'Your free trial has ended'
              )}
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Upgrade to a premium plan to unlock all features and continue your fitness journey
            </p>
          </div>
          <Button 
            onClick={() => navigate('/plans')}
            variant="outline"
            className="border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800"
          >
            Upgrade Now
          </Button>
        </div>
      </div>

      <AlertDialog open={showTrialEndedDialog} onOpenChange={setShowTrialEndedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your Free Trial Has Ended</AlertDialogTitle>
            <AlertDialogDescription>
              Upgrade your plan to continue accessing your personalized workouts and meal plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/plans')}>
              Upgrade Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
