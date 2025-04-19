
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Timer } from "lucide-react";

interface WorkoutSessionProps {
  workoutName: string;
  onFinish?: (duration: number) => void;
}

export const WorkoutSession = ({ workoutName, onFinish }: WorkoutSessionProps) => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  
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
    setIsActive(false);
    if (onFinish) {
      onFinish(time);
    }
  }, [time, onFinish]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
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
    </div>
  );
};
