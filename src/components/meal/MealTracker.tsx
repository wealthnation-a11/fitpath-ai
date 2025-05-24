
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";
import { updateDailyProgress, getUserProgress } from "@/utils/progressTracker";
import { useAuth } from "@/context/AuthContext";
import { CongratulationsModal } from "@/components/progress/CongratulationsModal";
import { toast } from "sonner";

interface MealTrackerProps {
  dayNumber: number;
  meals: {
    breakfast: string;
    midMorningSnack: string;
    lunch: string;
    afternoonSnack: string;
    dinner: string;
  };
}

export const MealTracker = ({ dayNumber, meals }: MealTrackerProps) => {
  const { user } = useAuth();
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  const mealList = [
    { key: 'breakfast', name: 'Breakfast', meal: meals.breakfast, emoji: '🌅' },
    { key: 'midMorningSnack', name: 'Mid-Morning Snack', meal: meals.midMorningSnack, emoji: '🥜' },
    { key: 'lunch', name: 'Lunch', meal: meals.lunch, emoji: '🍽️' },
    { key: 'afternoonSnack', name: 'Afternoon Snack', meal: meals.afternoonSnack, emoji: '🍇' },
    { key: 'dinner', name: 'Dinner', meal: meals.dinner, emoji: '🌙' },
  ];

  const toggleMeal = (mealKey: string) => {
    const newCompletedMeals = completedMeals.includes(mealKey)
      ? completedMeals.filter(m => m !== mealKey)
      : [...completedMeals, mealKey];
    
    setCompletedMeals(newCompletedMeals);

    // If all meals are completed, update progress
    if (newCompletedMeals.length === mealList.length && user) {
      const updatedProgress = updateDailyProgress(user.id, dayNumber, 'meal');
      setCurrentStreak(updatedProgress.streak);
      setShowCongrats(true);
      toast.success("All meals completed! Great nutrition choices!");
    }
  };

  const allMealsCompleted = completedMeals.length === mealList.length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Track Your Meals</span>
            <span className="text-sm font-normal">
              {completedMeals.length}/{mealList.length} completed
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mealList.map((meal) => {
            const isCompleted = completedMeals.includes(meal.key);
            return (
              <div
                key={meal.key}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => toggleMeal(meal.key)}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{meal.emoji}</span>
                    <span className={`font-medium ${isCompleted ? 'text-green-800' : ''}`}>
                      {meal.name}
                    </span>
                  </div>
                  <p className={`text-sm ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                    {meal.meal}
                  </p>
                </div>
              </div>
            );
          })}
          
          {allMealsCompleted && (
            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg text-center">
              <p className="text-green-800 font-medium">🎉 All meals completed for today!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CongratulationsModal 
        isOpen={showCongrats}
        onClose={() => setShowCongrats(false)}
        type="meal"
        caloriesBurned={0}
        streak={currentStreak}
        dayNumber={dayNumber}
      />
    </>
  );
};
