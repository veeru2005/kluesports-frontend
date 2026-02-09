import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminNavbar } from "./AdminNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Plus, Trash2, Shield, Eye, Edit, Search, X, Upload, Clock, MapPin, Mail, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockEvents, mockMembers } from "@/lib/mock-data";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import api from "@/utils/apiClient";
import RegistrationsPanel from "./RegistrationsPanel";

interface GameAdminPanelProps {
    game: "Free Fire" | "BGMI" | "Valorant" | "Call Of Duty";
    title: string;
}

export const GameAdminPanel = ({ game, title }: GameAdminPanelProps) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [eventDialogOpen, setEventDialogOpen] = useState(false);

    // Initialize activeTab from URL query parameter to avoid flickering
    const getInitialTab = () => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get("tab");
        if (tabParam && ["dashboard", "members", "events", "messages", "registrations"].includes(tabParam)) {
            return tabParam;
        }
        return "dashboard";
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [viewMember, setViewMember] = useState<any>(null);
    const [editMember, setEditMember] = useState<any>(null);
    const [deletingMember, setDeletingMember] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [gameFilter, setGameFilter] = useState("all");
    const [dayFilter, setDayFilter] = useState<string>("");
    const [monthFilter, setMonthFilter] = useState<string>("");
    const [yearFilter, setYearFilter] = useState<string>("");
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
    const [newEvent, setNewEvent] = useState({
        id: "",
        title: "",
        description: "",
        event_date: "",
        end_time: "",
        location: "",
        max_participants: "",
        image_url: "",
        is_registration_open: true,
    });
    const [eventToDelete, setEventToDelete] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [togglingEvents, setTogglingEvents] = useState<Set<string>>(new Set());
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Helper to get headers
    const getHeaders = () => {
        const token = localStorage.getItem("inferno_token");
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const handleToggleRegistration = async (event: any) => {
        const eventId = event.id || event._id;
        if (!eventId) return;

        setTogglingEvents(prev => new Set(prev).add(eventId));

        try {
            const token = localStorage.getItem("inferno_token");
            const newStatus = event.is_registration_open === false ? true : false;

            // Using direct fetch to avoid triggering createEventMutation's onSuccess (which closes dialogs/shows generic toast)
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/events/${eventId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        is_registration_open: newStatus,
                        game: event.game // Ensure game is preserved if required by backend validation
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to update registration status");

            toast({
                title: newStatus ? "Opened" : "Closed",
                description: `Event has ${newStatus ? 'opened' : 'closed'}`,
                variant: newStatus ? "success" : "default",
                className: !newStatus ? "bg-neutral-900 border-neutral-800 text-white" : undefined
            });

            queryClient.invalidateQueries({ queryKey: ["admin-events"] });
        } catch (error) {
            console.error("Failed to toggle registration", error);
            toast({
                title: "Error",
                description: "Failed to update registration status",
                variant: "destructive",
            });
        } finally {
            setTogglingEvents(prev => {
                const next = new Set(prev);
                next.delete(eventId);
                return next;
            });
        }
    };

    // Helper function to format date for editing (YYYY-MM-DDThh:mm format)
    const formatDateForEditing = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const { data: members, error: membersError } = useQuery({
        queryKey: ["admin-members"],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
                headers: getHeaders()
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to fetch members");
            }
            return response.json();
        },
    });

    const { data: events, error: eventsError } = useQuery({
        queryKey: ["admin-events"],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events`, {
                headers: getHeaders()
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to fetch events");
            }
            return response.json();
        },
    });

    const { data: messages, error: messagesError } = useQuery({
        queryKey: ["admin-messages"],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/messages`, {
                headers: getHeaders()
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to fetch messages");
            }
            return response.json();
        },
    });

    const filteredMembers = (members?.filter((m: any) => {
        // Exclude current user
        if (m.email === user?.email || m.id === user?.id) return false;

        // Exclude all admins and super admins from members tab
        if (m.role && (m.role === 'super_admin' || m.role.startsWith('admin_'))) return false;

        // For game admins, only show members of their specific game
        const matchesGame = m.game === game || m.gameYouPlay === game;

        const matchesSearch = searchQuery === "" ||
            m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesGame && matchesSearch;
    }) || []).sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
        return dateB - dateA;
    });

    const filteredEvents = (events?.filter((e: any) => {
        return gameFilter === "all" ? e.game === game : e.game === gameFilter;
    }) || []).sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.created_at || a.event_date).getTime();
        const dateB = new Date(b.createdAt || b.created_at || b.event_date).getTime();
        return dateB - dateA;
    });

    const createEventMutation = useMutation({
        mutationFn: async (eventData: typeof newEvent & { game: string }) => {
            const payload = { ...eventData, end_time: eventData.end_time || null };
            const url = eventData.id
                ? `${import.meta.env.VITE_API_BASE_URL}/events/${eventData.id}`
                : `${import.meta.env.VITE_API_BASE_URL}/events`;
            const method = eventData.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(eventData.id ? "Failed to update event" : "Failed to create event");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-events"] });
            toast({ title: "Success", description: "Event saved successfully!", variant: "success" });
            setEventDialogOpen(false);
            setNewEvent({
                id: "",
                title: "",
                description: "",
                event_date: "",
                end_time: "",
                location: "",
                max_participants: "",
                image_url: "",
                is_registration_open: true,
            });
        },
    });

    const deleteEventMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error("Failed to delete event");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-events"] });
            toast({ title: "Success", description: "Event deleted successfully!", variant: "success" });
            setEventToDelete(null);
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
        },
    });

    const handleDeleteMember = async () => {
        if (!deletingMember) return;
        try {
            const token = localStorage.getItem("inferno_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/users/${deletingMember.id || deletingMember._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to delete member");

            toast({
                title: "Success",
                description: "Member deleted successfully",
                variant: "success",
            });

            queryClient.invalidateQueries({ queryKey: ["admin-members"] });
            setDeletingMember(null);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete member",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (newEvent.end_time) {
            const start = new Date(newEvent.event_date);
            const end = new Date(newEvent.end_time);
            if (end <= start) {
                toast({
                    title: "Invalid Time",
                    description: "End time must be after start time.",
                    variant: "destructive"
                });
                return;
            }
        }

        createEventMutation.mutate({ ...newEvent, game });
    };

    const getBaseUrl = (g: string) => {
        if (g === "Free Fire") return "/admin/freefire";
        if (g === "BGMI") return "/admin/bgmi";
        if (g === "Call Of Duty") return "/admin/call-of-duty";
        return "/admin/valorant";
    }

    // Handle tab change and update URL
    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        const baseUrl = getBaseUrl(game);
        navigate(`${baseUrl}?tab=${newTab}`, { replace: true });
    };

    // Update activeTab when URL changes (for browser back/forward)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get("tab");
        if (tabParam && ["dashboard", "members", "events", "messages"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [location.search]);

    return (
        <div className="min-h-screen bg-background">
            <AdminNavbar
                title={title}
                baseUrl={getBaseUrl(game)}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
            <main className="pt-20">
                <div className="w-full">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        {/* Dashboard Tab Content - Hero Section */}
                        <TabsContent value="dashboard" className="m-0 p-0 border-none outline-none">
                            <div className="flex flex-col items-center justify-start md:justify-center min-h-[calc(100vh-5rem)] text-center relative overflow-hidden w-full glass-dark border-none rounded-none pt-8 md:pt-0 pb-24 md:pb-8">
                                {/* Background glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial-gradient from-primary/10 to-transparent pointer-events-none" />

                                <div
                                    className="relative z-10 space-y-4 md:space-y-8 px-4"
                                >
                                    <div className="inline-block px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-red-600 bg-black backdrop-blur-sm transition-all duration-300 hover:bg-red-600 group cursor-default">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:text-white transition-colors" />
                                            <span className="text-white text-xs md:text-base font-medium tracking-widest uppercase transition-colors"><span className="text-red-500 font-bold group-hover:text-white transition-colors">{game}</span> Admin Dashboard</span>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <h1 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight uppercase leading-none mb-2 md:mb-4 text-white">
                                            WELCOME BACK
                                        </h1>

                                        <h2 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight uppercase leading-none drop-shadow-[0_0_30px_rgba(220,38,38,0.6)] relative">
                                            <span className="flame-text">{user?.name || user?.username || user?.email?.split('@')[0] || 'Admin'}</span>
                                        </h2>
                                    </div>

                                    <p className="text-sm md:text-xl lg:text-2xl text-muted-foreground font-body max-w-3xl mx-auto leading-relaxed drop-shadow-lg px-2">
                                        Manage your <span className="text-red-500 font-bold">{game}</span> community, oversee events, and track member engagement all in one place.
                                    </p>

                                    <div
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-8 max-w-5xl mx-auto w-full"
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
                        <TabsContent value="members" className="m-0 p-0 border-none outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-3 sm:px-4 md:px-8 pt-3 sm:pt-4 md:pt-8 pb-24 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                        <h2 className="font-display font-semibold text-2xl">
                                            {game} Members
                                        </h2>
                                        <div className="flex gap-3 items-center flex-wrap w-full md:w-auto">
                                            <div className="relative w-full md:w-[400px]">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                                <Input
                                                    placeholder="Search members..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-9 w-full bg-black border-2 border-red-600 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-[0_0_10px_rgba(220,38,38,0.1)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
                                    >
                                        {filteredMembers?.map((member: any) => (
                                            <div
                                                key={member.id}
                                                className="bg-black/80 backdrop-blur-sm rounded-xl border-2 border-red-600 flex flex-col hover:border-red-500 transition-all overflow-hidden group"
                                            >
                                                <div className="p-2.5 md:p-6 flex flex-col items-center justify-center text-center gap-5 md:gap-3 bg-black">
                                                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-red-600/20 flex items-center justify-center ring-2 ring-red-600/30">
                                                        <span className="font-display font-bold text-lg md:text-3xl text-red-500">
                                                            {(member.full_name || member.name || member.username || "U").charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-0.5 md:space-y-2 w-full flex flex-col items-center">
                                                        <h3 className="font-display font-bold text-sm md:text-xl text-foreground truncate w-full text-center">
                                                            {member.full_name || member.name || "Unknown Name"}
                                                        </h3>
                                                        <p className="text-red-500 font-medium text-[11px] md:text-sm truncate w-full text-center">
                                                            {member.email || "user@example.com"}
                                                        </p>
                                                        {member.collegeId && (
                                                            <p className="text-white text-[10px] md:text-sm font-display font-bold bg-red-600/10 py-1 px-4 md:px-6 rounded-md border border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.1)] tracking-widest mt-1.5">
                                                                {member.collegeId}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-auto flex gap-2 md:gap-4 p-2 md:p-4 border-t border-red-600/30 bg-black">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditMember({
                                                            ...member,
                                                            name: member.full_name || member.name || '',
                                                            mobile: member.mobile || '',
                                                            collegeId: member.collegeId || '',
                                                            email: member.email || '',
                                                            inGameName: member.inGameName || '',
                                                            bio: member.bio || '',
                                                            gameYouPlay: member.gameYouPlay || member.game || '',
                                                            createdAt: member.createdAt || member.created_at || ''
                                                        })}
                                                        className="flex-1 h-9 md:h-10 px-2 md:px-4 text-[11px] md:text-sm border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                                                    >
                                                        <span className="action-swap">
                                                            <span className="action-swap-item action-swap-a">
                                                                <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                <span>View</span>
                                                            </span>
                                                            <span className="action-swap-item action-swap-b">
                                                                <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                <span>Edit</span>
                                                            </span>
                                                        </span>
                                                    </Button>
                                                    {user?.role === 'super_admin' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setDeletingMember(member)}
                                                            className="flex-1 h-9 md:h-10 px-2 md:px-4 gap-1 md:gap-2 text-[11px] md:text-sm bg-red-600 hover:bg-red-700 text-white border-0 transition-all duration-300"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                            <span>Delete</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* View Member Dialog */}
                                        <Dialog open={!!viewMember} onOpenChange={(o) => !o && setViewMember(null)}>
                                            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-[95vw] sm:max-w-[500px] bg-black border-2 border-red-600 rounded-xl overflow-y-auto max-h-[90vh]">
                                                <DialogHeader>
                                                    <DialogTitle className="font-display text-2xl">Member Details</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                                            <span className="font-display font-bold text-2xl text-primary">
                                                                {(viewMember?.full_name || viewMember?.name || viewMember?.username || "U").charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold">{viewMember?.full_name || viewMember?.name}</h3>
                                                            <p className="text-muted-foreground">@{viewMember?.username}</p>
                                                            <p className="text-primary text-sm">{viewMember?.email || "No email"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-border/50">
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Mobile</Label>
                                                            <p>{viewMember?.mobile || "Not set"}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">College ID</Label>
                                                            <p>{viewMember?.collegeId || "Not set"}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Game</Label>
                                                            <p>{viewMember?.game}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Joined</Label>
                                                            <p>{viewMember?.created_at ? format(new Date(viewMember.created_at), "PPP") : "Unknown"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        {/* Edit Member Dialog */}
                                        <Dialog open={!!editMember} onOpenChange={(o) => !o && setEditMember(null)}>
                                            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-[95vw] sm:max-w-[600px] bg-black border-2 border-red-600 rounded-2xl overflow-hidden p-0 gap-0">
                                                <DialogHeader className="p-6 pb-2">
                                                    <DialogTitle className="font-display text-2xl uppercase tracking-tighter text-white">
                                                        Edit Member: <span className="text-red-500">{editMember?.username}</span>
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <div className="p-6 pt-2">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
                                                        <div className="grid gap-1.5 text-left">
                                                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Name</Label>
                                                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{editMember?.name || "N/A"}</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-1.5 text-left">
                                                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">College ID</Label>
                                                            <div className="bg-black/90 p-1 px-3 rounded-lg border-2 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)] focus-within:border-red-500 transition-all min-h-[38px] flex items-center focus-within:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                                                <input
                                                                    className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                                                    id="collegeId"
                                                                    value={editMember?.collegeId || ""}
                                                                    onChange={(e) => setEditMember({ ...editMember, collegeId: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-1.5 text-left col-span-1 md:col-span-2">
                                                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">In-Game Name</Label>
                                                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{editMember?.inGameName || "N/A"}</p>
                                                            </div>
                                                        </div>

                                                        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4">
                                                            <div className="grid gap-1.5 text-left md:flex-[1.6] overflow-hidden">
                                                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Email</Label>
                                                                <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                                                    <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{editMember?.email || "N/A"}</p>
                                                                </div>
                                                            </div>

                                                            <div className="grid gap-1.5 text-left md:flex-1">
                                                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Mobile Number</Label>
                                                                <div className="bg-black/90 p-1 px-3 rounded-lg border-2 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)] focus-within:border-red-500 transition-all min-h-[38px] flex items-center focus-within:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                                                    <input
                                                                        className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                                                        id="mobile"
                                                                        value={editMember?.mobile || ""}
                                                                        onChange={(e) => setEditMember({ ...editMember, mobile: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-1.5 text-left col-span-1 md:col-span-2">
                                                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Game Assignment</Label>
                                                            <div className="bg-black/90 p-1 px-3 rounded-lg border-2 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)] focus-within:border-red-500 transition-all min-h-[38px] flex items-center focus-within:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                                                <Select
                                                                    value={editMember?.gameYouPlay || editMember?.game || 'Free Fire'}
                                                                    onValueChange={(val) => setEditMember({ ...editMember, gameYouPlay: val })}
                                                                >
                                                                    <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                                                        <SelectValue placeholder="Select game" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                                                        <SelectItem value="Free Fire" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Free Fire</SelectItem>
                                                                        <SelectItem value="BGMI" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">BGMI</SelectItem>
                                                                        <SelectItem value="Valorant" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Valorant</SelectItem>
                                                                        <SelectItem value="Call Of Duty" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Call Of Duty</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-1.5 text-left col-span-1 md:col-span-2">
                                                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Bio</Label>
                                                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{editMember?.bio || "No bio set"}</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-1.5 text-left col-span-1 md:col-span-2">
                                                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Member Since</Label>
                                                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center cursor-not-allowed">
                                                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center">{editMember?.createdAt ? format(new Date(editMember.createdAt), "PPP") : "N/A"}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row justify-between w-full gap-3 pt-4 border-t border-white/10 mt-2">
                                                        <Button variant="outline" onClick={() => setEditMember(null)} className="flex-1 max-w-[140px] border-2 border-red-600 bg-transparent text-white hover:bg-red-600 hover:text-white h-9 transition-all duration-300 font-display uppercase tracking-widest text-[10px]">
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            className="flex-1 max-w-[140px] bg-red-600 hover:bg-red-700 text-white h-9 transition-all duration-300 font-display uppercase tracking-widest text-[10px]"
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await api.put(`/users/${editMember._id || editMember.id}`, editMember);
                                                                    toast({ title: "Success", description: res.message || "Member updated successfully", variant: "success" });
                                                                    queryClient.invalidateQueries({ queryKey: ["admin-members"] });
                                                                    setEditMember(null);
                                                                } catch (error: any) {
                                                                    toast({ title: "Error", description: error?.message || "Failed to update member", variant: "destructive" });
                                                                }
                                                            }}
                                                        >
                                                            Save Changes
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        {/* Delete Confirmation Alert */}
                                        {deletingMember && (
                                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeletingMember(null)} />
                                                <div className="relative bg-black border-2 border-red-600 rounded-2xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(220,38,38,0.2)] overflow-hidden">
                                                    <div className="flex flex-col items-center text-center gap-3 mb-6">
                                                        <div className="p-4 bg-red-600/10 rounded-full border border-red-600/20 mb-2">
                                                            <Trash2 className="w-8 h-8 text-red-500" />
                                                        </div>
                                                        <h3 className="text-2xl font-display font-bold uppercase tracking-tighter text-white">Delete Member?</h3>
                                                        <p className="text-muted-foreground leading-relaxed">
                                                            Are you sure you want to remove <span className="text-red-500 font-bold">{deletingMember.name || deletingMember.username}</span>? This action is permanent and cannot be undone.
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-row gap-3">
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 border-2 border-red-600 bg-transparent text-white hover:bg-red-600 hover:text-white h-12 transition-all duration-300 font-display uppercase tracking-widest text-xs"
                                                            onClick={() => setDeletingMember(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 transition-all duration-300 font-display uppercase tracking-widest text-xs"
                                                            onClick={handleDeleteMember}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {!filteredMembers?.length && (
                                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-red-600 rounded-2xl bg-black/40 w-full relative overflow-hidden group mt-10 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                                            <div className="absolute inset-0 bg-gradient-to-b from-red-600/[0.05] to-transparent pointer-events-none" />
                                            <div className="relative">
                                                <Users className="w-16 h-16 text-red-500 mb-4" style={{ filter: 'drop-shadow(0 0 18px rgba(220, 38, 38, 0.5))' }} />
                                            </div>
                                            <p className="text-xl font-display font-black uppercase tracking-[0.2em] text-white mb-2">No Members Found</p>
                                            <p className="text-[11px] text-white/40 font-display mb-8 tracking-widest uppercase max-w-xs mx-auto leading-relaxed">
                                                {searchQuery
                                                    ? `No members found matching your search for "${searchQuery}" in ${game}.`
                                                    : <>There are no verified members registered for <span className="text-red-500 font-bold">{game}</span> yet.</>}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Events Tab */}
                        <TabsContent value="events" className="m-0 p-0 border-none outline-none">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-3 sm:px-4 md:px-8 pt-6 md:pt-8 pb-24 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                                        <h2 className="font-display font-semibold text-2xl">Events</h2>
                                        <div className="flex gap-3 items-center ml-auto">
                                            <Button
                                                size="sm"
                                                className="h-10 md:h-11 px-4 whitespace-nowrap bg-red-600 hover:bg-red-700 text-white border-0 gap-2"
                                                onClick={() => {
                                                    setNewEvent({
                                                        id: "",
                                                        title: "",
                                                        description: "",
                                                        event_date: "",
                                                        end_time: "",
                                                        location: "",
                                                        max_participants: "",
                                                        image_url: "",
                                                        is_registration_open: true
                                                    });
                                                    setEventDialogOpen(true);
                                                }}
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Event
                                            </Button>
                                            <Dialog open={eventDialogOpen} onOpenChange={(open) => {
                                                setEventDialogOpen(open);
                                                if (!open) {
                                                    setNewEvent({
                                                        id: "",
                                                        title: "",
                                                        description: "",
                                                        event_date: "",
                                                        end_time: "",
                                                        location: "",
                                                        max_participants: "",
                                                        image_url: "",
                                                        is_registration_open: true
                                                    });
                                                }
                                            }}>
                                                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="w-[95vw] sm:max-w-[600px] bg-black border-2 border-red-600 rounded-xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
                                                    <DialogHeader>
                                                        <DialogTitle className="font-display text-2xl">
                                                            {newEvent.id ? "Edit" : "Create New"} {game} Event
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                                        <div className="space-y-2">
                                                            <Label>Title</Label>
                                                            <Input
                                                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                                value={newEvent.title}
                                                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Description</Label>
                                                            <Textarea
                                                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px] resize-none"
                                                                value={newEvent.description}
                                                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                                                rows={4}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Event Image (Optional)</Label>
                                                            <div className="flex items-start gap-4">
                                                                <div className="flex-1">
                                                                    <div className="relative">
                                                                        <Input
                                                                            className="hidden"
                                                                            id="event-image-upload"
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={async (e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    try {
                                                                                        setIsUploading(true);
                                                                                        toast({
                                                                                            title: "Uploading...",
                                                                                            description: "Please wait while we upload your image.",
                                                                                            variant: "warning"
                                                                                        });

                                                                                        const formData = new FormData();
                                                                                        formData.append('image', file);

                                                                                        const token = localStorage.getItem("inferno_token");
                                                                                        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload/event-image`, {
                                                                                            method: 'POST',
                                                                                            headers: {
                                                                                                'Authorization': `Bearer ${token}`
                                                                                            },
                                                                                            body: formData,
                                                                                        });

                                                                                        if (!response.ok) {
                                                                                            const errorData = await response.json().catch(() => ({}));
                                                                                            throw new Error(errorData.message || 'Failed to upload image');
                                                                                        }

                                                                                        const data = await response.json();
                                                                                        setNewEvent({ ...newEvent, image_url: data.url });

                                                                                        toast({
                                                                                            title: "Success",
                                                                                            description: "Image uploaded successfully!",
                                                                                            variant: "success"
                                                                                        });
                                                                                    } catch (error: any) {
                                                                                        console.error('Upload error:', error);
                                                                                        toast({
                                                                                            title: "Upload Failed",
                                                                                            description: error.message || "Failed to upload image. Please try again.",
                                                                                            variant: "destructive",
                                                                                        });
                                                                                        e.target.value = '';
                                                                                    } finally {
                                                                                        setIsUploading(false);
                                                                                    }
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="default"
                                                                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                                                            onClick={() => document.getElementById('event-image-upload')?.click()}
                                                                            disabled={isUploading}
                                                                        >
                                                                            {isUploading ? (
                                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                            ) : (
                                                                                <Upload className="w-4 h-4 mr-2" />
                                                                            )}
                                                                            {isUploading ? "Uploading..." : "Choose File"}
                                                                        </Button>
                                                                    </div>

                                                                </div>
                                                                {newEvent.image_url && (
                                                                    <div className="flex-shrink-0 relative group">
                                                                        <img src={newEvent.image_url} alt="Preview" className="w-24 h-24 object-cover rounded-md border-2 border-primary/50" />
                                                                        <Button
                                                                            type="button"
                                                                            variant="destructive"
                                                                            size="icon"
                                                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={() => {
                                                                                setNewEvent({ ...newEvent, image_url: '' });
                                                                                const fileInput = document.getElementById('event-image-upload') as HTMLInputElement;
                                                                                if (fileInput) fileInput.value = '';
                                                                            }}
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Date</Label>
                                                                <div className="relative">
                                                                    <Input
                                                                        type="date"
                                                                        value={newEvent.event_date ? newEvent.event_date.split('T')[0] : ''}
                                                                        onChange={(e) => {
                                                                            const date = e.target.value;
                                                                            const time = newEvent.event_date ? newEvent.event_date.split('T')[1] : '12:00';
                                                                            setNewEvent({ ...newEvent, event_date: `${date}T${time}` });
                                                                        }}
                                                                        required
                                                                        className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                                    />
                                                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Max Participants</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={newEvent.max_participants}
                                                                    onChange={(e) => setNewEvent({ ...newEvent, max_participants: e.target.value })}
                                                                    className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Start Time</Label>
                                                                <div className="flex gap-2">
                                                                    <Select
                                                                        value={(() => {
                                                                            if (!newEvent.event_date) return "12";
                                                                            const hours = parseInt(newEvent.event_date.split('T')[1]?.split(':')[0] || "12");
                                                                            const h12 = hours % 12 || 12;
                                                                            return h12.toString();
                                                                        })()}
                                                                        onValueChange={(val) => {
                                                                            const datePart = newEvent.event_date ? newEvent.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                                                            const currentHours = parseInt(newEvent.event_date?.split('T')[1]?.split(':')[0] || "12");
                                                                            const currentMins = newEvent.event_date?.split('T')[1]?.split(':')[1] || "00";
                                                                            const isPM = currentHours >= 12;

                                                                            let newHours = parseInt(val);
                                                                            if (isPM && newHours < 12) newHours += 12;
                                                                            if (!isPM && newHours === 12) newHours = 0;

                                                                            setNewEvent({ ...newEvent, event_date: `${datePart}T${newHours.toString().padStart(2, '0')}:${currentMins}` });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                                                            <SelectValue placeholder="HH" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                                                                <SelectItem key={h} value={h.toString()}>
                                                                                    {h}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>

                                                                    <Select
                                                                        value={newEvent.event_date?.split('T')[1]?.split(':')[1] || "00"}
                                                                        onValueChange={(val) => {
                                                                            const datePart = newEvent.event_date ? newEvent.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                                                            const timePart = newEvent.event_date?.split('T')[1] || "12:00";
                                                                            const hours = timePart.split(':')[0];
                                                                            setNewEvent({ ...newEvent, event_date: `${datePart}T${hours}:${val}` });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                                                            <SelectValue placeholder="MM" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                                                                                <SelectItem key={m} value={m}>
                                                                                    {m}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>

                                                                    <Select
                                                                        value={(() => {
                                                                            if (!newEvent.event_date) return "AM";
                                                                            const hours = parseInt(newEvent.event_date.split('T')[1]?.split(':')[0] || "0");
                                                                            return hours >= 12 ? "PM" : "AM";
                                                                        })()}
                                                                        onValueChange={(val) => {
                                                                            const datePart = newEvent.event_date ? newEvent.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                                                            const currentMins = newEvent.event_date?.split('T')[1]?.split(':')[1] || "00";
                                                                            let hours = parseInt(newEvent.event_date?.split('T')[1]?.split(':')[0] || "12");

                                                                            if (val === "PM" && hours < 12) hours += 12;
                                                                            if (val === "AM" && hours >= 12) hours -= 12;

                                                                            setNewEvent({ ...newEvent, event_date: `${datePart}T${hours.toString().padStart(2, '0')}:${currentMins}` });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="AM">AM</SelectItem>
                                                                            <SelectItem value="PM">PM</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>End Time</Label>
                                                                <div className="flex gap-2">
                                                                    <Select
                                                                        value={(() => {
                                                                            if (!newEvent.end_time) return undefined;
                                                                            const hours = parseInt(newEvent.end_time.split('T')[1]?.split(':')[0] || "12");
                                                                            const h12 = hours % 12 || 12;
                                                                            return h12.toString();
                                                                        })()}
                                                                        onValueChange={(val) => {
                                                                            const datePart = newEvent.event_date ? newEvent.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                                                            // Use end_time parts if available, else default to 12:00
                                                                            const currentHours = parseInt(newEvent.end_time?.split('T')[1]?.split(':')[0] || "12");
                                                                            const currentMins = newEvent.end_time?.split('T')[1]?.split(':')[1] || "00";
                                                                            const isPM = currentHours >= 12;

                                                                            let newHours = parseInt(val);
                                                                            if (isPM && newHours < 12) newHours += 12;
                                                                            if (!isPM && newHours === 12) newHours = 0;

                                                                            setNewEvent({ ...newEvent, end_time: `${datePart}T${newHours.toString().padStart(2, '0')}:${currentMins}` });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                                                            <SelectValue placeholder="HH" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                                                                <SelectItem key={h} value={h.toString()}>
                                                                                    {h}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>

                                                                    <Select
                                                                        value={newEvent.end_time?.split('T')[1]?.split(':')[1] || undefined}
                                                                        onValueChange={(val) => {
                                                                            const datePart = newEvent.event_date ? newEvent.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                                                            const timePart = newEvent.end_time?.split('T')[1] || "12:00";
                                                                            const hours = timePart.split(':')[0];
                                                                            setNewEvent({ ...newEvent, end_time: `${datePart}T${hours}:${val}` });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                                                            <SelectValue placeholder="MM" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                                                                                <SelectItem key={m} value={m}>
                                                                                    {m}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>

                                                                    <Select
                                                                        value={(() => {
                                                                            if (!newEvent.end_time) return undefined;
                                                                            const hours = parseInt(newEvent.end_time.split('T')[1]?.split(':')[0] || "0");
                                                                            return hours >= 12 ? "PM" : "AM";
                                                                        })()}
                                                                        onValueChange={(val) => {
                                                                            const datePart = newEvent.event_date ? newEvent.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                                                            const currentMins = newEvent.end_time?.split('T')[1]?.split(':')[1] || "00";
                                                                            let hours = parseInt(newEvent.end_time?.split('T')[1]?.split(':')[0] || "12");

                                                                            if (val === "PM" && hours < 12) hours += 12;
                                                                            if (val === "AM" && hours >= 12) hours -= 12;

                                                                            setNewEvent({ ...newEvent, end_time: `${datePart}T${hours.toString().padStart(2, '0')}:${currentMins}` });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="AM">AM</SelectItem>
                                                                            <SelectItem value="PM">PM</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Venue</Label>
                                                            <Input
                                                                value={newEvent.location}
                                                                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                                                placeholder="Enter event venue"
                                                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Registration Status</Label>
                                                            <div className={`bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center ${newEvent.end_time && new Date(newEvent.end_time) < new Date() ? "opacity-50 cursor-not-allowed" : ""}`}>
                                                                <Select
                                                                    disabled={!!(newEvent.end_time && new Date(newEvent.end_time) < new Date())}
                                                                    value={newEvent.end_time && new Date(newEvent.end_time) < new Date() ? "false" : (newEvent.is_registration_open !== false ? "true" : "false")}
                                                                    onValueChange={(val) => setNewEvent({ ...newEvent, is_registration_open: val === "true" })}
                                                                >
                                                                    <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                                                        <SelectItem value="true" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Open</SelectItem>
                                                                        <SelectItem value="false" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Closed</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            {newEvent.end_time && new Date(newEvent.end_time) < new Date() && (
                                                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1">Event Completed - Registration Closed</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Game (Locked)</Label>
                                                            <Input value={game} disabled className="bg-black border-red-600 text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0" />
                                                        </div>

                                                        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border/50">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => setEventDialogOpen(false)}
                                                                className="border-primary/100 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button type="submit" variant="flame">
                                                                {newEvent.id ? "Update Event" : "Create Event"}
                                                            </Button>
                                                        </div>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>

                                    <div
                                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                                    >
                                        {filteredEvents?.map((event) => (
                                            <div key={event.id || event._id} className="glass-dark rounded-xl overflow-hidden flame-card-style transition-all group flex flex-col h-full relative w-[90%] sm:w-full sm:max-w-[280px] mx-auto sm:mx-0">
                                                <div className="aspect-[4/5] w-full bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden flex items-center justify-center border-b border-border/50">
                                                    {event.image_url ? (
                                                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-center p-6 flex flex-col items-center justify-center h-full w-full bg-black/40">
                                                            <div className="text-primary font-display font-bold text-4xl mb-2">
                                                                {format(new Date(event.event_date), "dd")}
                                                            </div>
                                                            <div className="text-muted-foreground font-display text-xl uppercase tracking-widest">
                                                                {format(new Date(event.event_date), "MMM")}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="absolute top-4 w-full flex justify-center left-0 pointer-events-none">
                                                        <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold font-display uppercase tracking-wider shadow-md">
                                                            {game}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Slots Progress Section */}
                                                <div className="p-4 bg-black/30 space-y-2">
                                                    {(() => {
                                                        const filled = event.registrationCount || 0;
                                                        const total = event.max_participants ? parseInt(event.max_participants.toString()) : 1;
                                                        const percentFilled = (filled / total) * 100;
                                                        const isFull = filled >= total;
                                                        const isClosedManually = event.is_registration_open === false;
                                                        const isCompleted = event.end_time && new Date(event.end_time) < new Date();

                                                        // Color logic: < 70% Green, < 90% Orange, >= 90% Red
                                                        const colorClass = percentFilled < 70 ? "bg-green-500" : percentFilled < 90 ? "bg-orange-500" : "bg-red-600";
                                                        const finalColor = isCompleted ? "bg-gray-500" : (isClosedManually ? "bg-gray-500" : (isFull ? "bg-red-600" : colorClass));

                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between text-[10px] font-display uppercase tracking-wider">
                                                                    <span className={`font-bold ${isCompleted || isClosedManually ? 'text-gray-400' : isFull ? 'text-red-500' : 'text-white'}`}>
                                                                        {isCompleted ? "COMPLETED" : (isClosedManually ? "CLOSED" : (isFull ? "FULL" : `${filled}/${total} slots filled`))}
                                                                    </span>
                                                                    {!isCompleted && !isClosedManually && !isFull && (
                                                                        <span className="text-white">{total - filled} left</span>
                                                                    )}
                                                                </div>
                                                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full ${finalColor} rounded-full transition-all duration-500`}
                                                                        style={{ width: `${isCompleted ? 100 : Math.min(percentFilled, 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="flame" className="w-full h-9 text-[10px] font-bold tracking-widest uppercase cursor-pointer">
                                                                View Details
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="glass-dark border-2 border-primary w-[85vw] max-w-[500px] text-white px-8 pb-8 pt-6 overflow-hidden max-h-[90vh] flex flex-col rounded-3xl shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] [&>button]:hidden">
                                                            <div className="overflow-y-auto custom-scrollbar flex flex-col gap-5">
                                                                <div className="flex items-center justify-end w-full">
                                                                    <span className="bg-primary/90 border border-primary text-white px-2 py-1 rounded-md text-[10px] font-bold font-display tracking-wider uppercase shadow-lg">
                                                                        {game}
                                                                    </span>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    <h2 className="text-2xl font-bold text-white font-display leading-tight text-left uppercase tracking-tight">
                                                                        {event.title}
                                                                    </h2>
                                                                    <p className="text-white/60 text-sm leading-relaxed text-left font-body">
                                                                        {event.description || "No description."}
                                                                    </p>
                                                                </div>

                                                                <div className="flex flex-col gap-5 text-sm text-white/90 bg-black/50 p-6 rounded-2xl border border-primary/50 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.2)]">
                                                                    <div className="flex items-center gap-4">
                                                                        <Calendar className="w-5 h-5 text-primary shrink-0" />
                                                                        <span className="font-display tracking-wide uppercase text-sm">{format(new Date(event.event_date), "MMM dd, yyyy")}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <Clock className="w-5 h-5 text-primary shrink-0" />
                                                                        <span className="font-display tracking-wide uppercase text-sm">
                                                                            {format(new Date(event.event_date), "h:mm a")} {event.end_time && `- ${format(new Date(event.end_time), "h:mm a")}`}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                                                                        <span className="font-display tracking-wide uppercase text-sm truncate">{event.location || "TBA"}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <Users className="w-5 h-5 text-primary shrink-0" />
                                                                        <span className="font-display tracking-wide uppercase text-sm">{event.max_participants || "Unlim."} Slots</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex gap-3 pt-2">

                                                                    <button
                                                                        type="button"
                                                                        className="flex-1 h-12 rounded-full border-2 border-primary bg-black/50 hover:bg-primary hover:border-primary text-white font-display text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all duration-300 outline-none ring-0 focus:ring-0"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setNewEvent({
                                                                                id: event.id || event._id,
                                                                                title: event.title,
                                                                                description: event.description || "",
                                                                                event_date: formatDateForEditing(event.event_date),
                                                                                end_time: event.end_time ? formatDateForEditing(event.end_time) : "",
                                                                                location: event.location,
                                                                                max_participants: event.max_participants?.toString() || "",
                                                                                image_url: event.image_url || "",
                                                                                is_registration_open: event.is_registration_open !== undefined ? event.is_registration_open : true
                                                                            });
                                                                            setEventDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Edit className="w-4 h-4" /> Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="flex-1 h-12 rounded-full border-2 border-red-600 bg-black/50 hover:bg-red-600 hover:border-red-600 text-white font-display text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all duration-300 outline-none ring-0 focus:ring-0"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setEventToDelete(event);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" /> Delete
                                                                    </button>
                                                                </div>

                                                                <DialogClose asChild>
                                                                    <button className="w-full h-12 rounded-full border-2 border-red-600 bg-black/50 hover:bg-red-600 text-white font-display text-sm transition-all uppercase tracking-widest shadow-sm hover:shadow-lg flex items-center justify-center outline-none mt-2 duration-300 ring-0 focus:ring-0">
                                                                        Close
                                                                    </button>
                                                                </DialogClose>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        ))}
                                        {!filteredEvents?.length && (
                                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-red-600 rounded-2xl bg-black/40 w-full relative overflow-hidden group mt-10 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                                                <div className="absolute inset-0 bg-gradient-to-b from-red-600/[0.05] to-transparent pointer-events-none" />
                                                <div className="relative">
                                                    <Calendar className="w-16 h-16 text-red-500 mb-4" style={{ filter: 'drop-shadow(0 0 18px rgba(220, 38, 38, 0.5))' }} />
                                                </div>
                                                <p className="text-xl font-display font-black uppercase tracking-[0.2em] text-white mb-2">No Events Found</p>
                                                <p className="text-[11px] text-white/40 font-display mb-8 tracking-widest uppercase max-w-xs mx-auto leading-relaxed">
                                                    There are no events scheduled for <span className="text-red-500 font-bold">{game}</span> at the moment. Ignite the community by creating your first tournament.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Registrations Tab */}
                        <TabsContent value="registrations" className="m-0 p-0 border-none outline-none">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-4 sm:px-4 md:px-8 pt-6 md:pt-8 pb-24 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    <RegistrationsPanel game={game} />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Messages Tab */}
                        <TabsContent value="messages" className="m-0 p-0 border-none outline-none">
                            <div className="min-h-[calc(100vh-5rem)] w-full glass-dark border-none rounded-none px-4 sm:px-4 md:px-8 pt-6 md:pt-8 pb-24 md:pb-8">
                                <div className="mx-auto w-full max-w-7xl">
                                    {/* Messages Header & Filters */}
                                    <div className="flex flex-row justify-between items-center mb-6 gap-2 md:gap-4">
                                        <div className="flex items-center gap-3">
                                            <h2 className="font-display font-bold text-xl md:text-3xl">Messages</h2>
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
                                                        <SelectItem key={day} value={String(day).padStart(2, '0')} className="text-white hover:bg-red-600 focus:bg-red-600 focus:text-white data-[state=checked]:bg-red-600 data-[state=checked]:text-white text-xs md:text-sm cursor-pointer">
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
                                                        <SelectItem key={m} value={m} className="text-white hover:bg-red-600 focus:bg-red-600 focus:text-white data-[state=checked]:bg-red-600 data-[state=checked]:text-white text-xs md:text-sm cursor-pointer">
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
                                                        <SelectItem key={year} value={year} className="text-white hover:bg-red-600 focus:bg-red-600 focus:text-white data-[state=checked]:bg-red-600 data-[state=checked]:text-white text-xs md:text-sm cursor-pointer">
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
                                                    {/* Date at top */}
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-xs text-white bg-red-600 px-3 py-1.5 rounded font-medium">
                                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                                        </span>
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
                                                    Your inbox is silent. When members reach out, their messages will appear here for you to manage.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                    <AlertDialogContent className="bg-black border-2 border-red-600 w-[90%] sm:max-w-md rounded-xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the event
                                <span className="font-bold text-red-500"> {eventToDelete?.title}</span> and remove it from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex flex-row items-center gap-3 w-full sm:justify-end">
                            <AlertDialogCancel className="mt-0 flex-1 sm:flex-none bg-transparent border-white/20 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => eventToDelete && deleteEventMutation.mutate(eventToDelete.id || eventToDelete._id)}
                            >
                                Delete Event
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    );
};
