
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 w-full max-w-md bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // If we have a session or user, render the protected content
  if (session || user) {
    return <>{children}</>;
  }

  // Return null while redirecting (navigation happens in useEffect)
  return null;
};

export default ProtectedRoute;
