
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

type AuthUser = {
  id: string;
  email: string;
  name: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Configure Supabase client for persistent sessions
    const initializeAuth = async () => {
      try {
        // First, get any existing session
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session retrieval error:", sessionError);
        }

        if (mounted && existingSession) {
          console.log("Existing session found:", existingSession.user?.email);
          setSession(existingSession);
          
          const userData = {
            id: existingSession.user.id,
            email: existingSession.user.email || '',
            name: existingSession.user.user_metadata?.name || 
                  existingSession.user.user_metadata?.full_name || 
                  existingSession.user.email?.split('@')[0] || 
                  'User'
          };
          setUser(userData);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (!mounted) return;
        
        // Clear any existing errors on auth state change
        setError(null);
        
        setSession(session);
        
        if (session?.user) {
          // Create user object from session data
          const userData = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 
                  session.user.user_metadata?.full_name || 
                  session.user.email?.split('@')[0] || 
                  'User'
          };
          setUser(userData);
          
          // Handle profile creation/update in background without blocking auth
          setTimeout(async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              if (!profile && !profileError) {
                // Create profile if it doesn't exist
                await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: userData.name
                  });
                console.log("Profile created for user:", session.user.email);
              }
            } catch (err) {
              console.log("Profile sync error (non-blocking):", err);
            }
          }, 100);
        } else {
          setUser(null);
          console.log("User signed out or session expired");
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    // Prevent automatic token refresh failures from logging users out
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh session when app becomes visible again
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session && mounted) {
            console.log("Refreshing session on visibility change");
          }
        });
      }
    };

    // Listen for when the app becomes visible again
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error("Login failed - no user returned");
      }

      console.log("Login successful for:", email);
      // Don't set loading to false here - let onAuthStateChange handle it
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      setLoading(false);
      throw err;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!data.user) {
        throw new Error("Signup failed - no user returned");
      }

      console.log("Signup successful for:", email);
      
      // Check if email confirmation is required
      if (!data.session) {
        toast.success("Account created successfully! Please check your email for verification.");
        setLoading(false);
      }
      // If session exists, onAuthStateChange will handle the rest
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Signup failed");
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      console.log("Logout successful");
      // Clear local state immediately
      setUser(null);
      setSession(null);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
