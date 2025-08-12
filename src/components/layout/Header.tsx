import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function AppHeader() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/lovable-uploads/f870dc56-8509-4607-9017-bb0b424fe03e.png"
            alt="KPH logo"
            className="h-8 w-auto"
            loading="lazy"
          />
          <div>
            <Link to="/dashboard" className="font-semibold">Kedaara Performance Hub</Link>
            <p className="text-xs text-muted-foreground leading-none">Elevating Excellence Together</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/dashboard" className={pathname === "/dashboard" ? "text-primary font-medium" : "hover:underline"}>Dashboard</Link>
          <Link to="/feedback" className={pathname === "/feedback" ? "text-primary font-medium" : "hover:underline"}>Feedback</Link>
          {user?.role === "System Administrator" && (
            <Link to="/admin" className={pathname.startsWith("/admin") ? "text-primary font-medium" : "hover:underline"}>Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-muted-foreground">{user.role}</span>}
          {user ? (
            <Button variant="secondary" onClick={() => { logout(); nav("/login", { replace: true }); }}>Logout</Button>
          ) : (
            <Button asChild><Link to="/login">Login</Link></Button>
          )}
        </div>
      </div>
    </header>
  );
}
