
-- Add a plan_type column to user_plans table to distinguish free vs paid plans
ALTER TABLE public.user_plans ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'paid';

-- Update existing plans to have a plan_type
UPDATE public.user_plans SET plan_type = 'paid' WHERE plan_type IS NULL;

-- Make plan_type not null
ALTER TABLE public.user_plans ALTER COLUMN plan_type SET NOT NULL;

-- Add a unique constraint to prevent multiple free trial plans per user (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_free_trial') THEN
        ALTER TABLE public.user_plans ADD CONSTRAINT unique_user_free_trial 
        UNIQUE (user_id, plan_type) 
        DEFERRABLE INITIALLY DEFERRED;
    END IF;
END $$;

-- Add an index for better performance when querying free trial plans (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_user_plans_user_plan_type ON public.user_plans(user_id, plan_type);

-- Enable RLS on user_plans table if not already enabled
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own plans" ON public.user_plans;
DROP POLICY IF EXISTS "Users can insert their own plans" ON public.user_plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON public.user_plans;
DROP POLICY IF EXISTS "Users can delete their own plans" ON public.user_plans;

-- Create RLS policies for user_plans table
CREATE POLICY "Users can view their own plans" ON public.user_plans
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own plans" ON public.user_plans
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own plans" ON public.user_plans
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own plans" ON public.user_plans
FOR DELETE USING (user_id = auth.uid());
