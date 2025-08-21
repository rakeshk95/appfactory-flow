import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, MapPin, CalendarClock, LogOut, Settings, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Admin navigation items
const adminNavigationItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "User Master", url: "/admin/users", icon: Users },
  { title: "Location Master", url: "/admin/locations", icon: MapPin },
  { title: "Review Cycle Master", url: "/admin/review-cycles", icon: CalendarClock },
];

// HR Lead navigation items
const hrNavigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Initiate Performance Cycle", url: "/dashboard/initiate-cycle", icon: Settings },
  { title: "Review Performance Data", url: "/dashboard/review-data", icon: FileText },
];

// Employee (Mentee) navigation items
const employeeNavigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Select Reviewers", url: "/dashboard/select-reviewers", icon: Users },
];

// Mentor navigation items
const mentorNavigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Review & Approve", url: "/dashboard/review-approve", icon: FileText },
];

// Reviewer navigation items
const reviewerNavigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Provide Feedback", url: "/dashboard/feedback", icon: FileText },
];

export function AppSidebar() {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return adminNavigationItems;
    
    switch (user.role) {
      case "System Administrator":
        return adminNavigationItems;
      case "HR Lead":
        return hrNavigationItems;
      case "Employee":
        return employeeNavigationItems;
      case "Mentor":
        return mentorNavigationItems;
      case "People Committee":
        return reviewerNavigationItems;
      default:
        return adminNavigationItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="relative bg-gray-100 border-r border-gray-300">
        {/* Logo Section - Full Width */}
        <div className="w-full h-24 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center p-0 shadow-lg">
          <img
            src="/lovable-uploads/logo.png"
            alt="KPH logo"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin" || item.url === "/dashboard"}
                      className={({ isActive }) =>
                        `flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group mb-2 ${
                          isActive
                            ? 'bg-blue-400 text-gray-900 shadow-lg scale-105 font-bold'
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-5 w-5 transition-all duration-300 group-hover:scale-110 ${
                            isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-800'
                          }`} />
                          {!collapsed && (
                            <span className={`font-medium transition-all duration-300 ${
                              isActive ? 'text-gray-900 font-bold' : 'text-gray-700 group-hover:text-gray-900'
                            }`}>
                              {item.title}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout section at bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`w-full bg-white border-red-500 text-red-700 hover:bg-red-50 hover:border-red-600 hover:text-red-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${collapsed ? 'px-2' : 'px-4'}`}
          >
            <LogOut className={`${collapsed ? 'h-4 w-4' : 'h-4 w-4 mr-2'}`} />
            {!collapsed && <span className="font-bold">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
