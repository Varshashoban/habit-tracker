import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "../hooks/useAuth";
import AuthLoading from "./AuthLoading";

function ProtectedRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoading />;
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
