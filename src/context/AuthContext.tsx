
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: string;
  email: string;
  name: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This is a mock implementation. Replace with actual Firebase or backend authentication
  // when Supabase is connected
  useEffect(() => {
    // Check if user is already logged in (from localStorage in this mock)
    const storedUser = localStorage.getItem('fitpathUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Mock login - replace with actual auth when Supabase is connected
      // In a real app, you'd verify credentials with your backend
      if (password.length < 8) {
        throw new Error("Invalid credentials");
      }
      
      // For demo purposes, we'll create a user if not exists
      const mockUser = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
      };
      
      localStorage.setItem('fitpathUser', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      // Mock signup - replace with actual auth when Supabase is connected
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      
      const mockUser = {
        id: `user-${Date.now()}`,
        email,
        name,
      };
      
      localStorage.setItem('fitpathUser', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Mock logout
    localStorage.removeItem('fitpathUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, error }}>
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
