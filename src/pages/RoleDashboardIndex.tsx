import React from "react";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "./Dashboard";
import GeneralDashboard from "./GeneralDashboard";

const RoleDashboardIndex: React.FC = () => {
  const { user } = useAuth();
  // HR Lead keeps existing Dashboard page
  if (user?.role === "HR Lead") return <Dashboard />;
  // Others use the simplified general dashboard
  return <GeneralDashboard />;
};

export default RoleDashboardIndex;


