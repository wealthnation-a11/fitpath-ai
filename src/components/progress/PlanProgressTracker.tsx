
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Calendar, Trophy, Target, Flame } from 'lucide-react';
import { usePlanManager } from '@/hooks/usePlanManager';
import type { Database } from '@/integrations/supabase/types';

type UserPlan = Database['public']['Tables']['user_plans']['Row'];

interface PlanProgressTrackerProps {
  plan: UserPlan;
}

export const PlanProgressTracker = ({ plan }: PlanProgressTrackerProps) => {
  const { updateProgress, getDayProgress, getCompletionPercentage } = usePlanManager();
  const [selectedDay, setSelectedDay] = useState<number>(plan.current_day || 1);

  const completionPercentage = getCompletionPercentage();
  const dayProgress = getDayProgress(selectedDay);
  const totalCompletedDays = plan.days_completed?.length || 0;

  const handleMarkComplete = async (dayNumber: number, type: 'workout' | 'meal') => {
    const currentProgress = getDayProgress(dayNumber);
    const updates = {
      [type === 'workout' ? 'workout_completed' : 'meal_completed']: true,
      calories_burned: type === 'workout' ? (currentProgress?.calories_burned || 0) + 250 : currentProgress?.calories_burned || 0
    };

    await updateProgress(dayNumber, updates);
  };

  const isCompleted = (dayNumber: number): boolean => {
    return plan.days_completed?.includes(dayNumber) || false;
  };

  const getDayWorkout = (dayNumber: number) => {
    const progressData = plan.progress_data as any;
    return progressData?.workouts?.find((w: any) => w.day === dayNumber);
  };

  const getDayMeal = (dayNumber: number) => {
    const progressData = plan.progress_data as any;
    return progressData?.meals?.find((m: any) => m.day === dayNumber);
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {plan.plan_name} Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalCompletedDays}</div>
              <div className="text-sm text-muted-foreground">Days Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{plan.current_day}</div>
              <div className="text-sm text-muted-foreground">Current Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">{plan.duration}</div>
              <div className="text-sm text-muted-foreground">Total Days</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Day {selectedDay} of {plan.duration}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from({ length: plan.duration }, (_, i) => i + 1).map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDay(day)}
                className="relative"
              >
                {isCompleted(day) && (
                  <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-green-500" />
                )}
                {day}
              </Button>
            ))}
          </div>

          {/* Selected Day Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={isCompleted(selectedDay) ? "default" : "secondary"}>
                {isCompleted(selectedDay) ? "Completed" : "Pending"}
              </Badge>
              {isCompleted(selectedDay) && (
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Day Complete
                </Badge>
              )}
            </div>

            {/* Workout Section */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Workout
                  </span>
                  <Button
                    size="sm"
                    variant={dayProgress?.workout_completed ? "outline" : "default"}
                    onClick={() => handleMarkComplete(selectedDay, 'workout')}
                    disabled={dayProgress?.workout_completed}
                  >
                    {dayProgress?.workout_completed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getDayWorkout(selectedDay)?.exercises.map((exercise: any, index: number) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded border">
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {exercise.sets} sets × {exercise.reps} reps • Rest: {exercise.rest}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Meal Section */}
            <Card className="bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    Meals
                  </span>
                  <Button
                    size="sm"
                    variant={dayProgress?.meal_completed ? "outline" : "default"}
                    onClick={() => handleMarkComplete(selectedDay, 'meal')}
                    disabled={dayProgress?.meal_completed}
                  >
                    {dayProgress?.meal_completed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getDayMeal(selectedDay) && (
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded border">
                      <div className="font-medium text-sm">Breakfast</div>
                      <div className="text-sm">{getDayMeal(selectedDay).breakfast}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="font-medium text-sm">Mid-Morning Snack</div>
                      <div className="text-sm">{getDayMeal(selectedDay).midMorningSnack}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="font-medium text-sm">Lunch</div>
                      <div className="text-sm">{getDayMeal(selectedDay).lunch}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="font-medium text-sm">Afternoon Snack</div>
                      <div className="text-sm">{getDayMeal(selectedDay).afternoonSnack}</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="font-medium text-sm">Dinner</div>
                      <div className="text-sm">{getDayMeal(selectedDay).dinner}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
