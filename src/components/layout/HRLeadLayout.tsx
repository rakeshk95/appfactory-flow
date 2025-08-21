import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function HRLeadLayout() {
  const { user } = useAuth();

  // Redirect if user is not HR Lead
  if (!user || user.role !== "HR Lead") {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div 
            style={{
              width: '100%',
              height: '100%',
              padding: '1.5rem',
              margin: '0',
              maxWidth: 'none',
              minWidth: '100%'
            }}
          >
            <div 
              style={{
                width: '100%',
                maxWidth: 'none',
                minWidth: '100%',
                margin: '0',
                padding: '0'
              }}
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
