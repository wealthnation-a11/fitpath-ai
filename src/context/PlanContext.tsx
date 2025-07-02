import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type Plan = {
  id: string;
  name: string;
  duration: 30 | 180 | 365 | 7; // Added 7 for free trial
  createdAt: string;
  planType: 'free' | 'paid';
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
  loading: boolean;
  error: string | null;
  createPlan: (duration: 30 | 180 | 365 | 7, planType?: 'free' | 'paid') => Promise<Plan>;
  savePlan: (plan: Plan) => Promise<void>;
  getPlan: (id: string) => Plan | undefined;
  hasUsedFreeTrial: () => boolean;
  loadUserPlans: () => Promise<void>;
  upgradePlan: (planId: string, newDuration: 30 | 180 | 365) => Promise<Plan>;
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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load plans from Supabase when user changes
  useEffect(() => {
    if (user) {
      loadUserPlans();
    } else {
      setPlans([]);
    }
  }, [user]);

  // Check if user has already used their free trial
  const hasUsedFreeTrial = (): boolean => {
    if (!user) return false;
    return plans.some(plan => plan.planType === 'free');
  };

  // Load user plans from Supabase
  const loadUserPlans = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const loadedPlans: Plan[] = data?.map(dbPlan => {
        // Safely parse progress_data
        let progressData: any = {};
        try {
          progressData = typeof dbPlan.progress_data === 'string' 
            ? JSON.parse(dbPlan.progress_data) 
            : dbPlan.progress_data || {};
        } catch (e) {
          console.error('Error parsing progress_data:', e);
          progressData = {};
        }

        return {
          id: dbPlan.id,
          name: dbPlan.plan_name,
          duration: dbPlan.duration as 30 | 180 | 365 | 7, // Type assertion for valid durations
          planType: (dbPlan.plan_type as 'free' | 'paid') || 'paid',
          createdAt: dbPlan.created_at || new Date().toISOString(),
          workouts: progressData.workouts || [],
          meals: progressData.meals || []
        };
      }) || [];

      setPlans(loadedPlans);
    } catch (err: any) {
      console.error('Error loading plans:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate unique meals for a specific day with Nigerian focus
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
    // Get all previously used meals
    const usedBreakfasts = existingMeals.map(meal => meal.breakfast);
    const usedMidMorningSnacks = existingMeals.map(meal => meal.midMorningSnack);
    const usedLunches = existingMeals.map(meal => meal.lunch);
    const usedAfternoonSnacks = existingMeals.map(meal => meal.afternoonSnack);
    const usedDinners = existingMeals.map(meal => meal.dinner);
    
    let filteredBreakfasts = breakfastOptions;
    let filteredLunches = lunchOptions;
    
    const focus = monthlyFocus[currentMonth as keyof typeof monthlyFocus];
    
    if (focus === "fiber") {
      filteredBreakfasts = breakfastOptions.filter(meal => 
        meal.includes("oatmeal") || meal.includes("porridge") || meal.includes("whole")
      );
    } else if (focus === "vegetables") {
      filteredLunches = lunchOptions.filter(meal => 
        meal.includes("vegetable") || meal.includes("soup") || meal.includes("salad")
      );
    } else if (focus === "plant-based") {
      filteredLunches = lunchOptions.filter(meal => 
        meal.includes("beans") || meal.includes("quinoa") || meal.includes("vegetable")
      );
    }
    
    if (filteredBreakfasts.length < 3) filteredBreakfasts = breakfastOptions;
    if (filteredLunches.length < 3) filteredLunches = lunchOptions;
    
    let availableBreakfasts = filteredBreakfasts.filter(item => !usedBreakfasts.includes(item));
    let availableMidMorningSnacks = midMorningSnackOptions.filter(item => !usedMidMorningSnacks.includes(item));
    let availableLunches = filteredLunches.filter(item => !usedLunches.includes(item));
    let availableAfternoonSnacks = afternoonSnackOptions.filter(item => !usedAfternoonSnacks.includes(item));
    let availableDinners = dinnerOptions.filter(item => !usedDinners.includes(item));
    
    if (availableBreakfasts.length === 0) availableBreakfasts = filteredBreakfasts;
    if (availableMidMorningSnacks.length === 0) availableMidMorningSnacks = midMorningSnackOptions;
    if (availableLunches.length === 0) availableLunches = filteredLunches;
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

  const createPlan = async (duration: 30 | 180 | 365 | 7, planType: 'free' | 'paid' = 'paid'): Promise<Plan> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error("Please login to generate a plan");
      }

      // Check if user is trying to create a second free trial plan
      if (planType === 'free' && hasUsedFreeTrial()) {
        throw new Error("You've already created your free trial plan. Upgrade to access more personalized plans.");
      }

      const workouts = [];
      const meals = [];
      const currentMonth = new Date().getMonth();
      
      // For free trials, generate full 30 days but limit access to 3
      const actualDuration = planType === 'free' ? 30 : duration;
      
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
      
      const planName = planType === 'free' ? "3-Day Free Trial Plan" : `${duration}-Day Nigerian Fitness Plan`;
      const planId = `plan-${Date.now()}`;
      
      const newPlan: Plan = {
        id: planId,
        name: planName,
        duration: actualDuration as 30 | 180 | 365 | 7,
        planType,
        createdAt: new Date().toISOString(),
        workouts,
        meals
      };

      // Save to Supabase with correct field mapping
      const { error: dbError } = await supabase
        .from('user_plans')
        .insert({
          id: newPlan.id,
          user_id: user.id,
          plan_id: newPlan.id, // Use plan_id as required by schema
          plan_name: newPlan.name,
          duration: newPlan.duration,
          plan_type: newPlan.planType,
          progress_data: JSON.stringify({
            workouts: newPlan.workouts,
            meals: newPlan.meals
          })
        });

      if (dbError) throw dbError;
      
      setPlans((prevPlans) => [...prevPlans, newPlan]);
      return newPlan;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async (plan: Plan) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_plans')
        .upsert({
          id: plan.id,
          user_id: user.id,
          plan_id: plan.id, // Use plan_id as required by schema
          plan_name: plan.name,
          duration: plan.duration,
          plan_type: plan.planType,
          progress_data: JSON.stringify({
            workouts: plan.workouts,
            meals: plan.meals
          })
        });

      if (error) throw error;

      setPlans((prevPlans) => {
        const existingPlanIndex = prevPlans.findIndex((p) => p.id === plan.id);
        if (existingPlanIndex !== -1) {
          const updatedPlans = [...prevPlans];
          updatedPlans[existingPlanIndex] = plan;
          return updatedPlans;
        } else {
          return [...prevPlans, plan];
        }
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const upgradePlan = async (planId: string, newDuration: 30 | 180 | 365): Promise<Plan> => {
    const planToUpgrade = plans.find(p => p.id === planId);
    if (!planToUpgrade) {
      throw new Error("Plan not found");
    }

    const upgradedPlan: Plan = {
      ...planToUpgrade,
      planType: 'paid',
      duration: newDuration,
      name: `${newDuration}-Day Nigerian Fitness Plan`
    };

    await savePlan(upgradedPlan);
    return upgradedPlan;
  };

  const getPlan = (id: string) => {
    return plans.find((plan) => plan.id === id);
  };

  return (
    <PlanContext.Provider value={{ 
      plans, 
      loading, 
      error, 
      createPlan, 
      savePlan, 
      getPlan, 
      hasUsedFreeTrial, 
      loadUserPlans,
      upgradePlan 
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
