import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, MapPin, CalendarClock } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "User Master", url: "/admin/users", icon: Users },
  { title: "Location Master", url: "/admin/locations", icon: MapPin },
  { title: "Review Cycle Master", url: "/admin/review-cycles", icon: CalendarClock },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const linkCls = (isActive: boolean) =>
    [
      "flex w-full items-center gap-2 px-2 py-2 rounded-md transition-colors",
      isActive
        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow hover-scale"
        : "text-sidebar-foreground/80 hover:bg-primary/15 hover:text-primary",
    ].join(" ");

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="relative bg-gradient-to-b from-primary/10 via-accent/5 to-background">
        {/* Brand header */}
        <div className="flex items-center gap-3 px-3 pt-3 animate-fade-in">
          <img
            src="/lovable-uploads/f870dc56-8509-4607-9017-bb0b424fe03e.png"
            alt="KPH logo"
            className="h-8 w-auto"
            loading="lazy"
          />
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-semibold">KPH Admin</div>
              <div className="text-[11px] text-muted-foreground">Elevating Excellence</div>
            </div>
          )}
        </div>

        <SidebarSeparator className="my-3" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={({ isActive }) => linkCls(isActive)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
