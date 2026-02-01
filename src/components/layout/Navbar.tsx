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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-background/100 backdrop-blur-md border-b border-primary/100 shadow-lg shadow-primary/10"
          : isHomePage
            ? "bg-transparent"
            : "bg-background/100 backdrop-blur-md border-b border-primary/100"
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
            <span className="font-display font-bold text-2xl flame-text">
              KLU-Esports
            </span>
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
                <DropdownMenuContent className="w-56 bg-black/95 border-primary/50 text-white backdrop-blur-md" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white font-display uppercase tracking-wider">{user.username}</p>
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
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer hover:bg-primary hover:text-white focus:bg-primary focus:text-white group transition-colors">
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
            className="md:hidden text-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-primary/60 animate-slide-up">
            <div className="container px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`font-display text-lg uppercase tracking-wider py-2 text-center ${location.pathname === link.path
                    ? "text-primary"
                    : "text-foreground/80"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-primary/60 pt-4"></div>
              <div className="flex flex-col gap-2">
                {user ? (
                  <>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate("/admin");
                          setIsOpen(false);
                        }}
                        className="w-full gap-2 border-primary/50"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/profile");
                        setIsOpen(false);
                      }}
                      className="w-full gap-2 border-primary/50"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/profile");
                        setIsOpen(false);
                      }}
                      className="w-full gap-2 border-primary/50"
                    >
                      <Trophy className="w-4 h-4" />
                      My Events
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full gap-2 border-primary/50"
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
                        setIsOpen(false);
                      }}
                      className="w-full bg-black border-primary/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                    >
                      Login
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/signup");
                        setIsOpen(false);
                      }}
                      className="w-full bg-black border-primary/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                    >
                      Join Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
