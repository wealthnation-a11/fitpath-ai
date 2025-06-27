
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserPlan = Database['public']['Tables']['user_plans']['Row'];
type DailyProgress = Database['public']['Tables']['daily_progress']['Row'];

export interface PlanData {
  id: string;
  name: string;
  duration: number;
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
}

export const planService = {
  // Get user's existing plans from database
  async getUserPlans(userId: string): Promise<UserPlan[]> {
    const { data, error } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user plans:', error);
      throw error;
    }

    return data || [];
  },

  // Get active plan for user
  async getActivePlan(userId: string): Promise<UserPlan | null> {
    const { data, error } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching active plan:', error);
      throw error;
    }

    return data;
  },

  // Create new plan in database
  async createPlan(
    userId: string, 
    planData: PlanData, 
    subscriptionTier: string = 'free-trial'
  ): Promise<UserPlan> {
    // Deactivate existing plans
    await supabase
      .from('user_plans')
      .update({ is_active: false })
      .eq('user_id', userId);

    const { data, error } = await supabase
      .from('user_plans')
      .insert({
        user_id: userId,
        plan_id: planData.id,
        plan_name: planData.name,
        duration: planData.duration,
        subscription_tier: subscriptionTier,
        is_active: true,
        progress_data: {
          workouts: planData.workouts,
          meals: planData.meals
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      throw error;
    }

    return data;
  },

  // Update plan when upgrading subscription
  async upgradePlan(
    userId: string, 
    newPlanData: PlanData, 
    subscriptionTier: string
  ): Promise<UserPlan> {
    // Get current active plan to preserve progress
    const currentPlan = await this.getActivePlan(userId);
    
    // Deactivate current plan
    if (currentPlan) {
      await supabase
        .from('user_plans')
        .update({ is_active: false })
        .eq('id', currentPlan.id);
    }

    // Create upgraded plan, preserving progress
    const { data, error } = await supabase
      .from('user_plans')
      .insert({
        user_id: userId,
        plan_id: newPlanData.id,
        plan_name: newPlanData.name,
        duration: newPlanData.duration,
        subscription_tier: subscriptionTier,
        is_active: true,
        current_day: currentPlan?.current_day || 1,
        days_completed: currentPlan?.days_completed || [],
        progress_data: {
          workouts: newPlanData.workouts,
          meals: newPlanData.meals
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error upgrading plan:', error);
      throw error;
    }

    // Transfer daily progress to new plan
    if (currentPlan) {
      const { data: progressData } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_plan_id', currentPlan.id);

      if (progressData && progressData.length > 0) {
        const updatedProgress = progressData.map(progress => ({
          ...progress,
          id: undefined,
          user_plan_id: data.id
        }));

        await supabase
          .from('daily_progress')
          .insert(updatedProgress);
      }
    }

    return data;
  },

  // Get daily progress for a plan
  async getDailyProgress(planId: string): Promise<DailyProgress[]> {
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_plan_id', planId)
      .order('day_number', { ascending: true });

    if (error) {
      console.error('Error fetching daily progress:', error);
      throw error;
    }

    return data || [];
  },

  // Update daily progress
  async updateDailyProgress(
    userId: string,
    planId: string,
    dayNumber: number,
    updates: {
      workout_completed?: boolean;
      meal_completed?: boolean;
      calories_burned?: number;
      notes?: string;
    }
  ): Promise<DailyProgress> {
    const { data, error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        user_plan_id: planId,
        day_number: dayNumber,
        completed_at: (updates.workout_completed || updates.meal_completed) ? new Date().toISOString() : null,
        ...updates
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating daily progress:', error);
      throw error;
    }

    return data;
  },

  // Check if user has used free trial
  async hasUsedFreeTrial(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('subscribers')
      .select('has_used_trial')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking trial usage:', error);
      return false;
    }

    return data?.has_used_trial || false;
  },

  // Mark free trial as used
  async markTrialAsUsed(userId: string, email: string): Promise<void> {
    const { error } = await supabase
      .from('subscribers')
      .upsert({
        user_id: userId,
        email: email,
        has_used_trial: true
      });

    if (error) {
      console.error('Error marking trial as used:', error);
      throw error;
    }
  }
};
