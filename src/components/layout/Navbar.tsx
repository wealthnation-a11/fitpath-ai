
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, LayoutDashboard, Dumbbell } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Dumbbell className="h-8 w-8 text-fitpath-blue" />
          <span className="text-2xl font-bold text-fitpath-blue">FitPath AI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`font-medium ${
              isActive("/") ? "text-fitpath-blue" : "text-gray-600 hover:text-fitpath-blue"
            }`}
          >
            Home
          </Link>
          <Link
            to="/plans"
            className={`font-medium ${
              isActive("/plans") ? "text-fitpath-blue" : "text-gray-600 hover:text-fitpath-blue"
            }`}
          >
            Plans
          </Link>
          <Link
            to="/contact"
            className={`font-medium ${
              isActive("/contact") ? "text-fitpath-blue" : "text-gray-600 hover:text-fitpath-blue"
            }`}
          >
            Contact
          </Link>
          <Link
            to="/faq"
            className={`font-medium ${
              isActive("/faq") ? "text-fitpath-blue" : "text-gray-600 hover:text-fitpath-blue"
            }`}
          >
            FAQ
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`font-medium ${
                  isActive("/dashboard") ? "text-fitpath-blue" : "text-gray-600 hover:text-fitpath-blue"
                }`}
              >
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button onClick={() => navigate("/signup")}>Sign up</Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 bg-white border-b border-gray-200 mt-2 py-4 px-6 z-20">
          <div className="flex flex-col space-y-4">
            <Link
              to="/"
              className={`font-medium ${
                isActive("/") ? "text-fitpath-blue" : "text-gray-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/plans"
              className={`font-medium ${
                isActive("/plans") ? "text-fitpath-blue" : "text-gray-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Plans
            </Link>
            <Link
              to="/contact"
              className={`font-medium ${
                isActive("/contact") ? "text-fitpath-blue" : "text-gray-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/faq"
              className={`font-medium ${
                isActive("/faq") ? "text-fitpath-blue" : "text-gray-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`font-medium ${
                    isActive("/dashboard") ? "text-fitpath-blue" : "text-gray-600"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button variant="outline" onClick={() => { navigate("/login"); setIsMenuOpen(false); }}>
                  Log in
                </Button>
                <Button onClick={() => { navigate("/signup"); setIsMenuOpen(false); }}>
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
