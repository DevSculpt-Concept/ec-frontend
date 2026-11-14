import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, LogOut, Settings, User, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/redux/hooks";
import { useLogout } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Search", path: "/search" },
  { name: "Services", path: "/services" },
  { name: "Contact Us", path: "/contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const logoutMutation = useLogout();

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    logoutMutation.mutate();
    setLogoutConfirmOpen(false);
  };

  // Check if a link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    // Check URL params for links with query strings
    if (path.includes("?")) {
      const [pathname, searchQuery] = path.split("?");
      if (location.pathname === pathname) {
        const currentParams = new URLSearchParams(location.search);
        const linkParams = new URLSearchParams(searchQuery);

        // Check if all params from the link match current URL params
        let allMatch = true;
        for (const [key, value] of linkParams.entries()) {
          if (currentParams.get(key) !== value) {
            allMatch = false;
            break;
          }
        }
        return allMatch;
      }
      return false;
    }

    // Check if the current path matches or starts with the link path
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-white shadow-sm"
      data-aos="fade-down"
      data-aos-duration="500"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/images/Logo.jpeg"
              alt="The Curry Fabulous Family"
              className="h-10 rounded-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "transition-colors font-medium",
                  isActive(link.path)
                    ? "text-primary font-semibold"
                    : "text-gray-700 hover:text-primary-600"
                )}
              >
                {link.name}
              </Link>
            ))}

            {navLinks.slice(2).map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "transition-colors font-medium",
                  isActive(link.path)
                    ? "text-primary font-semibold"
                    : "text-gray-700 hover:text-primary-600"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    User Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/support")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Support & Help
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.role === "vendor" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/vendor/dashboard")}>
                        <Settings className="mr-2 h-4 w-4" />
                        Vendor Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogoutClick}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="default">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="default">Sign-Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
          mobileMenuOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="space-y-1 px-4 pb-3 pt-2">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                isActive(link.path)
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary-600"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {navLinks.slice(2).map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                isActive(link.path)
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary-600"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col space-y-2 pt-4">
            {isAuthenticated && user ? (
              <>
                <div className="px-3 py-2 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/support"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full mb-2">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Support & Help
                  </Button>
                </Link>
                {user.role === "vendor" && (
                  <Link
                    to="/vendor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Vendor Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    handleLogoutClick();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign-Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
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
    </nav>
  );
}
