import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type Plan = {
  id: string;
  name: string;
  duration: 30 | 180 | 365;
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
  loading: boolean;
  error: string | null;
  createPlan: (duration: 30 | 180 | 365) => Promise<Plan>;
  savePlan: (plan: Plan) => void;
  getPlan: (id: string) => Plan | undefined;
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
    
    // Apply monthly focus filtering (simplified for demonstration)
    let filteredBreakfasts = breakfastOptions;
    let filteredLunches = lunchOptions;
    
    const focus = monthlyFocus[currentMonth as keyof typeof monthlyFocus];
    
    // Apply monthly focus preferences
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
    
    // If filtered options are too limited, use full options
    if (filteredBreakfasts.length < 3) filteredBreakfasts = breakfastOptions;
    if (filteredLunches.length < 3) filteredLunches = lunchOptions;
    
    // Find unique options
    let availableBreakfasts = filteredBreakfasts.filter(item => !usedBreakfasts.includes(item));
    let availableMidMorningSnacks = midMorningSnackOptions.filter(item => !usedMidMorningSnacks.includes(item));
    let availableLunches = filteredLunches.filter(item => !usedLunches.includes(item));
    let availableAfternoonSnacks = afternoonSnackOptions.filter(item => !usedAfternoonSnacks.includes(item));
    let availableDinners = dinnerOptions.filter(item => !usedDinners.includes(item));
    
    // Reset to full options if all have been used
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

  const createPlan = async (duration: 30 | 180 | 365): Promise<Plan> => {
    setLoading(true);
    setError(null);
    
    try {
      const workouts = [];
      const meals = [];
      const currentMonth = new Date().getMonth();
      
      for (let i = 0; i < duration; i++) {
        const dayNumber = i + 1;
        
        // Add unique workouts for this day
        workouts.push({
          day: dayNumber,
          exercises: generateUniqueExercisesForDay()
        });
        
        // Add unique meals for this day with monthly focus
        meals.push({
          day: dayNumber,
          ...generateUniqueMealsForDay(meals, currentMonth)
        });
      }
      
      // For trial users, create a 3-day free trial plan name
      const planName = duration === 7 ? "3-Day Free Trial Plan" : `${duration}-Day Nigerian Fitness Plan`;
      
      const newPlan: Plan = {
        id: `plan-${Date.now()}`,
        name: planName,
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
