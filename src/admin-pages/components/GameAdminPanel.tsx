import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminNavbar } from "./AdminNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Plus, Trash2, Shield, Eye, Edit, Search, X, Upload, Clock, MapPin } from "lucide-react";
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
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
        if (tabParam && ["dashboard", "members", "events", "messages"].includes(tabParam)) {
            return tabParam;
        }
        return "dashboard";
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [searchQuery, setSearchQuery] = useState("");
    const [gameFilter, setGameFilter] = useState("all");
    const [newEvent, setNewEvent] = useState({
        id: "",
        title: "",
        description: "",
        event_date: "",
        location: "",
        max_participants: "",
        image_url: "",
    });
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

    const filteredMembers = members?.filter((m: any) => {
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
    }) || [];

    const filteredEvents = (events?.filter((e: any) => {
        return gameFilter === "all" ? e.game === game : e.game === gameFilter;
    }) || []).sort((a: any, b: any) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    const createEventMutation = useMutation({
        mutationFn: async (eventData: typeof newEvent & { game: string }) => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(eventData),
            });
            if (!response.ok) throw new Error("Failed to create event");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-events"] });
            toast({ title: "Success", description: "Event created successfully!", variant: "success" });
            setEventDialogOpen(false);
            setNewEvent({
                id: "",
                title: "",
                description: "",
                event_date: "",
                location: "",
                max_participants: "",
                image_url: "",
            });
        },
    });

    const [viewMember, setViewMember] = useState<any>(null);
    const [editMember, setEditMember] = useState<any>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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

                                <div className="relative z-10 space-y-4 md:space-y-8 animate-fade-in-up px-4">
                                    <div className="inline-block px-4 md:px-6 py-2 md:py-3 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                            <span className="text-red-200 text-xs md:text-base font-medium tracking-widest uppercase">{game} Admin Dashboard</span>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-8xl tracking-tight uppercase leading-none mb-2 md:mb-4 text-white">
                                            WELCOME BACK
                                        </h1>

                                        <h2 className="font-display font-bold text-3xl md:text-5xl lg:text-7xl tracking-tight uppercase leading-none drop-shadow-[0_0_30px_rgba(220,38,38,0.6)] relative">
                                            <span className="flame-text">{user?.username || user?.email?.split('@')[0] || 'Admin'}</span>
                                        </h2>
                                    </div>

                                    <p className="text-sm md:text-xl lg:text-2xl text-muted-foreground font-body max-w-3xl mx-auto leading-relaxed drop-shadow-lg px-2">
                                        Manage your {game} community, oversee events, and track member engagement all in one place.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 md:pt-8 max-w-2xl mx-auto w-full">
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
                                        <div className="flex gap-3 items-center flex-wrap">
                                            <div className="relative w-full md:w-auto">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search members..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-9 w-full md:w-[250px] bg-black/50 border-input"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {filteredMembers?.map((member: any) => (
                                            <div
                                                key={member.id}
                                                className="bg-black/80 backdrop-blur-sm rounded-xl border-2 border-red-600 flex flex-col hover:border-red-500 transition-all overflow-hidden group"
                                            >
                                                <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
                                                    <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center ring-2 ring-red-600/30">
                                                        <span className="font-display font-bold text-3xl text-red-500">
                                                            {(member.full_name || member.name || member.username || "U").charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2 w-full flex flex-col items-center">
                                                        <h3 className="font-display font-bold text-xl text-foreground truncate w-full text-center">
                                                            {member.full_name || member.name || "Unknown Name"}
                                                        </h3>
                                                        <p className="text-red-500 font-medium text-sm truncate w-full text-center">
                                                            {member.email || "user@example.com"}
                                                        </p>
                                                        <p className="text-white text-xs font-display bg-muted/10 py-1 px-3 rounded-md border border-white mt-1">
                                                            {member.username}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-auto flex gap-4 p-6 border-t border-red-600/30">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setViewMember(member)}
                                                        className="flex-1 gap-2 border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 action-cycle"
                                                    >
                                                        <span className="action-cycle-icon">
                                                            <Eye className="w-4 h-4" />
                                                        </span>
                                                        <span className="action-cycle-label">View</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditMember({ ...member, mobile: member.mobile || '', collegeId: member.collegeId || '', email: member.email || 'user@example.com' })}
                                                        className="flex-1 gap-2 border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 action-cycle action-cycle-delay-1"
                                                    >
                                                        <span className="action-cycle-icon">
                                                            <Edit className="w-4 h-4" />
                                                        </span>
                                                        <span className="action-cycle-label">Edit</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* View Member Dialog */}
                                        <Dialog open={!!viewMember} onOpenChange={(o) => !o && setViewMember(null)}>
                                            <DialogContent className="glass-dark border-border">
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
                                            <DialogContent className="glass-dark border-border">
                                                <DialogHeader>
                                                    <DialogTitle className="font-display text-xl">Edit Member: {editMember?.username}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Email</Label>
                                                        <Input
                                                            value={editMember?.email || ''}
                                                            onChange={(e) => setEditMember({ ...editMember, email: e.target.value })}
                                                            className="bg-muted border-border"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Mobile Number</Label>
                                                        <Input
                                                            value={editMember?.mobile || ''}
                                                            onChange={(e) => setEditMember({ ...editMember, mobile: e.target.value })}
                                                            className="bg-muted border-border"
                                                            maxLength={10}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>College ID</Label>
                                                        <Input
                                                            value={editMember?.collegeId || ''}
                                                            onChange={(e) => setEditMember({ ...editMember, collegeId: e.target.value })}
                                                            className="bg-muted border-border"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
                                                    <Button variant="flame" onClick={() => {
                                                        // Mock update functionality
                                                        toast({ title: "Member Updated", description: "Member details updated successfully." });
                                                        setEditMember(null);
                                                    }}>Save Changes</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                    </div>

                                    {!filteredMembers?.length && (
                                        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
                                            <div className="p-8 rounded-full bg-muted/10 mb-4">
                                                <Search className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <p className="text-muted-foreground text-xl font-display">
                                                No members found for {game}.
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
                                        <h2 className="font-display font-semibold text-2xl">Manage Events</h2>
                                        <div className="flex gap-3 items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Filter:</span>
                                                <Select value={gameFilter} onValueChange={setGameFilter}>
                                                    <SelectTrigger className="w-[150px] bg-muted border-border">
                                                        <SelectValue placeholder="All Games" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Games</SelectItem>
                                                        <SelectItem value="Free Fire">Free Fire</SelectItem>
                                                        <SelectItem value="BGMI">BGMI</SelectItem>
                                                        <SelectItem value="Valorant">Valorant</SelectItem>
                                                        <SelectItem value="Call Of Duty">Call Of Duty</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Dialog open={eventDialogOpen} onOpenChange={(open) => {
                                                setEventDialogOpen(open);
                                                if (!open) {
                                                    setNewEvent({
                                                        id: "",
                                                        title: "",
                                                        description: "",
                                                        event_date: "",
                                                        location: "",
                                                        max_participants: "",
                                                        image_url: ""
                                                    });
                                                }
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button variant="flame" className="gap-2">
                                                        <Plus className="w-4 h-4" />
                                                        Add Event
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="glass-dark border-border md:w-full w-[95vw] max-h-[85vh] overflow-y-auto [&>button]:hidden">
                                                    <DialogHeader>
                                                        <DialogTitle className="font-display text-2xl">
                                                            {newEvent.id ? "Edit" : "Create New"} {game} Event
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                                        <div className="space-y-2">
                                                            <Label>Title</Label>
                                                            <Input
                                                                value={newEvent.title}
                                                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                                                required
                                                                className="bg-muted border-border"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Description</Label>
                                                            <Textarea
                                                                value={newEvent.description}
                                                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                                                className="bg-muted border-border min-h-[100px] resize-none"
                                                                rows={4}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Event Image (Optional)</Label>
                                                            <div className="flex items-start gap-4">
                                                                <div className="flex-1">
                                                                    <div className="relative">
                                                                        <Input
                                                                            id="event-image-upload"
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    // Validate image is square (1:1 aspect ratio)
                                                                                    const img = new Image();
                                                                                    img.onload = () => {
                                                                                        if (img.width === img.height) {
                                                                                            // Create a local URL for preview
                                                                                            const imageUrl = URL.createObjectURL(file);
                                                                                            setNewEvent({ ...newEvent, image_url: imageUrl });
                                                                                        } else {
                                                                                            toast({
                                                                                                title: "Invalid Image Dimensions",
                                                                                                description: `Image must be square (1:1 ratio). Your image is ${img.width}×${img.height}px. Please use a 1080×1080px image.`,
                                                                                                variant: "destructive",
                                                                                            });
                                                                                            // Reset the file input
                                                                                            e.target.value = '';
                                                                                        }
                                                                                    };
                                                                                    img.src = URL.createObjectURL(file);
                                                                                }
                                                                            }}
                                                                            className="hidden"
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="default"
                                                                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                                                            onClick={() => document.getElementById('event-image-upload')?.click()}
                                                                        >
                                                                            <Upload className="w-4 h-4 mr-2" />
                                                                            Choose File
                                                                        </Button>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground mt-2">Recommended: 1080×1080px (square image)</p>
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
                                                                <Input
                                                                    type="date"
                                                                    value={newEvent.event_date ? newEvent.event_date.split('T')[0] : ''}
                                                                    onChange={(e) => {
                                                                        const date = e.target.value;
                                                                        const time = newEvent.event_date ? newEvent.event_date.split('T')[1] : '12:00';
                                                                        setNewEvent({ ...newEvent, event_date: `${date}T${time}` });
                                                                    }}
                                                                    required
                                                                    className="bg-muted border-border"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Max Participants</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={newEvent.max_participants}
                                                                    onChange={(e) => setNewEvent({ ...newEvent, max_participants: e.target.value })}
                                                                    className="bg-muted border-border"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Time</Label>
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
                                                                    <SelectTrigger className="bg-muted border-border min-w-[70px]">
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
                                                                    <SelectTrigger className="bg-muted border-border min-w-[70px]">
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
                                                                    <SelectTrigger className="bg-muted border-border min-w-[70px]">
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
                                                            <Label>Venue</Label>
                                                            <Input
                                                                value={newEvent.location}
                                                                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                                                placeholder="Enter event venue"
                                                                className="bg-muted border-border"
                                                            />
                                                        </div>

                                                        <div className="space-y-2 opacity-70">
                                                            <Label>Game (Locked)</Label>
                                                            <Input value={game} disabled className="bg-muted/50 border-border" />
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredEvents?.map((event) => (
                                            <div
                                                key={event.id}
                                                className="glass-dark rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all group flex flex-col h-full"
                                            >
                                                <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden flex items-center justify-center border-b border-border/50">
                                                    {event.image_url ? (
                                                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-center p-6">
                                                            <div className="text-primary font-display font-bold text-4xl mb-2">
                                                                {format(new Date(event.event_date), "dd")}
                                                            </div>
                                                            <div className="text-muted-foreground font-display text-xl uppercase tracking-widest">
                                                                {format(new Date(event.event_date), "MMM yyyy")}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-6 flex flex-col flex-grow">
                                                    <h3 className="font-display font-bold text-2xl text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-muted-foreground font-body mb-6 line-clamp-3 text-sm">
                                                        {event.description || "No description provided."}
                                                    </p>

                                                    <div className="mt-auto space-y-4">
                                                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-primary" />
                                                                {format(new Date(event.event_date), "PPP")}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-primary" />
                                                                {format(new Date(event.event_date), "h:mm a")}
                                                            </div>
                                                            {event.location && (
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4 text-primary" />
                                                                    {event.location}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2">
                                                                <Users className="w-4 h-4 text-primary" />
                                                                {event.max_participants || "Unlim."} Slots
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2 pt-2">
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 bg-black border-primary/100 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                                                                onClick={() => {
                                                                    setNewEvent({
                                                                        id: event.id,
                                                                        title: event.title,
                                                                        description: event.description || "",
                                                                        event_date: event.event_date,
                                                                        location: event.location,
                                                                        max_participants: event.max_participants?.toString() || "",
                                                                        image_url: event.image_url || ""
                                                                    });
                                                                    setEventDialogOpen(true);
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 bg-black border-primary/100 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {!filteredEvents?.length && (
                                            <div className="col-span-full text-center py-12">
                                                <p className="text-muted-foreground text-lg">No events found for {game}.</p>
                                            </div>
                                        )}
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
