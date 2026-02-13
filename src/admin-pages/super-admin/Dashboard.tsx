import { useState, useEffect, useMemo } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { AdminNavbar } from "../components/AdminNavbar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Calendar, Users, Mail, Shield, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import RegistrationsPanel from "../components/RegistrationsPanel";

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [gameFilter, setGameFilter] = useState("all");
    const [dayFilter, setDayFilter] = useState<string>("");
    const [monthFilter, setMonthFilter] = useState<string>("");
    const [yearFilter, setYearFilter] = useState<string>("");
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);





    // Delete message handler
    const handleDeleteMessage = async () => {
        if (!messageToDelete) return;

        setDeletingMessageId(messageToDelete);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/${messageToDelete}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (!response.ok) throw new Error("Failed to delete message");

            queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
            toast({
                title: "Message deleted",
                description: "The message has been successfully deleted.",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete message. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDeletingMessageId(null);
            setMessageToDelete(null);
        }
    };

    // Initialize activeTab from URL query parameter
    const getInitialTab = () => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get("tab");
        if (tabParam && ["dashboard", "members", "events", "admins", "messages", "registrations"].includes(tabParam)) {
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
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch members");
            return response.json();
        },
    });

    const { data: events } = useQuery({
        queryKey: ["admin-events"],
        queryFn: async () => {
            const [eventsRes, summaryRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events`, {
                    headers: getHeaders()
                }),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/registrations/all-summary`)
            ]);

            if (!eventsRes.ok) throw new Error("Failed to fetch events");
            const events = await eventsRes.json();
            let summaries = [];
            if (summaryRes.ok) {
                summaries = await summaryRes.json();
            }

            return events.map((event: any) => {
                const eventId = event._id?.toString() || event._id;
                const summary = summaries.find((s: any) => {
                    const summaryId = s._id?.toString() || s._id;
                    return summaryId === eventId;
                });
                return {
                    ...event,
                    registrationCount: summary ? summary.count : 0
                };
            });
        },
    });

    const { data: messages } = useQuery({
        queryKey: ["admin-messages"],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch messages");
            return response.json();
        },
    });

    const { data: admins } = useQuery({
        queryKey: ["admin-admins"],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/admins`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch admins");
            return response.json();
        },
    });

    const filteredMembers = members?.filter((m: any) => {
        // Exclude all admins and super admins from members stats
        if (m.role && (m.role === 'super_admin' || m.role.startsWith('admin_'))) return false;

        if (gameFilter === "all") return true;
        return m.game === gameFilter || m.gameYouPlay === gameFilter;
    });

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
        if (tabParam && ["dashboard", "members", "events", "admins", "messages", "registrations"].includes(tabParam)) {
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
                            <div className="flex flex-col items-center justify-start md:justify-center min-h-[calc(100vh-5rem)] text-center relative overflow-hidden w-full glass-dark border-none rounded-none pt-16 md:pt-6 pb-24 md:pb-8">
                                {/* Background glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial-gradient from-primary/10 to-transparent pointer-events-none" />

                                <div
                                    className="relative z-10 space-y-4 md:space-y-8 px-4"
                                >
                                    <div className="inline-block px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-red-600 bg-black backdrop-blur-sm transition-all duration-300 hover:bg-red-600 group cursor-default">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:text-white transition-colors" />
                                            <span className="text-white text-xs md:text-base font-medium tracking-widest uppercase group-hover:text-white transition-colors">Super Admin Dashboard</span>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <h1 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight uppercase leading-none mb-2 md:mb-4 text-white">
                                            WELCOME BACK
                                        </h1>

                                        <h2 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight uppercase leading-none drop-shadow-[0_0_30px_rgba(220,38,38,0.6)] relative">
                                            <span className="flame-text">{user?.name || user?.username || user?.email?.split('@')[0] || 'Super Admin'}</span>
                                        </h2>
                                    </div>

                                    <p className="text-sm md:text-xl lg:text-2xl text-muted-foreground font-body max-w-3xl mx-auto leading-relaxed drop-shadow-lg px-2">
                                        Manage the entire KLU ESPORTS platform, oversee all games, events, and administrators in one place.
                                    </p>

                                    <div
                                        className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 pt-4 md:pt-8 max-w-5xl mx-auto w-full"
                                    >
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

                                        {/* Total Messages Box */}
                                        <div className="bg-transparent border-2 border-red-600 rounded-xl hover:border-red-500 transition-all overflow-hidden">
                                            <div className="bg-black p-4 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-3">
                                                <Mail className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary" />
                                                <div className="text-center">
                                                    <div className="font-display font-bold text-xl md:text-2xl lg:text-3xl text-primary">
                                                        {messages?.length || 0}
                                                    </div>
                                                    <div className="text-xs md:text-sm text-muted-foreground font-body uppercase tracking-wider">
                                                        Total Messages
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
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-4 sm:px-4 md:px-8 pt-1 sm:pt-2 md:pt-8 pb-24 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    <MembersTab members={filteredMembers || []} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Events Tab */}
                        <TabsContent value="events" className="m-0 p-0 border-none outline-none">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-4 sm:px-4 md:px-8 pt-6 md:pt-8 pb-24 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    <EventsTab events={filteredEvents || []} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Registrations Tab */}
                        <TabsContent value="registrations" className="m-0 p-0 border-none outline-none">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-4 sm:px-4 md:px-8 pt-6 md:pt-8 pb-24 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    <RegistrationsPanel game="All" isSuperAdmin={true} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Admins Tab */}
                        <TabsContent value="admins" className="m-0 p-0 border-none outline-none">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-4 sm:px-4 md:px-8 pt-6 md:pt-8 pb-24 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    <AdminsTab admins={admins || []} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Messages Tab */}
                        <TabsContent value="messages" className="m-0 p-0 border-none outline-none">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-4 sm:px-4 md:px-8 pt-6 md:pt-8 pb-24 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    {/* Date Filter */}
                                    <div className="flex flex-row justify-between items-center mb-6 gap-2 md:gap-4">
                                        <div className="flex items-center gap-3">
                                            <h2 className="font-display font-semibold text-xl md:text-3xl">Messages</h2>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 md:gap-3 overflow-x-auto scrollbar-hide min-w-0">
                                            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" />

                                            {/* Day Select */}
                                            <Select value={dayFilter} onValueChange={setDayFilter}>
                                                <SelectTrigger className="w-[65px] md:w-[80px] bg-black border-2 border-red-600 text-white rounded-lg hover:bg-red-600/10 transition-all text-[11px] md:text-sm h-9 md:h-11 flex-shrink-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                                                    <SelectValue placeholder="Day" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-black border-2 border-red-600 rounded-lg max-h-[200px]">
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                        <SelectItem key={day} value={String(day).padStart(2, '0')} className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white text-xs md:text-sm cursor-pointer rounded-md m-1">
                                                            {day}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* Month Select */}
                                            <Select value={monthFilter} onValueChange={setMonthFilter}>
                                                <SelectTrigger className="w-[90px] md:w-[130px] bg-black border-2 border-red-600 text-white rounded-lg hover:bg-red-600/10 transition-all text-[11px] md:text-sm h-9 md:h-11 flex-shrink-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                                                    <SelectValue placeholder="Month" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                                    {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((m, idx) => (
                                                        <SelectItem key={m} value={m} className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white text-xs md:text-sm cursor-pointer rounded-md m-1">
                                                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][idx]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* Year Select */}
                                            <Select value={yearFilter} onValueChange={setYearFilter}>
                                                <SelectTrigger className="w-[75px] md:w-[100px] bg-black border-2 border-red-600 text-white rounded-lg hover:bg-red-600/10 transition-all text-[11px] md:text-sm h-9 md:h-11 flex-shrink-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                                                    <SelectValue placeholder="Year" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                                    {["2024", "2025", "2026", "2027", "2028"].map((year) => (
                                                        <SelectItem key={year} value={year} className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white text-xs md:text-sm cursor-pointer rounded-md m-1">
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {(dayFilter || monthFilter || yearFilter) && (
                                                <button
                                                    onClick={() => {
                                                        setDayFilter("");
                                                        setMonthFilter("");
                                                        setYearFilter("");
                                                    }}
                                                    className="flex items-center justify-center p-2 text-red-500 hover:text-red-400 transition-colors flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                    >
                                        {messages?.filter((msg: any) => {
                                            if (!dayFilter && !monthFilter && !yearFilter) return true;
                                            const msgDate = new Date(msg.createdAt);
                                            const msgDay = String(msgDate.getDate()).padStart(2, '0');
                                            const msgMonth = String(msgDate.getMonth() + 1).padStart(2, '0');
                                            const msgYear = String(msgDate.getFullYear());

                                            // Day, Month and Year filters
                                            const dayMatch = !dayFilter || msgDay === dayFilter;
                                            const monthMatch = !monthFilter || msgMonth === monthFilter;
                                            const yearMatch = !yearFilter || msgYear === yearFilter;

                                            return dayMatch && monthMatch && yearMatch;
                                        }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                            .map((msg: any) => (
                                                <div
                                                    key={msg._id || msg.id}
                                                    className="bg-black rounded-xl p-4 md:p-6 border-2 border-red-600 hover:border-red-500 transition-all flex flex-col"
                                                >
                                                    {/* Date and Delete at top */}
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-xs text-white bg-red-600 px-3 py-1.5 rounded font-medium">
                                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setMessageToDelete(msg._id || msg.id)}
                                                            disabled={deletingMessageId === (msg._id || msg.id)}
                                                            className="gap-1 border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </Button>
                                                    </div>

                                                    {/* Sender info */}
                                                    <div className="space-y-1 mb-4">
                                                        <p className="text-sm text-white">
                                                            <span className="text-red-500 font-semibold">From:</span> {msg.name}
                                                        </p>
                                                        <p className="text-sm text-white">
                                                            <span className="text-red-500 font-semibold">Email:</span> {msg.email}
                                                        </p>
                                                    </div>

                                                    {/* Message content */}
                                                    <div className="border-t border-red-600 pt-4 space-y-3 flex-1">
                                                        <div>
                                                            <p className="text-xs text-red-500 font-semibold uppercase tracking-wider mb-1">Subject</p>
                                                            <h3 className="font-display font-semibold text-lg text-white">
                                                                {msg.subject || "No Subject"}
                                                            </h3>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-red-500 font-semibold uppercase tracking-wider mb-1">Message</p>
                                                            <p className="text-sm text-foreground whitespace-pre-wrap">{msg.message}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        {(!messages || messages.length === 0) && (
                                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-red-600 rounded-2xl bg-black/40 w-full relative overflow-hidden group mt-10 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                                                <div className="absolute inset-0 bg-gradient-to-b from-red-600/[0.05] to-transparent pointer-events-none" />
                                                <div className="relative">
                                                    <Mail className="w-16 h-16 text-red-500 mb-4" style={{ filter: 'drop-shadow(0 0 18px rgba(220, 38, 38, 0.5))' }} />
                                                </div>
                                                <p className="text-xl font-display font-black uppercase tracking-[0.2em] text-white mb-2">No Messages Found</p>
                                                <p className="text-[11px] text-white/40 font-display mb-8 tracking-widest uppercase max-w-xs mx-auto leading-relaxed">
                                                    Your communication hub is currently empty. Direct inquiries from community members will appear here once they start reaching out.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
                <AlertDialogContent className="bg-black border-2 border-red-600 w-[90%] max-w-md mx-auto rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white font-display text-xl">Delete Message</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete this message? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row gap-2 justify-between sm:justify-between">
                        <AlertDialogCancel className="border border-red-600 bg-transparent text-white hover:bg-red-600 hover:text-white transition-all duration-300 mt-0">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteMessage}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SuperAdminDashboard;
