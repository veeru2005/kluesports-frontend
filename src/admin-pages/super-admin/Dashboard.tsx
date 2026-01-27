import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminNavbar } from "../components/AdminNavbar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Calendar, Users, Mail, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { mockEvents, mockMembers, mockMessages } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MembersTab } from "./MembersTab";
import { EventsTab } from "./EventsTab";
import { AdminsTab } from "./AdminsTab";

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [gameFilter, setGameFilter] = useState("all");

    // Initialize activeTab from URL query parameter
    const getInitialTab = () => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get("tab");
        if (tabParam && ["dashboard", "members", "events", "admins", "messages"].includes(tabParam)) {
            return tabParam;
        }
        return "dashboard";
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    // Helper to get headers
    const getHeaders = () => {
        const token = localStorage.getItem("inferno_token");
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const { data: members } = useQuery({
        queryKey: ["admin-members"],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch members");
            return response.json();
        },
    });

    const { data: events } = useQuery({
        queryKey: ["admin-events"],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch events");
            return response.json();
        },
    });

    const { data: messages } = useQuery({
        queryKey: ["admin-messages"],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/messages`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch messages");
            return response.json();
        },
    });

    const { data: admins } = useQuery({
        queryKey: ["admin-admins"],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/admins`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch admins");
            return response.json();
        },
    });

    const filteredMembers = members?.filter(
        (m) => gameFilter === "all" || m.game === gameFilter
    );

    const filteredEvents = events?.filter(
        (e) => gameFilter === "all" || e.game === gameFilter
    );

    // Handle tab change and update URL
    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        navigate(`/admin/super?tab=${newTab}`, { replace: true });
    };

    // Update activeTab when URL changes (for browser back/forward and refresh)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get("tab");
        if (tabParam && ["dashboard", "members", "events", "admins", "messages"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [location.search]);

    return (
        <div className="min-h-screen bg-background">
            <AdminNavbar
                title="Super Admin Panel"
                baseUrl="/admin/super"
                showMessages={true}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
            <main className="pt-20">
                <div className="w-full">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        {/* Dashboard Tab Content - Hero Section */}
                        <TabsContent value="dashboard" className="m-0 p-0 border-none outline-none">
                            <div className="flex flex-col items-center justify-start md:justify-center min-h-[calc(100vh-5rem)] text-center relative overflow-hidden w-full glass-dark border-none rounded-none pt-16 md:pt-6">
                                {/* Background glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial-gradient from-primary/10 to-transparent pointer-events-none" />

                                <div className="relative z-10 space-y-4 md:space-y-8 animate-fade-in-up px-4">
                                    <div className="inline-block px-4 md:px-6 py-2 md:py-3 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                            <span className="text-red-200 text-xs md:text-base font-medium tracking-widest uppercase">Super Admin Dashboard</span>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-8xl tracking-tight uppercase leading-none mb-2 md:mb-4 text-white">
                                            WELCOME BACK
                                        </h1>

                                        <h2 className="font-display font-bold text-3xl md:text-5xl lg:text-7xl tracking-tight uppercase leading-none drop-shadow-[0_0_30px_rgba(220,38,38,0.6)] relative">
                                            <span className="flame-text">{user?.username || user?.email?.split('@')[0] || 'Super Admin'}</span>
                                        </h2>
                                    </div>

                                    <p className="text-sm md:text-xl lg:text-2xl text-muted-foreground font-body max-w-3xl mx-auto leading-relaxed drop-shadow-lg px-2">
                                        Manage the entire KLU-Esports platform, oversee all games, events, and administrators in one place.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-8 max-w-4xl mx-auto w-full">
                                        {/* Total Members Box */}
                                        <div className="bg-transparent border-2 border-red-600 rounded-xl hover:border-red-500 transition-all overflow-hidden">
                                            <div className="bg-black p-4 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-3">
                                            <Users className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary" />
                                            <div className="text-center">
                                                <div className="font-display font-bold text-xl md:text-2xl lg:text-3xl text-primary">
                                                    {filteredMembers?.length || 0}
                                                </div>
                                                <div className="text-xs md:text-sm text-muted-foreground font-body uppercase tracking-wider">
                                                    Total Members
                                                </div>
                                            </div>
                                            </div>
                                        </div>

                                        {/* Total Events Box */}
                                        <div className="bg-transparent border-2 border-red-600 rounded-xl hover:border-red-500 transition-all overflow-hidden">
                                            <div className="bg-black p-4 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-3">
                                            <Calendar className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary" />
                                            <div className="text-center">
                                                <div className="font-display font-bold text-xl md:text-2xl lg:text-3xl text-primary">
                                                    {filteredEvents?.length || 0}
                                                </div>
                                                <div className="text-xs md:text-sm text-muted-foreground font-body uppercase tracking-wider">
                                                    Total Events
                                                </div>
                                            </div>
                                            </div>
                                        </div>

                                        {/* Total Admins Box */}
                                        <div className="bg-transparent border-2 border-red-600 rounded-xl hover:border-red-500 transition-all overflow-hidden">
                                            <div className="bg-black p-4 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-3">
                                            <Shield className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary" />
                                            <div className="text-center">
                                                <div className="font-display font-bold text-xl md:text-2xl lg:text-3xl text-primary">
                                                    {admins?.length || 0}
                                                </div>
                                                <div className="text-xs md:text-sm text-muted-foreground font-body uppercase tracking-wider">
                                                    Total Admins
                                                </div>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Members Tab */}
                        <TabsContent value="members" className="m-0 p-0 border-none outline-none">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-4 sm:px-4 md:px-8 pt-1 sm:pt-2 md:pt-8 pb-6 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    <MembersTab members={filteredMembers || []} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Events Tab */}
                        <TabsContent value="events" className="m-0 p-0 border-none outline-none">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-4 sm:px-4 md:px-8 pt-6 md:pt-8 pb-6 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    <EventsTab events={filteredEvents || []} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Admins Tab */}
                        <TabsContent value="admins" className="m-0 p-0 border-none outline-none">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-4 sm:px-4 md:px-8 pt-6 md:pt-8 pb-6 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    <AdminsTab admins={admins || []} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Messages Tab */}
                        <TabsContent value="messages" className="m-0 p-0 border-none outline-none">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-4 sm:px-4 md:px-8 pt-6 md:pt-8 pb-6 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    <div className="grid gap-4">
                                        {messages?.map((msg: any) => (
                                            <div
                                                key={msg.id}
                                                className="glass-dark rounded-xl p-6 border border-border"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-display font-semibold text-lg">
                                                        {msg.subject || "No Subject"}
                                                    </h3>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(msg.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground mb-4">{msg.message}</p>
                                                <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-4">
                                                    <span>From: {msg.name} ({msg.email})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;
