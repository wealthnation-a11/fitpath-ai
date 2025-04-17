
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

  const createPlan = async (duration: 7 | 14 | 21 | 30): Promise<Plan> => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call an API with AI capabilities
      // For now, we'll generate a mock plan
      const newPlan: Plan = {
        id: `plan-${Date.now()}`,
        name: `${duration}-Day Fitness Plan`,
        duration,
        createdAt: new Date().toISOString(),
        workouts: Array.from({ length: duration }, (_, i) => ({
          day: i + 1,
          exercises: [
            {
              name: "Push-ups",
              sets: 3,
              reps: 12,
              rest: "60 seconds"
            },
            {
              name: "Squats",
              sets: 3,
              reps: 15,
              rest: "60 seconds"
            },
            {
              name: "Plank",
              sets: 3,
              reps: 1,
              rest: "45 seconds"
            }
          ]
        })),
        meals: Array.from({ length: duration }, (_, i) => ({
          day: i + 1,
          breakfast: "Oatmeal with fruits and nuts",
          lunch: "Grilled chicken salad with olive oil dressing",
          dinner: "Baked salmon with steamed vegetables",
          snacks: ["Greek yogurt", "Handful of almonds"]
        }))
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
