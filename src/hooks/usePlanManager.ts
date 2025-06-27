
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePayment } from '@/context/PaymentContext';
import { planService, type PlanData } from '@/services/planService';
import type { Database } from '@/integrations/supabase/types';

type UserPlan = Database['public']['Tables']['user_plans']['Row'];
type DailyProgress = Database['public']['Tables']['daily_progress']['Row'];

export const usePlanManager = () => {
  const { user } = useAuth();
  const { subscription } = usePayment();
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's existing plan on login
  const loadUserPlan = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const activePlan = await planService.getActivePlan(user.id);
      
      if (activePlan) {
        setCurrentPlan(activePlan);
        const progress = await planService.getDailyProgress(activePlan.id);
        setDailyProgress(progress);
      } else {
        setCurrentPlan(null);
        setDailyProgress([]);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading user plan:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load plan on user change
  useEffect(() => {
    loadUserPlan();
  }, [loadUserPlan]);

  // Get plan duration based on subscription
  const getPlanDurationForSubscription = (subscriptionTier: string): number => {
    const tierMap: { [key: string]: number } = {
      'free-trial': 7,
      'monthly': 30,
      'semi-annual': 180,
      'annual': 365
    };
    
    return tierMap[subscriptionTier] || 7;
  };

  // Create new plan
  const createPlan = async (planData: PlanData): Promise<UserPlan> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const subscriptionTier = subscription.plan?.id || 'free-trial';
      
      // Mark trial as used if creating free trial
      if (subscriptionTier === 'free-trial') {
        await planService.markTrialAsUsed(user.id, user.email);
      }

      const newPlan = await planService.createPlan(user.id, planData, subscriptionTier);
      setCurrentPlan(newPlan);
      setDailyProgress([]);
      
      return newPlan;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upgrade plan when subscription changes
  const upgradePlan = async (newPlanData: PlanData, subscriptionTier: string): Promise<UserPlan> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const upgradedPlan = await planService.upgradePlan(user.id, newPlanData, subscriptionTier);
      setCurrentPlan(upgradedPlan);
      
      // Reload progress for new plan
      const progress = await planService.getDailyProgress(upgradedPlan.id);
      setDailyProgress(progress);
      
      return upgradedPlan;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update daily progress
  const updateProgress = async (
    dayNumber: number,
    updates: {
      workout_completed?: boolean;
      meal_completed?: boolean;
      calories_burned?: number;
      notes?: string;
    }
  ) => {
    if (!user || !currentPlan) return;

    try {
      const updatedProgress = await planService.updateDailyProgress(
        user.id,
        currentPlan.id,
        dayNumber,
        updates
      );

      // Update local state
      setDailyProgress(prev => {
        const index = prev.findIndex(p => p.day_number === dayNumber);
        if (index >= 0) {
          const newProgress = [...prev];
          newProgress[index] = updatedProgress;
          return newProgress;
        }
        return [...prev, updatedProgress];
      });

      // Reload current plan to get updated progress counters
      const refreshedPlan = await planService.getActivePlan(user.id);
      if (refreshedPlan) {
        setCurrentPlan(refreshedPlan);
      }

    } catch (err: any) {
      setError(err.message);
      console.error('Error updating progress:', err);
    }
  };

  // Check if user has used free trial
  const hasUsedFreeTrial = async (): Promise<boolean> => {
    if (!user) return false;
    return await planService.hasUsedFreeTrial(user.id);
  };

  // Get progress for specific day
  const getDayProgress = (dayNumber: number): DailyProgress | null => {
    return dailyProgress.find(p => p.day_number === dayNumber) || null;
  };

  // Calculate completion percentage
  const getCompletionPercentage = (): number => {
    if (!currentPlan || currentPlan.duration === 0) return 0;
    const completedDays = currentPlan.days_completed?.length || 0;
    return Math.round((completedDays / currentPlan.duration) * 100);
  };

  return {
    currentPlan,
    dailyProgress,
    loading,
    error,
    createPlan,
    upgradePlan,
    updateProgress,
    hasUsedFreeTrial,
    getDayProgress,
    getCompletionPercentage,
    getPlanDurationForSubscription,
    reloadPlan: loadUserPlan
  };
};
