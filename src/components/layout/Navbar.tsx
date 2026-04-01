import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, LogIn, LogOut, User, Shield, Trophy, Home, BookMarked, Users, Gamepad2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { name: "Hom", path: "/", icon: Home },
  { name: "About", path: "/about", icon: BookMarked },
  { name: "Team", path: "/team", icon: Users },
  { name: "Events", path: "/events", icon: Gamepad2 },
  { name: "Contact", path: "/contact", icon: Mail },
];

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.add("has-mobile-bottom-nav");
    return () => {
      document.body.classList.remove("has-mobile-bottom-nav");
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      variant: "success",
    });
    navigate("/");
  };

  const isHomePage = location.pathname === "/";

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-background border-b-2 border-[#FF0000] shadow-lg shadow-primary/10"
          : isHomePage
            ? "bg-transparent"
            : "bg-background border-b-2 border-[#FF0000]"
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/KLU-Esports-Circle-Logo.png"
                  alt="KLU-Esports"
                  className="w-10 h-10 rounded-full border border-[#FF0000] drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl flame-text leading-none uppercase tracking-wider">
                  KLU ESPORTS
                </span>
                <span className="text-xs text-white font-medium uppercase leading-tight tracking-[0.085em]">
                  Gaming Community
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link font-display text-sm uppercase tracking-[0.1em] transition-colors flex items-center gap-1.5 ${location.pathname === link.path
                    ? "text-primary active"
                    : "text-foreground/80 hover:text-primary"
                    }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-[15px] px-5 py-2.5 bg-black border-[#FF0000] text-foreground hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all h-auto"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-black/95 border-2 border-[#FF0000] text-white backdrop-blur-md" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white font-display uppercase tracking-wider">{user.name || user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground w-full truncate font-display tracking-wider">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-primary/50" />
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer hover:bg-primary hover:text-white focus:bg-primary focus:text-white group transition-colors">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile?view=events")} className="cursor-pointer hover:bg-primary hover:text-white focus:bg-primary focus:text-white group transition-colors">
                      <Trophy className="mr-2 h-4 w-4" />
                      <span>My Events</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-primary/50" />
                        <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer hover:bg-primary hover:text-white focus:bg-primary focus:text-white group transition-colors">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-primary/50" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-primary hover:text-white focus:bg-primary focus:text-white text-red-500 group transition-colors">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="gap-2 text-[15px] px-5 py-2 bg-black border-[#FF0000] text-foreground hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all h-auto"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/signup")}
                    className="text-[15px] px-5 py-2 bg-black border-primary/100 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all h-auto"
                  >
                    Join Now
                  </Button>
                </>
              )}
            </div>

            {/* Mobile 3-line menu trigger */}
            <button
              type="button"
              className="md:hidden text-foreground p-1"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Open mobile actions"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 right-0 bg-[#050505] border-b-2 border-[#FF0000] z-50">
              <div className="w-full h-[2px] bg-[#FF0000]" />
              <div className="px-4 py-3 flex items-center gap-3">
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex-1 gap-2 border border-[#FF0000] text-white bg-black hover:bg-red-600 hover:text-white hover:border-[#FF0000] transition-all duration-300"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex-1 gap-2 border border-[#FF0000] text-white bg-black hover:bg-red-600 hover:text-white hover:border-[#FF0000] transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/login");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex-1 gap-2 border border-[#FF0000] text-white bg-black hover:bg-red-600 hover:text-white hover:border-[#FF0000] transition-all duration-300"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/signup");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex-1 border border-[#FF0000] text-white bg-black hover:bg-red-600 hover:text-white hover:border-[#FF0000] transition-all duration-300"
                    >
                      Signup
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Solid base so page content never shows behind mobile dock */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505] border-t-2 border-[#FF0000] z-40"
        style={{ height: "calc(env(safe-area-inset-bottom) + 6rem)" }}
      />

      {/* Mobile bottom dock navigation */}
      <div
        className="md:hidden fixed left-4 right-4 z-50 pointer-events-none"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <div className="pointer-events-auto rounded-3xl border border-[#FF0000]/90 bg-[#050505] p-2 shadow-[0_0_30px_rgba(255,0,0,0.12)]">
          <div className="grid grid-cols-5 gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 px-1 transition-all duration-300 ${isActive
                    ? "bg-[#FF0000] text-white shadow-[0_0_18px_rgba(255,0,0,0.4)]"
                    : "text-foreground/75"
                    }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="font-body text-[10px] leading-none tracking-wide whitespace-nowrap">
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
