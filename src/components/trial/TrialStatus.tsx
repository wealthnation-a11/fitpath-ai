
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
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  }>({ days: 0, hours: 0, minutes: 0 });
  const [showTrialEndedDialog, setShowTrialEndedDialog] = useState(false);

  useEffect(() => {
    if (subscription.trialStartDate && subscription.plan?.id === "free-trial") {
      const updateTimeLeft = () => {
        const trialStart = new Date(subscription.trialStartDate);
        const now = new Date();
        
        // Trial duration in milliseconds (3 days)
        const trialDuration = 3 * 24 * 60 * 60 * 1000;
        
        // Calculate time elapsed and time remaining
        const timeElapsed = now.getTime() - trialStart.getTime();
        const timeRemaining = Math.max(0, trialDuration - timeElapsed);
        
        if (timeRemaining <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0 });
          setShowTrialEndedDialog(true);
          return;
        }
        
        // Convert remaining time to days, hours, minutes
        const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
        
        setTimeLeft({ days, hours, minutes });
      };
      
      // Update immediately and then every minute
      updateTimeLeft();
      const intervalId = setInterval(updateTimeLeft, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [subscription]);

  // Early return if user is not on a free trial
  if (!user || subscription.plan?.id !== "free-trial") {
    return null;
  }

  const isTrialEnded = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0;

  return (
    <>
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            {!isTrialEnded ? (
              <>
                <h3 className="font-medium text-amber-900">
                  ⏳ Free Trial: {timeLeft.days} {timeLeft.days === 1 ? 'Day' : 'Days'}, 
                  {' '}{timeLeft.hours} {timeLeft.hours === 1 ? 'Hour' : 'Hours'}, 
                  {' '}{timeLeft.minutes} {timeLeft.minutes === 1 ? 'Minute' : 'Minutes'} left
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Upgrade to a premium plan to unlock all features and continue your fitness journey
                </p>
              </>
            ) : (
              <>
                <h3 className="font-medium text-amber-900">
                  Your free trial has ended
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Upgrade now to continue accessing your personalized workouts and meal plans
                </p>
              </>
            )}
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

      <AlertDialog 
        open={showTrialEndedDialog} 
        onOpenChange={(open) => {
          // If they try to close the dialog, redirect to plans page
          if (!open && isTrialEnded) {
            navigate('/plans');
          } else {
            setShowTrialEndedDialog(open);
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Your Free Trial Has Ended</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              <div className="flex flex-col items-center py-4">
                <Lock className="h-12 w-12 text-amber-500 mb-4" />
                <p className="text-center">
                  Your 3-day free trial period has expired. Upgrade your plan to continue accessing your personalized workouts and meal plans.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => navigate('/plans')}>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/plans')} className="bg-gradient-to-r from-amber-500 to-amber-600">
              Upgrade Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
