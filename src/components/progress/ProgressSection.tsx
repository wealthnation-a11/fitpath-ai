
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Flame, Timer, Trophy } from "lucide-react";

interface ProgressData {
  streak: number;
  planCompletion: number;
  caloriesBurned: number;
  startDate: string;
  lastWorkout: string;
}

const DEFAULT_PROGRESS: ProgressData = {
  streak: 0,
  planCompletion: 0,
  caloriesBurned: 0,
  startDate: new Date().toISOString(),
  lastWorkout: '',
};

const MOTIVATIONAL_QUOTES = [
  "You're doing amazing, keep going!",
  "Every rep counts, stay focused!",
  "Progress is progress, no matter how small!",
  "Keep pushing, you're getting stronger!",
];

export const ProgressSection = () => {
  const [progress, setProgress] = useState<ProgressData>(DEFAULT_PROGRESS);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('fitpathProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }

    // Set random motivational quote
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight">Track My Progress</h2>
      
      {/* Motivational Quote */}
      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
        <p className="text-lg font-medium text-primary italic">{quote}</p>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Workout Streak</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.streak} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plan Completion</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{progress.planCompletion}%</div>
            <Progress value={progress.planCompletion} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
            <Flame className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.caloriesBurned} kcal</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
