import React from "react";
import { useAuth } from "@/context/AuthContext";
import HRLeadLayout from "./HRLeadLayout";
import GeneralLayout from "./GeneralLayout";

const RoleDashboardLayout: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === "HR Lead") {
    return <HRLeadLayout />;
  }
  return <GeneralLayout />;
};

export default RoleDashboardLayout;


