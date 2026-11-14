import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Menu,
  Settings,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/redux/hooks";
import { useLogout } from "@/hooks/useAuth";

 

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
}

export function DashboardLayout({
  children,
  title,
  navItems,
}: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const logoutMutation = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLogoutConfirmOpen(false);
    } catch {
      // Error handled by mutation hook
    }
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userProfileImage = user?.profileImageUrl;

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <header className="bg-white border-b border-gray-200 h-20 flex items-center px-4 md:px-8 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* The Curry Fabulous Family logo and title */}
          <div className="flex items-center gap-3">
            <img
              src="/images/Logo.jpeg"
              alt="The Curry Fabulous Family"
              className="h-8 md:h-10 rounded-lg"
            />
            <span className="text-lg md:text-xl font-semibold text-gray-900 hidden sm:block">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">


          {/* User Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm hover:bg-primary-600 transition-colors cursor-pointer overflow-hidden">
                {userProfileImage ? (
                  <img
                    src={userProfileImage}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-gray-500">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  if (location.pathname.startsWith("/vendor")) {
                    navigate("/vendor/dashboard/profile");
                  } else {
                    navigate("/admin/settings");
                  }
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  if (location.pathname.startsWith("/vendor")) {
                    navigate("/vendor/dashboard/settings");
                  } else {
                    navigate("/admin/settings");
                  }
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogoutClick}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-30
            w-80 bg-gray-50 border-r border-gray-200 
            transform transition-transform duration-300 ease-in-out
            lg:transform-none overflow-y-auto
            ${sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
            }
          `}
          style={{ top: "80px" }}
        >
          {/* Mobile Close Button */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Check if current path matches or starts with the item path
              const isActive = location.pathname === item.path ||
                (item.path !== "/vendor/dashboard" && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-900"
                        }`}
                    />
                  </div>
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>

    

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to login again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogoutConfirmOpen(false)}
              disabled={logoutMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLogout}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2"
            >
              {logoutMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
