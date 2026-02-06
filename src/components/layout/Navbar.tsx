import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut, User, Shield, Settings, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Team", path: "/team" },
  { name: "Events", path: "/events" },
  { name: "Contact", path: "/contact" },
];

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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
      {/* Overlay to close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isOpen
          ? "bg-background border-b-2 border-red-600 shadow-lg shadow-primary/10"
          : isHomePage
            ? "bg-transparent"
            : "bg-background border-b-2 border-red-600"
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
                  className="w-10 h-10 rounded-full border border-primary/50 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-2xl flame-text leading-none">
                  KLU ESPORTS
                </span>
                <span className="text-sm text-white font-medium uppercase leading-tight tracking-[0.06em]">
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
                  className={`nav-link font-display text-lg uppercase tracking-wider transition-colors ${location.pathname === link.path
                    ? "text-primary active"
                    : "text-foreground/80 hover:text-primary"
                    }`}
                >
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
                      size="default"
                      className="gap-2 text-lg px-6 py-2 bg-black border-primary text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                    >
                      <User className="w-5 h-5" />
                      Profile
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-black/95 border-2 border-red-600 text-white backdrop-blur-md" align="end" forceMount>
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
                    size="default"
                    onClick={() => navigate("/login")}
                    className="gap-2 text-lg px-6 py-2 h-auto bg-black border-primary/100 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    <LogIn className="w-5 h-5" />
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => navigate("/signup")}
                    className="text-lg px-6 py-2 h-auto bg-black border-primary/100 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    Join Now
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground p-2 bg-transparent border-2 border-red-600 rounded-lg"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b-2 border-red-600 animate-slide-down">
              {/* Red separator line */}
              <div className="w-full h-[2px] bg-red-600"></div>
              <div className="container px-4 py-3 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`font-display text-lg uppercase tracking-wider py-3 text-center rounded-lg transition-all ${location.pathname === link.path
                      ? "text-primary border-2 border-red-600 bg-red-600/10"
                      : "text-foreground/80 hover:text-primary"
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-1">
                  {user ? (
                    <>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            navigate("/admin");
                            setIsOpen(false);
                          }}
                          className="font-display text-lg uppercase tracking-wider py-3 mx-0 rounded-lg transition-all text-foreground/80 hover:text-primary text-center"
                        >
                          Admin Panel
                        </button>
                      )}
                      <div className="w-full h-px bg-red-600 mt-2"></div>
                      <div className="flex flex-row gap-3 px-0 py-4 justify-center items-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigate("/profile");
                            setIsOpen(false);
                          }}
                          className="flex-1 gap-2 border border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="flex-1 gap-2 border border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-px bg-red-600 mt-2"></div>
                      <div className="flex flex-row gap-3 px-0 py-4 justify-center items-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigate("/login");
                            setIsOpen(false);
                          }}
                          className="flex-1 gap-2 border border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                        >
                          <LogIn className="w-4 h-4" />
                          Login
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigate("/signup");
                            setIsOpen(false);
                          }}
                          className="flex-1 gap-2 border border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                        >
                          Join Now
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
