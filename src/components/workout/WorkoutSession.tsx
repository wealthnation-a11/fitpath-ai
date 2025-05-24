
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Timer } from "lucide-react";
import { calculateExerciseCalories, updateDailyProgress, getUserProgress } from "@/utils/progressTracker";
import { useAuth } from "@/context/AuthContext";
import { CongratulationsModal } from "@/components/progress/CongratulationsModal";
import { toast } from "sonner";

interface WorkoutSessionProps {
  workoutName: string;
  exercises: Array<{name: string; sets: number; reps: number}>;
  dayNumber: number;
  onFinish?: (duration: number, caloriesBurned: number) => void;
}

export const WorkoutSession = ({ workoutName, exercises, dayNumber, onFinish }: WorkoutSessionProps) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);
  
  const handleStart = useCallback(() => {
    setIsActive(true);
    setTime(0);
  }, []);
  
  const handleFinish = useCallback(() => {
    if (!user) return;
    
    setIsActive(false);
    const durationMinutes = time / 60;
    const calculatedCalories = calculateExerciseCalories(exercises, durationMinutes);
    
    // Update progress
    const updatedProgress = updateDailyProgress(
      user.id,
      dayNumber,
      'workout',
      calculatedCalories,
      time,
      exercises.map(ex => ex.name)
    );
    
    setCaloriesBurned(calculatedCalories);
    setCurrentStreak(updatedProgress.streak);
    setShowCongrats(true);
    
    toast.success(`Workout completed! ${calculatedCalories} calories burned!`);
    
    if (onFinish) {
      onFinish(time, calculatedCalories);
    }
  }, [time, exercises, dayNumber, user, onFinish]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <>
      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-semibold">{formatTime(time)}</span>
          </div>
          <div className="flex gap-2">
            {!isActive ? (
              <Button 
                onClick={handleStart}
                className="bg-green-500 hover:bg-green-600 text-white"
                disabled={isActive}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
            ) : (
              <Button 
                onClick={handleFinish}
                variant="destructive"
                disabled={!isActive}
              >
                <Square className="h-4 w-4 mr-2" />
                Finish Workout
              </Button>
            )}
          </div>
        </div>
        
        {time > 0 && (
          <div className="text-sm text-muted-foreground">
            Estimated calories: {Math.round(calculateExerciseCalories(exercises, time / 60))}
          </div>
        )}
      </div>

      <CongratulationsModal 
        isOpen={showCongrats}
        onClose={() => setShowCongrats(false)}
        type="workout"
        caloriesBurned={caloriesBurned}
        streak={currentStreak}
        dayNumber={dayNumber}
      />
    </>
  );
};
