
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitpath-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your fitness journey...</p>
        </div>
      </div>
    );
  }

  // If we have a session or user, render the protected content
  if (session || user) {
    return <>{children}</>;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitpath-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
};

export default ProtectedRoute;
