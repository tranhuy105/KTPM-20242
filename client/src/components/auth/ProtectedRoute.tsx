import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

interface ProtectedRouteProps {
  redirectPath?: string;
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component that handles authentication redirects
 * @param redirectPath - Path to redirect to if condition is not met
 * @param requireAuth - If true, redirect unauthenticated users. If false, redirect authenticated users.
 * @returns The child routes or Navigate component
 */
const ProtectedRoute = ({
  redirectPath = "/",
  requireAuth = true,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  // While checking auth status, don't redirect yet
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">Loading...</div>
    );
  }

  // If requireAuth is true and user is not authenticated, redirect to login
  // If requireAuth is false and user is authenticated, redirect to home (for login/register pages)
  const shouldRedirect = requireAuth ? !isAuthenticated : isAuthenticated;

  return shouldRedirect ? <Navigate to={redirectPath} replace /> : <Outlet />;
};

export default ProtectedRoute;
