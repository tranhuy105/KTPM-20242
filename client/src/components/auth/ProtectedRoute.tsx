import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

interface ProtectedRouteProps {
  redirectPath?: string;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  children?: React.ReactNode;
}

/**
 * ProtectedRoute component that handles authentication redirects
 * @param redirectPath - Path to redirect to if condition is not met
 * @param requireAuth - If true, redirect unauthenticated users. If false, redirect authenticated users.
 * @param requireAdmin - If true, redirect non-admin users
 * @param children - Optional children to render instead of Outlet
 * @returns The child routes or Navigate component
 */
const ProtectedRoute = ({
  redirectPath = "/",
  requireAuth = true,
  requireAdmin = false,
  children,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  // While checking auth status, don't redirect yet
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">Loading...</div>
    );
  }

  // Check if user is authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user should be redirected (for login/register pages)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user is admin when admin access is required
  if (requireAdmin && (!user || !(user.isAdmin || user.role === "admin"))) {
    return <Navigate to="/" replace />;
  }

  // Render children if provided, otherwise use Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
