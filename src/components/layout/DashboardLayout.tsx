import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Pill,
  TestTube,
  FileText,
  Heart,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Users,
  BarChart3,
  Clock,
  Phone,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/page-transition";
import { SOSButton } from "@/components/features/SOSButton";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const patientNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Assistant", href: "/chat", icon: MessageSquare },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Consultations", href: "/consultations", icon: Phone },
  { name: "Pharmacy", href: "/pharmacy", icon: Pill },
  { name: "Lab Tests", href: "/lab-tests", icon: TestTube },
  { name: "Health Records", href: "/records", icon: FileText },
  { name: "Vitals", href: "/vitals", icon: Heart },
];

const doctorNav: NavItem[] = [
  { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { name: "My Schedule", href: "/doctor/schedule", icon: Clock },
  { name: "Patients", href: "/doctor/patients", icon: Users },
  { name: "Consultations", href: "/doctor/consultations", icon: Stethoscope },
  { name: "Messages", href: "/doctor/messages", icon: MessageSquare },
];

const adminNav: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { name: "Patients", href: "/admin/patients", icon: Users },
  { name: "Appointments", href: "/admin/appointments", icon: Calendar },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const getNavItems = (role: UserRole): NavItem[] => {
  switch (role) {
    case "patient":
      return patientNav;
    case "doctor":
      return doctorNav;
    case "admin":
      return adminNav;
    default:
      return patientNav;
  }
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = getNavItems(user?.role || "patient");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg text-2xl">
              🩺
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap"
              >
                MedTech AI
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-accent transition-colors",
                  sidebarOpen ? "justify-start" : "justify-center"
                )}
              >
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Switch Role (Demo)
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => switchRole("patient")}>
                <User className="w-4 h-4 mr-2" />
                Patient
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole("doctor")}>
                <Stethoscope className="w-4 h-4 mr-2" />
                Doctor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole("admin")}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar z-50 lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-2xl">
                    🩺
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">
                    MedTech AI
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="py-4 px-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Top Header */}
        <header className="h-16 bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden sm:flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-2 w-64 lg:w-80">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* SOS Button for Patients */}
            {user?.role === "patient" && <SOSButton />}
            
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>

            <Avatar className="w-9 h-9 lg:hidden">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
