import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/context/AuthContext";

type Props = {
  roles?: Role[];
};

export default function ProtectedRoute({ roles }: Props) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && roles.length > 0 && (!user.role || !roles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

