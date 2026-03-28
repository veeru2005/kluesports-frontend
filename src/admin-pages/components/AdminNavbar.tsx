import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Shield, Users, Mail, User, LayoutDashboard, ClipboardList, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AdminNavbarProps {
    title: string;
    baseUrl: string; // e.g. "/admin/super" or "/admin/freefire"
    showMessages?: boolean;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export const AdminNavbar = ({ title, baseUrl, showMessages = false, activeTab, onTabChange }: AdminNavbarProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const adminNavLinks = [
        { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { key: "members", label: "Members", icon: Users },
        { key: "events", label: "Events", icon: Gamepad2 },
        { key: "registrations", label: "Regs", icon: ClipboardList },
        ...(user?.role === "super_admin" ? [{ key: "admins", label: "Admins", icon: Shield }] : []),
    ];

    useEffect(() => {
        document.body.classList.add("has-mobile-bottom-nav");
        return () => {
            document.body.classList.remove("has-mobile-bottom-nav");
        };
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname, location.search]);

    const handleLogout = async () => {
        await logout();
        toast({
            title: "Logged out",
            description: "You have been successfully logged out.",
            variant: "success",
        });
        navigate("/");
    };

    return (
        <>
            {/* Overlay to close menu when clicking outside */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-[#FF0000] shadow-lg shadow-primary/10 transition-all duration-300">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Left: Logo & Brand */}
                        <div className="flex items-center gap-3 group">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src="/KLU-Esports-Circle-Logo.png"
                                        alt="KLU-Esports"
                                        className="w-10 h-10 rounded-full border border-[#FF0000] drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-display font-bold text-2xl flame-text leading-none">
                                        KLU ESPORTS
                                    </span>
                                    <span className="text-xs text-white font-medium uppercase leading-tight tracking-[0.17em]">
                                        Gaming Community
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Center: Navigation Links (Desktop) */}
                        <div className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => onTabChange ? onTabChange("dashboard") : navigate(`${baseUrl}?tab=dashboard`)}
                                className={`nav-link font-display text-sm uppercase tracking-wider transition-colors flex items-center gap-1.5 ${activeTab === "dashboard" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                Dashboard
                            </button>

                            <button
                                onClick={() => onTabChange ? onTabChange("members") : navigate(`${baseUrl}?tab=members`)}
                                className={`nav-link font-display text-sm uppercase tracking-wider transition-colors flex items-center gap-1.5 ${activeTab === "members" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                            >
                                <Users className="w-3.5 h-3.5" />
                                Members
                            </button>

                            <button
                                onClick={() => onTabChange ? onTabChange("events") : navigate(`${baseUrl}?tab=events`)}
                                className={`nav-link font-display text-sm uppercase tracking-wider transition-colors flex items-center gap-1.5 ${activeTab === "events" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                            >
                                <Gamepad2 className="w-3.5 h-3.5" />
                                Events
                            </button>

                            <button
                                onClick={() => onTabChange ? onTabChange("registrations") : navigate(`${baseUrl}?tab=registrations`)}
                                className={`nav-link font-display text-sm uppercase tracking-wider transition-colors flex items-center gap-1.5 ${activeTab === "registrations" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                            >
                                <ClipboardList className="w-3.5 h-3.5" />
                                Registrations
                            </button>

                            {user?.role === 'super_admin' && (
                                <button
                                    onClick={() => onTabChange ? onTabChange("admins") : navigate(`${baseUrl}?tab=admins`)}
                                    className={`nav-link font-display text-sm uppercase tracking-wider transition-colors flex items-center gap-1.5 ${activeTab === "admins" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    Admins
                                </button>
                            )}

                            {(user?.role === 'super_admin' || user?.role?.startsWith('admin_')) && (
                                <button
                                    onClick={() => onTabChange ? onTabChange("messages") : navigate(`${baseUrl}?tab=messages`)}
                                    className={`nav-link font-display text-sm uppercase tracking-wider transition-colors flex items-center gap-1.5 ${activeTab === "messages" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    Messages
                                </button>
                            )}
                        </div>

                        {/* User Info & Actions (Desktop) */}
                        <div className="hidden md:flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/profile")}
                                className="gap-2 text-sm px-4 py-2 border border-[#FF0000] text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-[#FF0000] transition-all duration-300"
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="gap-2 text-sm px-4 py-2 border border-[#FF0000] text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-[#FF0000] transition-all duration-300"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-foreground hover:text-primary bg-transparent border border-red-600 hover:bg-transparent"
                            >
                                {isMobileMenuOpen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu Content */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-3 border-t-2 border-[#FF0000] bg-background animate-in slide-in-from-top-5 -mx-4 px-4">
                            <div className="flex flex-col gap-1 text-center">
                                {(user?.role === 'super_admin' || user?.role?.startsWith('admin_')) && (
                                    <button
                                        onClick={() => { onTabChange ? onTabChange("messages") : navigate(`${baseUrl}?tab=messages`); setIsMobileMenuOpen(false); }}
                                        className={`font-display text-lg uppercase tracking-wider py-3 mx-4 rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "messages" ? "text-white border-2 border-[#FF0000] bg-[#FF0000] shadow-[0_0_18px_rgba(255,0,0,0.35)]" : "text-foreground/80"}`}
                                    >
                                        <Mail className="w-4 h-4" />
                                        Messages
                                    </button>
                                )}
                                <div className="w-full h-px bg-[#FF0000] mt-2 -mx-4" style={{ width: 'calc(100% + 2rem)' }}></div>
                                <div className="flex flex-row gap-3 px-4 py-4 justify-center items-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false); }}
                                        className="flex-1 gap-2 border border-[#FF0000] text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-[#FF0000] transition-all duration-300"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleLogout}
                                        className="flex-1 gap-2 border border-[#FF0000] text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-[#FF0000] transition-all duration-300"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Solid base so page content never shows behind admin mobile dock */}
            <div
                className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505] border-t-2 border-[#FF0000] z-40"
                style={{ height: "calc(env(safe-area-inset-bottom) + 6.50rem)" }}
            />

            {/* Mobile bottom dock navigation for admin/super admin */}
            <div
                className="md:hidden fixed left-4 right-4 z-50 pointer-events-none"
                style={{ bottom: "calc(env(safe-area-inset-bottom) + 1.15rem)" }}
            >
                <div className="pointer-events-auto rounded-3xl border border-[#FF0000]/90 bg-[#050505] p-2 shadow-[0_0_30px_rgba(255,0,0,0.12)]">
                    <div
                        className="grid gap-1"
                        style={{ gridTemplateColumns: `repeat(${adminNavLinks.length}, minmax(0, 1fr))` }}
                    >
                        {adminNavLinks.map((link) => {
                            const isActive = activeTab === link.key;
                            const Icon = link.icon;

                            return (
                                <button
                                    key={link.key}
                                    type="button"
                                    onClick={() => onTabChange ? onTabChange(link.key) : navigate(`${baseUrl}?tab=${link.key}`)}
                                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 px-1 transition-all duration-300 ${isActive
                                        ? "bg-[#FF0000] text-white shadow-[0_0_18px_rgba(255,0,0,0.4)]"
                                        : "text-foreground/75"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-body text-[10px] leading-none tracking-wide whitespace-nowrap">
                                        {link.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};
