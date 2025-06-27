
-- Create a table to store user plans with proper tracking
CREATE TABLE public.user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  subscription_tier TEXT,
  is_active BOOLEAN DEFAULT true,
  current_day INTEGER DEFAULT 1,
  days_completed INTEGER[] DEFAULT '{}',
  progress_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table to track daily progress
CREATE TABLE public.daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_plan_id UUID REFERENCES public.user_plans(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  workout_completed BOOLEAN DEFAULT false,
  meal_completed BOOLEAN DEFAULT false,
  calories_burned INTEGER DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_plan_id, day_number)
);

-- Enable Row Level Security
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_plans
CREATE POLICY "Users can view their own plans" ON public.user_plans
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans" ON public.user_plans
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" ON public.user_plans
FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for daily_progress
CREATE POLICY "Users can view their own progress" ON public.daily_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.daily_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.daily_progress
FOR UPDATE USING (auth.uid() = user_id);

-- Update subscribers table to track trial usage
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT false;

-- Create function to update plan progress
CREATE OR REPLACE FUNCTION public.update_plan_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user_plans table when daily progress is updated
  UPDATE public.user_plans 
  SET 
    current_day = GREATEST(current_day, NEW.day_number),
    days_completed = array_append(
      COALESCE(days_completed, '{}'), 
      NEW.day_number
    ),
    updated_at = now()
  WHERE id = NEW.user_plan_id 
    AND NOT (NEW.day_number = ANY(COALESCE(days_completed, '{}')));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic progress updates
CREATE TRIGGER update_plan_progress_trigger
  AFTER INSERT OR UPDATE ON public.daily_progress
  FOR EACH ROW
  WHEN (NEW.workout_completed = true OR NEW.meal_completed = true)
  EXECUTE FUNCTION public.update_plan_progress();
