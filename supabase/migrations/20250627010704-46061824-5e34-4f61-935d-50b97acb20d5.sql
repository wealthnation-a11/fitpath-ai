
-- Update the update_plan_progress function to set proper search_path
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public;

-- Update the handle_new_user function to use the recommended search_path format
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public;
