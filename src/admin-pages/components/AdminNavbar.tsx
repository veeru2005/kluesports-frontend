import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Shield, Users, Calendar, Mail, User } from "lucide-react";
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
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-red-600 shadow-lg shadow-primary/10 transition-all duration-300">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Left: Logo & Brand */}
                        <div className="flex items-center gap-3 group">
                            <div className="flex items-center gap-3">
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
                                    <span className="text-xs text-white font-medium uppercase leading-tight tracking-[0.16em]">
                                        Gaming Community
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Center: Navigation Links (Desktop) */}
                        <div className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => onTabChange ? onTabChange("dashboard") : navigate(`${baseUrl}?tab=dashboard`)}
                                className={`nav-link font-display text-lg uppercase tracking-wider transition-colors ${activeTab === "dashboard" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                            >
                                Dashboard
                            </button>

                            <button
                                onClick={() => onTabChange ? onTabChange("members") : navigate(`${baseUrl}?tab=members`)}
                                className={`nav-link font-display text-lg uppercase tracking-wider transition-colors ${activeTab === "members" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                            >
                                Members
                            </button>

                            <button
                                onClick={() => onTabChange ? onTabChange("events") : navigate(`${baseUrl}?tab=events`)}
                                className={`nav-link font-display text-lg uppercase tracking-wider transition-colors ${activeTab === "events" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                            >
                                Events
                            </button>

                            <button
                                onClick={() => onTabChange ? onTabChange("registrations") : navigate(`${baseUrl}?tab=registrations`)}
                                className={`nav-link font-display text-lg uppercase tracking-wider transition-colors ${activeTab === "registrations" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                            >
                                Registrations
                            </button>

                            {user?.role === 'super_admin' && (
                                <button
                                    onClick={() => onTabChange ? onTabChange("admins") : navigate(`${baseUrl}?tab=admins`)}
                                    className={`nav-link font-display text-lg uppercase tracking-wider transition-colors ${activeTab === "admins" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                                >
                                    Admins
                                </button>
                            )}

                            {(user?.role === 'super_admin' || user?.role?.startsWith('admin_')) && (
                                <button
                                    onClick={() => onTabChange ? onTabChange("messages") : navigate(`${baseUrl}?tab=messages`)}
                                    className={`nav-link font-display text-lg uppercase tracking-wider transition-colors ${activeTab === "messages" ? "text-primary active" : "text-foreground/80 hover:text-primary"}`}
                                >
                                    Messages
                                </button>
                            )}
                        </div>

                        {/* User Info & Actions (Desktop) */}
                        <div className="hidden md:flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="default"
                                onClick={() => navigate("/profile")}
                                className="gap-2 text-lg px-6 py-2 border border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                            >
                                <User className="w-5 h-5" />
                                Profile
                            </Button>
                            <Button
                                variant="outline"
                                size="default"
                                onClick={handleLogout}
                                className="gap-2 text-lg px-6 py-2 border border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                            >
                                <LogOut className="w-5 h-5" />
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
                        <div className="md:hidden py-3 border-t-2 border-red-600 bg-background animate-in slide-in-from-top-5 -mx-4 px-4">
                            <div className="flex flex-col gap-1 text-center">
                                <button
                                    onClick={() => { onTabChange ? onTabChange("dashboard") : navigate(`${baseUrl}?tab=dashboard`); setIsMobileMenuOpen(false); }}
                                    className={`font-display text-lg uppercase tracking-wider py-3 mx-4 rounded-lg transition-all ${activeTab === "dashboard" ? "text-primary border-2 border-red-600 bg-red-600/10" : "text-foreground/80"}`}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => { onTabChange ? onTabChange("members") : navigate(`${baseUrl}?tab=members`); setIsMobileMenuOpen(false); }}
                                    className={`font-display text-lg uppercase tracking-wider py-3 mx-4 rounded-lg transition-all ${activeTab === "members" ? "text-primary border-2 border-red-600 bg-red-600/10" : "text-foreground/80"}`}
                                >
                                    Members
                                </button>
                                <button
                                    onClick={() => { onTabChange ? onTabChange("events") : navigate(`${baseUrl}?tab=events`); setIsMobileMenuOpen(false); }}
                                    className={`font-display text-lg uppercase tracking-wider py-3 mx-4 rounded-lg transition-all ${activeTab === "events" ? "text-primary border-2 border-red-600 bg-red-600/10" : "text-foreground/80"}`}
                                >
                                    Events
                                </button>
                                <button
                                    onClick={() => { onTabChange ? onTabChange("registrations") : navigate(`${baseUrl}?tab=registrations`); setIsMobileMenuOpen(false); }}
                                    className={`font-display text-lg uppercase tracking-wider py-3 mx-4 rounded-lg transition-all ${activeTab === "registrations" ? "text-primary border-2 border-red-600 bg-red-600/10" : "text-foreground/80"}`}
                                >
                                    Registrations
                                </button>
                                {user?.role === 'super_admin' && (
                                    <button
                                        onClick={() => { onTabChange ? onTabChange("admins") : navigate(`${baseUrl}?tab=admins`); setIsMobileMenuOpen(false); }}
                                        className={`font-display text-lg uppercase tracking-wider py-3 mx-4 rounded-lg transition-all ${activeTab === "admins" ? "text-primary border-2 border-red-600 bg-red-600/10" : "text-foreground/80"}`}
                                    >
                                        Admins
                                    </button>
                                )}
                                {(user?.role === 'super_admin' || user?.role?.startsWith('admin_')) && (
                                    <button
                                        onClick={() => { onTabChange ? onTabChange("messages") : navigate(`${baseUrl}?tab=messages`); setIsMobileMenuOpen(false); }}
                                        className={`font-display text-lg uppercase tracking-wider py-3 mx-4 rounded-lg transition-all ${activeTab === "messages" ? "text-primary border-2 border-red-600 bg-red-600/10" : "text-foreground/80"}`}
                                    >
                                        Messages
                                    </button>
                                )}
                                <div className="w-full h-px bg-red-600 mt-2 -mx-4" style={{ width: 'calc(100% + 2rem)' }}></div>
                                <div className="flex flex-row gap-3 px-4 py-4 justify-center items-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false); }}
                                        className="flex-1 gap-2 border border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleLogout}
                                        className="flex-1 gap-2 border border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
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
        </>
    );
};
