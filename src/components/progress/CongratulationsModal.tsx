
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Calendar, Star } from "lucide-react";

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'workout' | 'meal' | 'both';
  caloriesBurned: number;
  streak: number;
  dayNumber: number;
}

export const CongratulationsModal = ({ 
  isOpen, 
  onClose, 
  type, 
  caloriesBurned, 
  streak, 
  dayNumber 
}: CongratulationsModalProps) => {
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfetti(true);
      const timer = setTimeout(() => setConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getTitle = () => {
    switch (type) {
      case 'workout':
        return '🎉 Workout Completed!';
      case 'meal':
        return '🍽️ Meal Plan Completed!';
      case 'both':
        return '🏆 Day Completed!';
      default:
        return '🎉 Great Job!';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'workout':
        return `Amazing work! You've burned ${caloriesBurned} calories today. Keep pushing towards your fitness goals!`;
      case 'meal':
        return `Excellent! You've completed your Nigerian meal plan for today. Your body is getting the nutrition it needs!`;
      case 'both':
        return `Outstanding! You've completed both your workout and meal plan for Day ${dayNumber}. You burned ${caloriesBurned} calories and maintained your nutrition goals!`;
      default:
        return 'Keep up the great work!';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-center space-y-4">
            <div className={`text-6xl transition-all duration-500 ${confetti ? 'animate-bounce' : ''}`}>
              {type === 'both' ? '🏆' : type === 'workout' ? '💪' : '🍽️'}
            </div>
            <p className="text-lg text-foreground">
              {getMessage()}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <Flame className="h-6 w-6 text-red-500 mx-auto mb-1" />
                <p className="text-sm font-medium">Calories Burned</p>
                <p className="text-lg font-bold text-primary">{caloriesBurned}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                <p className="text-sm font-medium">Current Streak</p>
                <p className="text-lg font-bold text-primary">{streak} days</p>
              </div>
            </div>

            {streak >= 3 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm font-semibold text-yellow-800">
                    Streak Bonus! You're on fire! 🔥
                  </p>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button onClick={onClose} className="w-full">
            Continue Your Journey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
