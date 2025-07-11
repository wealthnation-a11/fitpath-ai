
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://onbjwvniqlgftpkrmzaq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmp3dm5pcWxnZnRwa3JtemFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTMwMjcsImV4cCI6MjA2MDQ2OTAyN30.EQkrhDWGRoG06UoQUQcFz7pTptKpZQgN3SpzPsiOYl4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
