
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRoleDisplayName } from "@/utils/permissions";
import { 
  LogOut, Menu, User, Shield, Users, Home, FileText, Settings, 
  AlertTriangle, Calendar, BarChart2, Briefcase, PieChart, 
  Activity, ChevronLeft, ChevronRight, Bell, Package, ClipboardList
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Get user's initials for the avatar
  const getInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Toggle sidebar minimized state
  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];

    const roleBasedLinks = {
      admin: [
        { icon: Home, label: "Dashboard", path: "/admin" },
        { icon: Users, label: "User Management", path: "/admin/users" },
        { icon: BarChart2, label: "System Analytics", path: "/admin/analytics" },
        { icon: PieChart, label: "Reports", path: "/admin/reports" }, 
        { icon: AlertTriangle, label: "Audit Logs", path: "/admin/audit-logs" },
        { icon: Bell, label: "Announcements", path: "/admin/announcements" },
        { icon: Settings, label: "System Settings", path: "/admin/settings" },
      ],
      staff: [
        { icon: Home, label: "Dashboard", path: "/staff" },
        { icon: Users, label: "Volunteer Management", path: "/staff/volunteers" },
        { icon: Briefcase, label: "Beneficiary Management", path: "/staff/beneficiaries" },
        { icon: Package, label: "Resources", path: "/staff/resources" },
        { icon: ClipboardList, label: "Tasks", path: "/staff/tasks" },
        { icon: Activity, label: "Reports", path: "/staff/reports" },
      ],
      volunteer: [
        { icon: Home, label: "Dashboard", path: "/volunteer" },
        { icon: Calendar, label: "My Schedule", path: "/volunteer/schedule" },
        { icon: Briefcase, label: "Opportunities", path: "/volunteer/opportunities" },
        { icon: FileText, label: "Resources", path: "/volunteer/resources" },
      ],
      beneficiary: [
        { icon: Home, label: "Dashboard", path: "/beneficiary" },
        { icon: FileText, label: "My Services", path: "/beneficiary/services" },
        { icon: Calendar, label: "Appointments", path: "/beneficiary/appointments" },
        { icon: FileText, label: "Resources", path: "/beneficiary/resources" },
      ],
    };

    return roleBasedLinks[user.role] || [];
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  if (!user) {
    return null;
  }

  const navItems = getNavItems();
  
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          isMinimized ? "md:w-20" : "md:w-64"
        )}
      >
        {/* Sidebar Header with Logo and Toggle Button */}
        <div className="flex items-center justify-between p-6">
          <div className={cn("flex items-center gap-2", isMinimized && "justify-center")}>
            <Shield className="h-6 w-6 text-sidebar-accent" />
            {!isMinimized && <h1 className="text-xl font-bold text-sidebar-foreground">NGO Hub</h1>}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isMinimized && "absolute right-0 top-6 -mr-3 bg-sidebar border border-sidebar-border rounded-full shadow-md"
            )}
          >
            {isMinimized ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        
        <nav className="flex-1 px-4 pb-4">
          <div className="py-2">
            {!isMinimized && (
              <div className="text-xs uppercase tracking-wider text-sidebar-foreground/60 px-3 mb-2">
                {getRoleDisplayName(user.role)} Portal
              </div>
            )}
            <Separator className="bg-sidebar-border my-2" />
            <TooltipProvider delayDuration={0}>
              <ul className="space-y-1 pt-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center gap-3 rounded-md text-sidebar-foreground transition-colors",
                            isMinimized ? "justify-center p-3" : "px-3 py-2",
                            location.pathname === item.path
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {!isMinimized && <span>{item.label}</span>}
                        </Link>
                      </TooltipTrigger>
                      {isMinimized && <TooltipContent side="right">{item.label}</TooltipContent>}
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </TooltipProvider>
          </div>
        </nav>
        
        <div className="border-t border-sidebar-border p-4">
          <div className={cn("flex items-center gap-3 mb-3", isMinimized && "justify-center")}>
            <Avatar>
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {!isMinimized && (
              <div>
                <div className="font-medium text-sidebar-foreground">{user.fullName}</div>
                <div className="text-xs text-sidebar-foreground/70">{user.email}</div>
              </div>
            )}
          </div>
          {!isMinimized ? (
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => navigate(`/${user.role}/profile`)}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <TooltipProvider>
              <div className="flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      onClick={() => navigate(`/${user.role}/profile`)}
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Profile</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Logout</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}
        </div>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden flex items-center justify-between w-full p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold">NGO Hub</span>
        </div>
        
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">NGO Hub</h1>
              </div>
            </div>
            
            <nav className="px-4 pb-4">
              <div className="py-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground px-3 mb-2">
                  {getRoleDisplayName(user.role)} Portal
                </div>
                <Separator className="my-2" />
                <ul className="space-y-1 pt-2">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                          location.pathname === item.path
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
            
            <div className="border-t border-border p-4 mt-auto">
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarFallback className="bg-accent">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(`/${user.role}/profile`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-auto",
        isMinimized ? "md:ml-20" : "md:ml-0" // Adjust content when sidebar is minimized for desktop
      )}>
        <div className="container mx-auto py-6 px-4 md:px-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
