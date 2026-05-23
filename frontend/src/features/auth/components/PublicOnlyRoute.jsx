import { Navigate, Outlet } from "react-router";

import { useAuth } from "../hooks/useAuth";
import AuthLoading from "./AuthLoading";

function PublicOnlyRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (user) {
    return <Navigate replace to="/dashboard" />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
