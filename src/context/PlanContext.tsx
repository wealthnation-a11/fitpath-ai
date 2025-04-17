
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type Plan = {
  id: string;
  name: string;
  duration: 7 | 14 | 21 | 30;
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
    lunch: string;
    dinner: string;
    snacks: string[];
  }>;
};

type PlanContextType = {
  plans: Plan[];
  loading: boolean;
  error: string | null;
  createPlan: (duration: 7 | 14 | 21 | 30) => Promise<Plan>;
  savePlan: (plan: Plan) => void;
  getPlan: (id: string) => Plan | undefined;
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

// Database of meals for variety
const breakfastOptions = [
  "Oatmeal with fruits and nuts",
  "Greek yogurt with berries and honey",
  "Avocado toast with poached eggs",
  "Protein smoothie with spinach and banana",
  "Whole grain pancakes with maple syrup",
  "Egg white omelet with vegetables",
  "Chia seed pudding with almond milk",
  "Quinoa breakfast bowl with fresh fruits",
  "Whole grain toast with peanut butter and banana",
  "Breakfast burrito with beans and vegetables",
  "Cottage cheese with peaches and walnuts",
  "Overnight oats with cinnamon and apple",
  "Scrambled eggs with tomatoes and spinach",
  "Protein waffles with blueberries",
  "Smoked salmon with whole grain bagel"
];

const lunchOptions = [
  "Grilled chicken salad with olive oil dressing",
  "Tuna salad sandwich on whole grain bread",
  "Quinoa bowl with roasted vegetables",
  "Turkey and avocado wrap",
  "Lentil soup with whole grain crackers",
  "Chicken and vegetable stir-fry with brown rice",
  "Mediterranean salad with feta cheese",
  "Vegetable and hummus sandwich",
  "Shrimp and mango salad",
  "Black bean and sweet potato bowl",
  "Grilled salmon with asparagus",
  "Chickpea pasta with vegetables",
  "Tofu and vegetable curry with brown rice",
  "Egg salad on whole grain toast",
  "Beef and broccoli with brown rice"
];

const dinnerOptions = [
  "Baked salmon with steamed vegetables",
  "Grilled chicken breast with quinoa and broccoli",
  "Turkey meatballs with zucchini noodles",
  "Baked cod with sweet potato and asparagus",
  "Vegetable stir-fry with tofu and brown rice",
  "Lentil curry with cauliflower rice",
  "Grilled steak with roasted vegetables",
  "Chicken fajitas with bell peppers and onions",
  "Baked tilapia with quinoa and green beans",
  "Vegetable lasagna with side salad",
  "Shrimp and vegetable skewers",
  "Turkey chili with mixed beans",
  "Eggplant parmesan with side salad",
  "Baked chicken thighs with sweet potatoes",
  "Stuffed bell peppers with ground turkey and rice"
];

const snackOptions = [
  "Greek yogurt",
  "Handful of almonds",
  "Apple with peanut butter",
  "Carrot sticks with hummus",
  "Protein bar",
  "Hard-boiled egg",
  "Mixed berries",
  "Cottage cheese with pineapple",
  "Trail mix",
  "Celery with almond butter",
  "Roasted chickpeas",
  "String cheese",
  "Banana with nut butter",
  "Edamame",
  "Rice cakes with avocado"
];

// Database of exercises for variety
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

// Helper function to get random item from array
const getRandomItem = <T extends unknown>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get random integer between min and max (inclusive)
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to get a random exercise with random sets, reps, and rest
const getRandomExercise = () => {
  const exercise = getRandomItem(exerciseOptions);
  return {
    name: exercise.name,
    sets: getRandomItem(exercise.sets),
    reps: getRandomItem(exercise.reps),
    rest: getRandomItem(exercise.rest)
  };
};

// Function to get exercises for different categories without repetition
const generateUniqueExercisesForDay = (): Array<{
  name: string;
  sets: number;
  reps: number;
  rest: string;
}> => {
  // Get one exercise from each category
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

  // Load plans from localStorage when user changes
  useEffect(() => {
    if (user) {
      const storedPlans = localStorage.getItem(`fitpath-plans-${user.id}`);
      if (storedPlans) {
        setPlans(JSON.parse(storedPlans));
      }
    } else {
      setPlans([]);
    }
  }, [user]);

  // Save plans to localStorage whenever they change
  useEffect(() => {
    if (user && plans.length > 0) {
      localStorage.setItem(`fitpath-plans-${user.id}`, JSON.stringify(plans));
    }
  }, [plans, user]);

  // Generate unique meals for a specific day
  const generateUniqueMealsForDay = (existingMeals: Array<{
    day: number;
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string[];
  }> = []): {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string[];
  } => {
    let breakfast, lunch, dinner;
    
    // Get all previously used meals
    const usedBreakfasts = existingMeals.map(meal => meal.breakfast);
    const usedLunches = existingMeals.map(meal => meal.lunch);
    const usedDinners = existingMeals.map(meal => meal.dinner);
    
    // Find unique breakfast
    let availableBreakfasts = breakfastOptions.filter(item => !usedBreakfasts.includes(item));
    // If all options have been used, reset the filter
    breakfast = availableBreakfasts.length > 0 
      ? getRandomItem(availableBreakfasts) 
      : getRandomItem(breakfastOptions);
    
    // Find unique lunch
    let availableLunches = lunchOptions.filter(item => !usedLunches.includes(item));
    lunch = availableLunches.length > 0 
      ? getRandomItem(availableLunches) 
      : getRandomItem(lunchOptions);
    
    // Find unique dinner
    let availableDinners = dinnerOptions.filter(item => !usedDinners.includes(item));
    dinner = availableDinners.length > 0 
      ? getRandomItem(availableDinners) 
      : getRandomItem(dinnerOptions);
    
    // Generate 2-3 random snacks
    const numSnacks = getRandomInt(2, 3);
    const snacks: string[] = [];
    
    for (let i = 0; i < numSnacks; i++) {
      // Avoid duplicate snacks within the same day
      let availableSnacks = snackOptions.filter(item => !snacks.includes(item));
      snacks.push(getRandomItem(availableSnacks));
    }
    
    return {
      breakfast,
      lunch,
      dinner,
      snacks
    };
  };

  const createPlan = async (duration: 7 | 14 | 21 | 30): Promise<Plan> => {
    setLoading(true);
    setError(null);
    
    try {
      // Generate a unique plan with varied meals and workouts
      const workouts = [];
      const meals = [];
      
      for (let i = 0; i < duration; i++) {
        const dayNumber = i + 1;
        
        // Add unique workouts for this day
        workouts.push({
          day: dayNumber,
          exercises: generateUniqueExercisesForDay()
        });
        
        // Add unique meals for this day
        meals.push({
          day: dayNumber,
          ...generateUniqueMealsForDay(meals)
        });
      }
      
      const newPlan: Plan = {
        id: `plan-${Date.now()}`,
        name: `${duration}-Day Fitness Plan`,
        duration,
        createdAt: new Date().toISOString(),
        workouts,
        meals
      };
      
      setPlans((prevPlans) => [...prevPlans, newPlan]);
      return newPlan;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const savePlan = (plan: Plan) => {
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
  };

  const getPlan = (id: string) => {
    return plans.find((plan) => plan.id === id);
  };

  return (
    <PlanContext.Provider value={{ plans, loading, error, createPlan, savePlan, getPlan }}>
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
