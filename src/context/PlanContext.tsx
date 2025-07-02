import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { usePayment } from "./PaymentContext";
import { usePlanManager } from "@/hooks/usePlanManager";

export type Plan = {
  id: string;
  name: string;
  duration: 30 | 180 | 365 | 7;
  createdAt: string;
  workouts: Array<{
    day: number;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      rest: string;
    }>;
  }>;
  meals: Array<{
    day: number;
    breakfast: string;
    midMorningSnack: string;
    lunch: string;
    afternoonSnack: string;
    dinner: string;
  }>;
};

type PlanContextType = {
  plans: Plan[];
  currentPlan: any;
  loading: boolean;
  error: string | null;
  createPlan: (duration: 30 | 180 | 365 | 7) => Promise<Plan>;
  savePlan: (plan: Plan) => void;
  getPlan: (id: string) => Plan | undefined;
  hasUsedFreeTrial: () => Promise<boolean>;
  upgradePlan: (newDuration: number, subscriptionTier: string) => Promise<void>;
  getCompletionPercentage: () => number;
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

// Nigerian-focused meal database for variety throughout the year
const breakfastOptions = [
  "Oatmeal with skimmed milk, banana slices, and a sprinkle of nuts",
  "Pap (fermented corn pudding) with moi moi (steamed bean pudding)",
  "Unripe plantain porridge with vegetables",
  "Smoothie made with spinach, banana, and almond milk",
  "Whole wheat bread with avocado spread and boiled eggs",
  "Akara (bean cakes) with pap",
  "Granola with unsweetened yogurt and fresh berries",
  "Yam porridge with spinach and vegetables",
  "Millet porridge with coconut milk and dates",
  "Sweet potato pancakes with honey",
  "Quinoa breakfast bowl with Nigerian fruits",
  "Boiled yam with scrambled eggs and vegetables",
  "Acha (fonio) porridge with milk and fruits",
  "Whole grain bread with groundnut butter",
  "Corn meal porridge with cinnamon and nuts"
];

const midMorningSnackOptions = [
  "A handful of cashew nuts",
  "Sliced cucumber with a dash of lemon juice",
  "Apple slices with peanut butter",
  "Garden eggs (African eggplants)",
  "Mixed fruit salad",
  "Tigernuts",
  "Orange slices",
  "Watermelon chunks",
  "Roasted groundnuts",
  "Banana with almond butter",
  "Coconut water and tiger nuts",
  "Fresh pineapple slices",
  "Baobab fruit powder drink",
  "Soursop (custard apple) slices",
  "African pear with groundnuts"
];

const lunchOptions = [
  "Brown rice with grilled chicken and steamed vegetables",
  "Amala (yam flour swallow) with ewedu soup and grilled fish",
  "Ofada rice with vegetable sauce and lean beef",
  "Sweet potatoes with grilled turkey and sautéed vegetables",
  "Jollof rice with grilled fish and a side salad",
  "Yam porridge with spinach and smoked fish",
  "Eba (cassava flour swallow) with ogbono soup and lean meat",
  "Tuwo shinkafa with miyan kuka and grilled chicken",
  "Beans porridge with plantain and fish",
  "Wheat semolina with vegetable soup and turkey",
  "Acha (fonio) with okra soup and beef",
  "Quinoa jollof with grilled fish",
  "Brown rice and beans with stewed chicken",
  "Yam and egg sauce with vegetables",
  "Plantain and beans with palm oil sauce"
];

const afternoonSnackOptions = [
  "Carrot sticks with hummus",
  "Greek yogurt with honey",
  "Boiled groundnuts",
  "Pawpaw slices",
  "Roasted plantain chips",
  "Boiled corn with coconut",
  "Boiled eggs",
  "Roasted cashews",
  "Fresh coconut chunks",
  "Cucumber and tomato salad",
  "Avocado slices with lime",
  "Baked sweet potato chips",
  "Trail mix with local nuts",
  "Fresh guava fruit",
  "Zobo drink with ginger"
];

const dinnerOptions = [
  "Vegetable soup with a side of boiled plantains",
  "Stir-fried vegetables with tofu",
  "Okra soup with a small portion of fufu",
  "Egusi soup with a small portion of pounded yam",
  "Vegetable stir-fry with quinoa",
  "Light vegetable soup with a small portion of rice",
  "Steamed vegetables with grilled chicken",
  "Pepper soup with catfish and yam",
  "Bitter leaf soup with stockfish",
  "Edikang ikong soup with periwinkle",
  "Oha soup with chicken",
  "Nsala soup with fish",
  "Afang soup with beef",
  "Grilled fish with steamed vegetables",
  "Vegetable salad with grilled turkey"
];

// Exercise database remains the same
const exerciseOptions = [
  {
    name: "Push-ups",
    category: "Upper Body", 
    sets: [3, 4],
    reps: [8, 10, 12, 15],
    rest: ["45 seconds", "60 seconds"]
  },
  {
    name: "Squats",
    category: "Lower Body",
    sets: [3, 4, 5],
    reps: [10, 12, 15, 20],
    rest: ["45 seconds", "60 seconds", "90 seconds"]
  },
  {
    name: "Lunges",
    category: "Lower Body",
    sets: [3, 4],
    reps: [10, 12, 15],
    rest: ["45 seconds", "60 seconds"]
  },
  {
    name: "Plank",
    category: "Core",
    sets: [3, 4],
    reps: [1],
    rest: ["30 seconds", "45 seconds", "60 seconds"]
  },
  {
    name: "Bicycle Crunches",
    category: "Core",
    sets: [3, 4],
    reps: [15, 20, 25],
    rest: ["30 seconds", "45 seconds"]
  },
  {
    name: "Mountain Climbers",
    category: "Cardio",
    sets: [3, 4],
    reps: [20, 25, 30],
    rest: ["30 seconds", "45 seconds"]
  },
  {
    name: "Burpees",
    category: "Cardio",
    sets: [3, 4],
    reps: [8, 10, 12, 15],
    rest: ["45 seconds", "60 seconds", "90 seconds"]
  },
  {
    name: "Dumbbell Rows",
    category: "Upper Body",
    sets: [3, 4],
    reps: [8, 10, 12],
    rest: ["45 seconds", "60 seconds"]
  },
  {
    name: "Tricep Dips",
    category: "Upper Body",
    sets: [3, 4],
    reps: [10, 12, 15],
    rest: ["45 seconds", "60 seconds"]
  },
  {
    name: "Glute Bridges",
    category: "Lower Body",
    sets: [3, 4],
    reps: [12, 15, 20],
    rest: ["30 seconds", "45 seconds"]
  },
  {
    name: "Russian Twists",
    category: "Core",
    sets: [3, 4],
    reps: [15, 20, 25],
    rest: ["30 seconds", "45 seconds"]
  },
  {
    name: "Jumping Jacks",
    category: "Cardio",
    sets: [3, 4],
    reps: [20, 25, 30],
    rest: ["30 seconds", "45 seconds"]
  },
  {
    name: "Lateral Raises",
    category: "Upper Body",
    sets: [3, 4],
    reps: [10, 12, 15],
    rest: ["45 seconds", "60 seconds"]
  },
  {
    name: "Calf Raises",
    category: "Lower Body",
    sets: [3, 4],
    reps: [15, 20, 25],
    rest: ["30 seconds", "45 seconds"]
  },
  {
    name: "Superman",
    category: "Core",
    sets: [3, 4],
    reps: [10, 12, 15],
    rest: ["30 seconds", "45 seconds"]
  }
];

// Monthly nutrition focus themes
const monthlyFocus = {
  0: "fiber", // January
  1: "healthy-fats", // February
  2: "vegetables", // March
  3: "reduced-sugar", // April
  4: "physical-activity", // May
  5: "hydration", // June
  6: "new-recipes", // July
  7: "plant-based", // August
  8: "meal-prep", // September
  9: "reduced-sodium", // October
  10: "mindful-eating", // November
  11: "reflection" // December
};

// Helper function to get random item from array
const getRandomItem = <T extends unknown>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get random integer between min and max (inclusive)
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to get exercises for different categories without repetition
const generateUniqueExercisesForDay = (): Array<{
  name: string;
  sets: number;
  reps: number;
  rest: string;
}> => {
  const categories = ["Upper Body", "Lower Body", "Core", "Cardio"];
  
  return categories.map(category => {
    const categoryExercises = exerciseOptions.filter(ex => ex.category === category);
    const exercise = getRandomItem(categoryExercises);
    return {
      name: exercise.name,
      sets: getRandomItem(exercise.sets),
      reps: getRandomItem(exercise.reps),
      rest: getRandomItem(exercise.rest)
    };
  });
};

export const PlanProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { subscription } = usePayment();
  const planManager = usePlanManager();
  const [plans, setPlans] = useState<Plan[]>([]);

  // Convert database plan to legacy format for compatibility
  const convertDbPlanToLegacyFormat = (dbPlan: any): Plan => {
    const progressData = dbPlan.progress_data as any;
    return {
      id: dbPlan.plan_id,
      name: dbPlan.plan_name,
      duration: dbPlan.duration,
      createdAt: dbPlan.created_at,
      workouts: progressData?.workouts || [],
      meals: progressData?.meals || []
    };
  };

  // Load plans when plan manager updates
  useEffect(() => {
    if (planManager.currentPlan) {
      const legacyPlan = convertDbPlanToLegacyFormat(planManager.currentPlan);
      setPlans([legacyPlan]);
    } else {
      setPlans([]);
    }
  }, [planManager.currentPlan]);

  const generateUniqueMealsForDay = (existingMeals: Array<{
    day: number;
    breakfast: string;
    midMorningSnack: string;
    lunch: string;
    afternoonSnack: string;
    dinner: string;
  }> = [], currentMonth: number): {
    breakfast: string;
    midMorningSnack: string;
    lunch: string;
    afternoonSnack: string;
    dinner: string;
  } => {
    const usedBreakfasts = existingMeals.map(meal => meal.breakfast);
    const usedMidMorningSnacks = existingMeals.map(meal => meal.midMorningSnack);
    const usedLunches = existingMeals.map(meal => meal.lunch);
    const usedAfternoonSnacks = existingMeals.map(meal => meal.afternoonSnack);
    const usedDinners = existingMeals.map(meal => meal.dinner);
    
    let availableBreakfasts = breakfastOptions.filter(item => !usedBreakfasts.includes(item));
    let availableMidMorningSnacks = midMorningSnackOptions.filter(item => !usedMidMorningSnacks.includes(item));
    let availableLunches = lunchOptions.filter(item => !usedLunches.includes(item));
    let availableAfternoonSnacks = afternoonSnackOptions.filter(item => !usedAfternoonSnacks.includes(item));
    let availableDinners = dinnerOptions.filter(item => !usedDinners.includes(item));
    
    if (availableBreakfasts.length === 0) availableBreakfasts = breakfastOptions;
    if (availableMidMorningSnacks.length === 0) availableMidMorningSnacks = midMorningSnackOptions;
    if (availableLunches.length === 0) availableLunches = lunchOptions;
    if (availableAfternoonSnacks.length === 0) availableAfternoonSnacks = afternoonSnackOptions;
    if (availableDinners.length === 0) availableDinners = dinnerOptions;
    
    return {
      breakfast: getRandomItem(availableBreakfasts),
      midMorningSnack: getRandomItem(availableMidMorningSnacks),
      lunch: getRandomItem(availableLunches),
      afternoonSnack: getRandomItem(availableAfternoonSnacks),
      dinner: getRandomItem(availableDinners)
    };
  };

  const createPlan = async (duration: 30 | 180 | 365 | 7): Promise<Plan> => {
    try {
      // Check subscription-based duration
      const subscriptionTier = subscription.plan?.id || 'free-trial';
      let actualDuration = duration;
      
      // Map subscription to correct duration
      if (subscriptionTier === 'monthly') {
        actualDuration = 30;
      } else if (subscriptionTier === 'semi-annual') {
        actualDuration = 180;
      } else if (subscriptionTier === 'annual') {
        actualDuration = 365;
      } else if (subscriptionTier === 'free-trial') {
        actualDuration = 7; // But show as 3-day plan
      }

      const workouts = [];
      const meals = [];
      const currentMonth = new Date().getMonth();
      
      for (let i = 0; i < actualDuration; i++) {
        const dayNumber = i + 1;
        
        workouts.push({
          day: dayNumber,
          exercises: generateUniqueExercisesForDay()
        });
        
        meals.push({
          day: dayNumber,
          ...generateUniqueMealsForDay(meals, currentMonth)
        });
      }
      
      const planName = actualDuration === 7 ? "3-Day Free Trial Plan" : `${actualDuration}-Day Nigerian Fitness Plan`;
      
      const planData = {
        id: `plan-${Date.now()}`,
        name: planName,
        duration: actualDuration,
        workouts,
        meals
      };
      
      // Create plan using plan manager
      await planManager.createPlan(planData);
      
      const newPlan: Plan = {
        ...planData,
        createdAt: new Date().toISOString()
      };
      
      return newPlan;
    } catch (err: any) {
      throw err;
    }
  };

  const upgradePlan = async (newDuration: number, subscriptionTier: string): Promise<void> => {
    try {
      const workouts = [];
      const meals = [];
      const currentMonth = new Date().getMonth();
      
      for (let i = 0; i < newDuration; i++) {
        const dayNumber = i + 1;
        
        workouts.push({
          day: dayNumber,
          exercises: generateUniqueExercisesForDay()
        });
        
        meals.push({
          day: dayNumber,
          ...generateUniqueMealsForDay(meals, currentMonth)
        });
      }
      
      const planName = `${newDuration}-Day Premium Plan`;
      
      const planData = {
        id: `plan-${Date.now()}`,
        name: planName,
        duration: newDuration,
        workouts,
        meals
      };
      
      await planManager.upgradePlan(planData, subscriptionTier);
    } catch (err: any) {
      throw err;
    }
  };

  const savePlan = (plan: Plan) => {
    // This is handled by the plan manager now
    console.log('Plan saved via plan manager');
  };

  const getPlan = (id: string) => {
    return plans.find((plan) => plan.id === id);
  };

  const hasUsedFreeTrial = (): Promise<boolean> => {
    return planManager.hasUsedFreeTrial();
  };

  const getCompletionPercentage = (): number => {
    return planManager.getCompletionPercentage();
  };

  return (
    <PlanContext.Provider value={{ 
      plans, 
      currentPlan: planManager.currentPlan,
      loading: planManager.loading, 
      error: planManager.error, 
      createPlan, 
      savePlan, 
      getPlan, 
      hasUsedFreeTrial,
      upgradePlan,
      getCompletionPercentage
    }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlans = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlans must be used within a PlanProvider");
  }
  return context;
};
