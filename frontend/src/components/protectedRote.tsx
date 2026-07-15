import { Navigate, Outlet } from "react-router-dom";
import { useAppData } from "../context/AppContext";

const ProtectedRoute = () => {
  const { isAuth, loading } = useAppData();

  if (loading) return null;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
