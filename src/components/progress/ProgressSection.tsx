
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Flame, Timer, Trophy, Calendar, TrendingUp } from "lucide-react";
import { getUserProgress, type UserProgress } from "@/utils/progressTracker";
import { useAuth } from "@/context/AuthContext";

export const ProgressSection = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>({
    totalCaloriesBurned: 0,
    streak: 0,
    planCompletion: 0,
    dailyProgress: [],
    startDate: new Date().toISOString(),
    lastWorkout: ''
  });

  const updateProgress = () => {
    if (user) {
      const userProgress = getUserProgress(user.id);
      setProgress(userProgress);
    }
  };

  useEffect(() => {
    updateProgress();
    
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = () => {
      updateProgress();
    };
    
    // Listen for custom progress update events
    const handleProgressUpdate = () => {
      updateProgress();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('progressUpdate', handleProgressUpdate);
    
    // Set up interval to refresh progress every 5 seconds when user is active
    const interval = setInterval(updateProgress, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('progressUpdate', handleProgressUpdate);
      clearInterval(interval);
    };
  }, [user]);

  // Get recent daily progress (last 7 days)
  const recentProgress = progress.dailyProgress
    .slice(-7)
    .reverse(); // Most recent first

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight">Track My Progress</h2>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Workout Streak</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.streak} days</div>
            <p className="text-xs text-muted-foreground">
              {progress.streak > 0 ? 'Keep it up!' : 'Start your journey today!'}
            </p>
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
            <p className="text-xs text-muted-foreground">
              {progress.dailyProgress.length} days tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Calories Burned</CardTitle>
            <Flame className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.totalCaloriesBurned} kcal</div>
            <p className="text-xs text-muted-foreground">
              Avg: {progress.dailyProgress.length > 0 
                ? Math.round(progress.totalCaloriesBurned / progress.dailyProgress.length) 
                : 0} kcal/day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProgress.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.workoutCompleted && day.mealPlanCompleted ? 'Completed both' :
                         day.workoutCompleted ? 'Workout only' :
                         day.mealPlanCompleted ? 'Meals only' : 'Incomplete'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{day.caloriesBurned}</span>
                    </div>
                    {day.workoutDuration > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Timer className="h-3 w-3" />
                        <span>{Math.round(day.workoutDuration / 60)}min</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
