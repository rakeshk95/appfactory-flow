import { Link, Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { AppSidebar } from "./AppSidebar";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <SidebarTrigger aria-label="Toggle sidebar" />
              </div>
              <div className="flex items-center gap-3">
                {user && <span className="text-sm text-muted-foreground">{user.role}</span>}
                <Button variant="secondary" onClick={() => { logout(); nav("/login", { replace: true }); }}>Logout</Button>
              </div>
            </div>
          </header>

          <SidebarInset>
            <main className="container py-6">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
