
interface ExerciseCalories {
  [key: string]: number; // calories per minute
}

// Calorie burn rates per minute for different exercises
const exerciseCalorieRates: ExerciseCalories = {
  "Push-ups": 8,
  "Squats": 7,
  "Lunges": 6,
  "Plank": 4,
  "Bicycle Crunches": 5,
  "Mountain Climbers": 10,
  "Burpees": 12,
  "Dumbbell Rows": 6,
  "Tricep Dips": 5,
  "Glute Bridges": 4,
  "Russian Twists": 5,
  "Jumping Jacks": 9,
  "Lateral Raises": 4,
  "Calf Raises": 3,
  "Superman": 3
};

export interface DailyProgress {
  date: string;
  workoutCompleted: boolean;
  mealPlanCompleted: boolean;
  caloriesBurned: number;
  workoutDuration: number; // in seconds
  exercises: string[];
}

export interface UserProgress {
  totalCaloriesBurned: number;
  streak: number;
  planCompletion: number;
  dailyProgress: DailyProgress[];
  startDate: string;
  lastWorkout: string;
}

export const calculateExerciseCalories = (exercises: Array<{name: string; sets: number; reps: number}>, durationMinutes: number): number => {
  let totalCalories = 0;
  
  exercises.forEach(exercise => {
    const calorieRate = exerciseCalorieRates[exercise.name] || 5; // default 5 calories per minute
    const exerciseCalories = calorieRate * (durationMinutes / exercises.length);
    totalCalories += exerciseCalories;
  });
  
  return Math.round(totalCalories);
};

export const updateDailyProgress = (
  userId: string, 
  day: number, 
  type: 'workout' | 'meal',
  caloriesBurned: number = 0,
  workoutDuration: number = 0,
  exercises: string[] = []
): UserProgress => {
  const storageKey = `fitpath-progress-${userId}`;
  const existingProgress = localStorage.getItem(storageKey);
  
  let userProgress: UserProgress = existingProgress ? JSON.parse(existingProgress) : {
    totalCaloriesBurned: 0,
    streak: 0,
    planCompletion: 0,
    dailyProgress: [],
    startDate: new Date().toISOString(),
    lastWorkout: ''
  };

  // Find or create today's progress
  const today = new Date().toISOString().split('T')[0];
  let dailyProgressIndex = userProgress.dailyProgress.findIndex(dp => dp.date === today);
  
  if (dailyProgressIndex === -1) {
    userProgress.dailyProgress.push({
      date: today,
      workoutCompleted: false,
      mealPlanCompleted: false,
      caloriesBurned: 0,
      workoutDuration: 0,
      exercises: []
    });
    dailyProgressIndex = userProgress.dailyProgress.length - 1;
  }

  const dailyProgress = userProgress.dailyProgress[dailyProgressIndex];

  // Update based on type
  if (type === 'workout') {
    dailyProgress.workoutCompleted = true;
    dailyProgress.caloriesBurned += caloriesBurned;
    dailyProgress.workoutDuration = workoutDuration;
    dailyProgress.exercises = exercises;
    userProgress.lastWorkout = today;
  } else {
    dailyProgress.mealPlanCompleted = true;
  }

  // Update total calories burned
  userProgress.totalCaloriesBurned += caloriesBurned;

  // Calculate streak
  userProgress.streak = calculateStreak(userProgress.dailyProgress);

  // Calculate plan completion percentage
  const completedDays = userProgress.dailyProgress.filter(dp => 
    dp.workoutCompleted && dp.mealPlanCompleted
  ).length;
  userProgress.planCompletion = Math.round((completedDays / Math.max(userProgress.dailyProgress.length, 1)) * 100);

  // Save to localStorage
  localStorage.setItem(storageKey, JSON.stringify(userProgress));
  
  return userProgress;
};

const calculateStreak = (dailyProgress: DailyProgress[]): number => {
  if (dailyProgress.length === 0) return 0;
  
  // Sort by date descending (most recent first)
  const sortedProgress = [...dailyProgress].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  for (const progress of sortedProgress) {
    if (progress.workoutCompleted && progress.mealPlanCompleted) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const getUserProgress = (userId: string): UserProgress => {
  const storageKey = `fitpath-progress-${userId}`;
  const existingProgress = localStorage.getItem(storageKey);
  
  return existingProgress ? JSON.parse(existingProgress) : {
    totalCaloriesBurned: 0,
    streak: 0,
    planCompletion: 0,
    dailyProgress: [],
    startDate: new Date().toISOString(),
    lastWorkout: ''
  };
};
