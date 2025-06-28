
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import LoadingFallback from "@/components/LoadingFallback";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're not loading and there's no session
    if (!loading && !session && !user) {
      console.log("Protected route: No valid session, redirecting to login");
      toast.error("Please log in to access this page");
      navigate("/login");
    }
  }, [user, loading, session, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingFallback />;
  }

  // If we have a session or user, render the protected content
  if (session || user) {
    return <>{children}</>;
  }

  // Return null while redirecting (navigation happens in useEffect)
  return null;
};

export default ProtectedRoute;
