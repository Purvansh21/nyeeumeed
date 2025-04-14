
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoute, getDashboardRoute } from "@/utils/permissions";
import { toast } from "@/components/ui/use-toast";

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/"];
    const isPublicRoute = publicRoutes.some(route => currentPath === route);

    if (!isAuthenticated && !isPublicRoute) {
      // Redirect to login if not authenticated and route requires auth
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to access this page.",
      });
      navigate("/login");
      return;
    }

    if (isAuthenticated) {
      if (isPublicRoute && currentPath !== "/") {
        // Redirect to dashboard if already authenticated and trying to access login page
        // Note: We don't redirect from the landing page (/) even if authenticated
        navigate(getDashboardRoute(user!.role));
        return;
      }

      // Check if user has permission to access this route
      if (!canAccessRoute(user!.role, currentPath)) {
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You don't have permission to access this page.",
        });
        navigate(getDashboardRoute(user!.role));
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, currentPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
