import { useState } from "react";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Calendar, Clock, MapPin, Users, Edit, Upload, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Event {
    id?: string;
    _id?: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    max_participants: number;
    game: string;
    image_url?: string;
    end_time?: string;
    is_registration_open?: boolean;
    registrationCount?: number;
}

interface EventsTabProps {
    events: Event[];
}

export const EventsTab = ({ events }: EventsTabProps) => {
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
    const [gameFilter, setGameFilter] = useState("all");
    const [isUploadingAdd, setIsUploadingAdd] = useState(false);
    const [isUploadingEdit, setIsUploadingEdit] = useState(false);
    const [formData, setFormData] = useState<Partial<Event>>({
        game: "Free Fire",
    });
    const [togglingEvents, setTogglingEvents] = useState<Set<string>>(new Set());
    const { toast } = useToast();
    const queryClient = useQueryClient();


    const filteredEvents = (events?.filter((event) => {
        if (gameFilter === "all") return true;
        return event.game === gameFilter;
    }) || []).sort((a: any, b: any) => {
        const dateA = new Date(a.event_date).getTime();
        const dateB = new Date(b.event_date).getTime();

        if (dateB !== dateA) {
            return dateB - dateA;
        }

        const createdAtA = new Date(a.createdAt || a.created_at || 0).getTime();
        const createdAtB = new Date(b.createdAt || b.created_at || 0).getTime();
        return createdAtB - createdAtA;
    });

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

    const handleAdd = () => {
        setFormData({
            title: "",
            description: "",
            event_date: "",
            location: "",
            max_participants: 50,
            game: "",
            image_url: "",
            end_time: "",
            is_registration_open: false,
        });
        setIsAddingEvent(true);
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            event_date: formatDateForEditing(event.event_date),
            location: event.location,
            max_participants: event.max_participants,
            game: event.game,
            image_url: event.image_url,
            end_time: event.end_time ? formatDateForEditing(event.end_time) : "",
            is_registration_open: event.is_registration_open,
        });
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.event_date || !formData.end_time) {
            toast({
                title: "Missing Fields",
                description: "Please fill in all required fields, including start and end dates.",
                variant: "destructive",
            });
            return;
        }

        const startDate = new Date(formData.event_date);
        const endDate = new Date(formData.end_time);

        if (endDate <= startDate) {
            toast({
                title: "Invalid Dates",
                description: "End date/time must be after start date/time.",
                variant: "destructive",
            });
            return;
        }

        try {
            const token = localStorage.getItem("inferno_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/events`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) throw new Error("Failed to create event");

            toast({
                title: "Success",
                description: "Event created successfully",
                variant: "success",
            });

            queryClient.invalidateQueries({ queryKey: ["admin-events"] });
            setIsAddingEvent(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create event",
                variant: "destructive",
            });
        }
    };

    const handleUpdate = async () => {
        if (!editingEvent) return;

        if (!formData.title || !formData.event_date || !formData.end_time) {
            toast({
                title: "Missing Fields",
                description: "Please fill in all required fields, including start and end dates.",
                variant: "destructive",
            });
            return;
        }

        const startDate = new Date(formData.event_date);
        const endDate = new Date(formData.end_time);

        if (endDate <= startDate) {
            toast({
                title: "Invalid Dates",
                description: "End date/time must be after start date/time.",
                variant: "destructive",
            });
            return;
        }

        try {
            const token = localStorage.getItem("inferno_token");
            const eventId = editingEvent.id || editingEvent._id;
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) throw new Error("Failed to update event");

            toast({
                title: "Success",
                description: "Event updated successfully",
                variant: "success",
            });

            queryClient.invalidateQueries({ queryKey: ["admin-events"] });
            setEditingEvent(null);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update event",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!deletingEvent) return;

        try {
            const token = localStorage.getItem("inferno_token");
            const eventId = deletingEvent.id || deletingEvent._id;
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to delete event");

            toast({
                title: "Success",
                description: "Event deleted successfully",
                variant: "success",
            });

            queryClient.invalidateQueries({ queryKey: ["admin-events"] });
            setDeletingEvent(null);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete event",
                variant: "destructive",
            });
        }
    };

    const handleToggleRegistration = async (event: Event) => {
        const eventId = event.id || event._id;
        if (!eventId) return;

        try {
            setTogglingEvents(prev => {
                const next = new Set(prev);
                next.add(eventId);
                return next;
            });
            const token = localStorage.getItem("inferno_token");
            const newStatus = event.is_registration_open === false ? true : false;

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ is_registration_open: newStatus }),
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                {/* Mobile: Title + Button on same row */}
                <div className="flex justify-between items-center sm:hidden">
                    <h2 className="font-display font-semibold text-2xl">Events</h2>
                    <Button
                        onClick={handleAdd}
                        size="sm"
                        className="h-10 px-4 whitespace-nowrap bg-red-600 hover:bg-red-700 text-white border-0 gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Event
                    </Button>
                </div>

                {/* Desktop: Title on left, Filter + Button on right */}
                <div className="hidden sm:flex justify-between items-center">
                    <h2 className="font-display font-semibold text-3xl">Events</h2>
                    <div className="flex gap-3 items-center">
                        <div className="w-[200px]">
                            <Select value={gameFilter} onValueChange={setGameFilter}>
                                <SelectTrigger className="bg-black border-2 border-red-600 h-11 focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Filter by Game" />
                                </SelectTrigger>
                                <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                    <SelectItem value="all" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">All Games</SelectItem>
                                    <SelectItem value="Free Fire" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Free Fire</SelectItem>
                                    <SelectItem value="BGMI" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">BGMI</SelectItem>
                                    <SelectItem value="Valorant" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Valorant</SelectItem>
                                    <SelectItem value="Call Of Duty" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Call Of Duty</SelectItem>
                                    <SelectItem value="OTHERS" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">OTHERS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleAdd}
                            size="sm"
                            className="h-10 md:h-11 px-4 whitespace-nowrap bg-red-600 hover:bg-red-700 text-white border-0 gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Event
                        </Button>
                    </div>
                </div>

                {/* Mobile: Filter dropdown (full width) */}
                <div className="w-full sm:hidden">
                    <Select value={gameFilter} onValueChange={setGameFilter}>
                        <SelectTrigger className="bg-black border-2 border-red-600 h-11 focus:ring-0 focus:ring-offset-0">
                            <SelectValue placeholder="Filter by Game" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                            <SelectItem value="all" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">All Games</SelectItem>
                            <SelectItem value="Free Fire" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Free Fire</SelectItem>
                            <SelectItem value="BGMI" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">BGMI</SelectItem>
                            <SelectItem value="Valorant" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Valorant</SelectItem>
                            <SelectItem value="Call Of Duty" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Call Of Duty</SelectItem>
                            <SelectItem value="OTHERS" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">OTHERS</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-red-600 rounded-2xl bg-black/40 w-full relative overflow-hidden group mt-10 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/[0.05] to-transparent pointer-events-none" />
                    <div className="relative">
                        <Calendar className="w-16 h-16 text-red-500 mb-4" style={{ filter: 'drop-shadow(0 0 18px rgba(220, 38, 38, 0.5))' }} />
                    </div>
                    <p className="text-xl font-display font-black uppercase tracking-[0.2em] text-white mb-2">No Events Found</p>
                    <p className="text-[11px] text-white/40 font-display mb-8 tracking-widest uppercase max-w-xs mx-auto leading-relaxed">
                        {gameFilter === "all"
                            ? "There are no upcoming gaming events scheduled in the community yet."
                            : <>There are no events found for the <span className="text-red-500 font-bold">{gameFilter}</span> category at the moment.</>}
                    </p>
                </div>
            ) : (
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                    {filteredEvents?.map((event) => {
                        const eventId = event.id || event._id || "";
                        return (
                            <div key={eventId} className="glass-dark rounded-xl overflow-hidden flame-card-style transition-all group flex flex-col h-full relative w-[90%] sm:w-full sm:max-w-[280px] mx-auto sm:mx-0">
                                <div className="aspect-[3/4] w-full relative overflow-hidden flex items-center justify-center border-b border-white/5">
                                    {event.image_url ? (
                                        <img
                                            src={event.image_url}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
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
                                        <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold font-display uppercase tracking-wider shadow-sm">
                                            {event.game}
                                        </span>
                                    </div>
                                </div>

                                {/* Slots Progress Section */}
                                <div className="pt-1.5 pb-3 px-3 bg-black/30 space-y-2">
                                    {(() => {
                                        const isCompleted = event.end_time && new Date(event.end_time) < new Date();
                                        const filled = event.registrationCount || 0;
                                        const total = event.max_participants || 1;
                                        const percentFilled = (filled / total) * 100;
                                        const isFull = filled >= total;
                                        const isClosedManually = event.is_registration_open === false;

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
                                        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="glass-dark border-2 border-[#FF0000] w-[85vw] max-w-[500px] text-white px-4 sm:px-8 pb-4 sm:pb-8 pt-4 sm:pt-6 overflow-hidden max-h-[90vh] flex flex-col rounded-3xl shadow-[0_0_30px_-5px_rgba(255,0,0,0.3)] [&>button]:hidden">
                                            <div className="overflow-y-auto custom-scrollbar flex flex-col gap-5">
                                                <div className="flex items-center justify-end w-full">
                                                    <span className="bg-[#FF0000]/90 border border-[#FF0000] text-white px-2 py-1 rounded-md text-[10px] font-bold font-display tracking-wider uppercase shadow-lg">
                                                        {event.game}
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

                                                <div className="flex flex-col gap-5 text-sm text-white/90 bg-black/50 p-6 rounded-2xl border-2 border-[#FF0000] shadow-[0_0_15px_-5px_rgba(255,0,0,0.3)]">
                                                    <div className="flex items-center gap-4">
                                                        <Calendar className="w-5 h-5 text-primary shrink-0" />
                                                        <span className="font-display tracking-wide uppercase text-sm">{format(new Date(event.event_date), "MMM dd, yyyy")}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Clock className="w-5 h-5 text-primary shrink-0" />
                                                        <span className="font-display tracking-wide uppercase text-sm">
                                                            {format(new Date(event.event_date), "h:mm a")}
                                                            {event.end_time && ` - ${format(new Date(event.end_time), "h:mm a")}`}
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
                                                        className="flex-1 h-12 rounded-full border-2 border-[#FF0000] bg-black/50 hover:bg-[#FF0000] hover:border-[#FF0000] text-white font-display text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all duration-300 outline-none ring-0 focus:ring-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(event);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" /> Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="flex-1 h-12 rounded-full border-2 border-[#FF0000] bg-black/50 hover:bg-[#FF0000] hover:border-[#FF0000] text-white font-display text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all duration-300 outline-none ring-0 focus:ring-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeletingEvent(event);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </button>
                                                </div>

                                                <DialogClose asChild>
                                                    <button className="w-full h-12 rounded-full border-2 border-[#FF0000] bg-black/50 hover:bg-[#FF0000] text-white font-display text-sm transition-all uppercase tracking-widest shadow-sm hover:shadow-lg flex items-center justify-center outline-none mt-2 duration-300 ring-0 focus:ring-0">
                                                        Close
                                                    </button>
                                                </DialogClose>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Event Dialog */}
            <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-[500px] bg-black border-2 border-red-600 rounded-xl p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Create Event</DialogTitle>
                        <DialogDescription>
                            Add a new gaming event
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Title</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <input
                                    className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                    value={formData.title || ""}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Description</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <textarea
                                    className="w-full bg-transparent border-none p-0 min-h-[44px] py-1.5 text-white focus:outline-none text-sm outline-none ring-0 resize-none"
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={1}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Event Image (Optional)</Label>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Input
                                            className="hidden"
                                            id="add-event-image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 15 * 1024 * 1024) {
                                                        toast({
                                                            title: "Image too large",
                                                            description: "Image size should be 15MB only Max",
                                                            variant: "destructive",
                                                        });
                                                        e.target.value = '';
                                                        return;
                                                    }
                                                    try {
                                                        setIsUploadingAdd(true);
                                                        toast({
                                                            title: "Uploading...",
                                                            description: "Please wait while we upload your image.",
                                                            variant: "warning",
                                                        });

                                                        const uploadData = new FormData();
                                                        uploadData.append('image', file);

                                                        const token = localStorage.getItem("inferno_token");
                                                        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload/event-image`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: uploadData,
                                                        });

                                                        if (!response.ok) {
                                                            const errorData = await response.json().catch(() => ({}));
                                                            throw new Error(errorData.message || 'Failed to upload image');
                                                        }

                                                        const data = await response.json();
                                                        setFormData({ ...formData, image_url: data.url });

                                                        toast({
                                                            title: "Success",
                                                            description: "Image uploaded successfully!",
                                                            variant: "success",
                                                        });
                                                    } catch (error: any) {
                                                        toast({
                                                            title: "Upload Failed",
                                                            description: error.message || "Failed to upload image.",
                                                            variant: "destructive",
                                                        });
                                                        e.target.value = '';
                                                    } finally {
                                                        setIsUploadingAdd(false);
                                                    }
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="default"
                                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => document.getElementById('add-event-image-upload')?.click()}
                                            disabled={isUploadingAdd}
                                        >
                                            {isUploadingAdd ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4 mr-2" />
                                            )}
                                            {isUploadingAdd ? "Uploading..." : "Choose File"}
                                        </Button>
                                    </div>
                                </div>
                                {formData.image_url && (
                                    <div className="flex-shrink-0 relative group">
                                        <img src={formData.image_url} alt="Preview" className="w-24 h-24 object-cover rounded-md border-2 border-[#FF0000]/50" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                setFormData({ ...formData, image_url: '' });
                                                const fileInput = document.getElementById('add-event-image-upload') as HTMLInputElement;
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
                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Start Date</Label>
                                <div className="relative">
                                    <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                        <input
                                            type="date"
                                            value={formData.event_date ? formData.event_date.split('T')[0] : ''}
                                            onChange={(e) => {
                                                const date = e.target.value;
                                                const time = formData.event_date ? formData.event_date.split('T')[1] : '12:00';
                                                setFormData({ ...formData, event_date: `${date}T${time}` });
                                            }}
                                            required
                                            className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">End Date</Label>
                                <div className="relative">
                                    <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                        <input
                                            type="date"
                                            value={formData.end_time ? formData.end_time.split('T')[0] : ''}
                                            onChange={(e) => {
                                                const date = e.target.value;
                                                const time = formData.end_time ? formData.end_time.split('T')[1] : '12:00';
                                                setFormData({ ...formData, end_time: `${date}T${time}` });
                                            }}
                                            className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Max Participants</Label>
                                <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                    <input
                                        type="number"
                                        value={formData.max_participants || ""}
                                        onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                                        className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Venue</Label>
                                <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                    <input
                                        className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                        value={formData.location || ""}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Enter event venue"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Start Time</Label>
                                <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center gap-2">
                                    <Select
                                        value={(() => {
                                            if (!formData.event_date) return "12";
                                            const hours = parseInt(formData.event_date.split('T')[1]?.split(':')[0] || "12");
                                            const h12 = hours % 12 || 12;
                                            return h12.toString();
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                            const currentMins = formData.event_date?.split('T')[1]?.split(':')[1] || "00";
                                            let hours = parseInt(formData.event_date?.split('T')[1]?.split(':')[0] || "12");
                                            const isPM = hours >= 12;

                                            let newHours = parseInt(val);
                                            if (isPM && newHours < 12) newHours += 12;
                                            if (!isPM && newHours === 12) newHours = 0;

                                            setFormData({ ...formData, event_date: `${datePart}T${newHours.toString().padStart(2, '0')}:${currentMins}` });
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                            <SelectValue placeholder="HH" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                                <SelectItem key={h} value={h.toString()} className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">
                                                    {h}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={formData.event_date?.split('T')[1]?.split(':')[1] || "00"}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                            const hours = formData.event_date?.split('T')[1]?.split(':')[0] || "12";
                                            setFormData({ ...formData, event_date: `${datePart}T${hours}:${val}` });
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                            <SelectValue placeholder="MM" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                                                <SelectItem key={m} value={m} className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={(() => {
                                            if (!formData.event_date) return "AM";
                                            const hours = parseInt(formData.event_date.split('T')[1]?.split(':')[0] || "0");
                                            return hours >= 12 ? "PM" : "AM";
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                            const currentMins = formData.event_date?.split('T')[1]?.split(':')[1] || "00";
                                            let hours = parseInt(formData.event_date?.split('T')[1]?.split(':')[0] || "12");

                                            if (val === "PM" && hours < 12) hours += 12;
                                            if (val === "AM" && hours >= 12) hours -= 12;

                                            setFormData({ ...formData, event_date: `${datePart}T${hours.toString().padStart(2, '0')}:${currentMins}` });
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            <SelectItem value="AM" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">AM</SelectItem>
                                            <SelectItem value="PM" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">End Time</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={(() => {
                                            if (!formData.end_time) return undefined;
                                            const hours = parseInt(formData.end_time.split('T')[1]?.split(':')[0] || "12");
                                            const h12 = hours % 12 || 12;
                                            return h12.toString();
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.end_time ? formData.end_time.split('T')[0] : (formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0]);
                                            const currentMins = formData.end_time?.split('T')[1]?.split(':')[1] || "00";
                                            let hours = parseInt(formData.end_time?.split('T')[1]?.split(':')[0] || "12");
                                            const isPM = hours >= 12;

                                            let newHours = parseInt(val);
                                            if (isPM && newHours < 12) newHours += 12;
                                            if (!isPM && newHours === 12) newHours = 0;

                                            setFormData({ ...formData, end_time: `${datePart}T${newHours.toString().padStart(2, '0')}:${currentMins}` });
                                        }}
                                    >
                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                            <SelectValue placeholder="HH" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                                <SelectItem key={h} value={h.toString()} className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">
                                                    {h}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={formData.end_time?.split('T')[1]?.split(':')[1] || undefined}
                                        onValueChange={(val) => {
                                            const datePart = formData.end_time ? formData.end_time.split('T')[0] : (formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0]);
                                            const timePart = formData.end_time?.split('T')[1] || "12:00";
                                            const hours = timePart.split(':')[0];
                                            setFormData({ ...formData, end_time: `${datePart}T${hours}:${val}` });
                                        }}
                                    >
                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                            <SelectValue placeholder="MM" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                                                <SelectItem key={m} value={m} className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={(() => {
                                            if (!formData.end_time) return undefined;
                                            const hours = parseInt(formData.end_time.split('T')[1]?.split(':')[0] || "0");
                                            return hours >= 12 ? "PM" : "AM";
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.end_time ? formData.end_time.split('T')[0] : (formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0]);
                                            const currentMins = formData.end_time?.split('T')[1]?.split(':')[1] || "00";
                                            let hours = parseInt(formData.end_time?.split('T')[1]?.split(':')[0] || "12");

                                            if (val === "PM" && hours < 12) hours += 12;
                                            if (val === "AM" && hours >= 12) hours -= 12;

                                            setFormData({ ...formData, end_time: `${datePart}T${hours.toString().padStart(2, '0')}:${currentMins}` });
                                        }}
                                    >
                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            <SelectItem value="AM" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">AM</SelectItem>
                                            <SelectItem value="PM" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Registration Status</Label>
                            <div className={`bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center ${formData.end_time && new Date(formData.end_time) < new Date() ? "opacity-50 cursor-not-allowed" : ""}`}>
                                <Select
                                    disabled={formData.end_time && new Date(formData.end_time) < new Date()}
                                    value={formData.end_time && new Date(formData.end_time) < new Date() ? "false" : (formData.is_registration_open !== false ? "true" : "false")}
                                    onValueChange={(val) => setFormData({ ...formData, is_registration_open: val === "true" })}
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
                            {formData.end_time && new Date(formData.end_time) < new Date() && (
                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1">Event Completed - Registration Closed</p>
                            )}
                        </div>

                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Game</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <Select
                                    value={formData.game || ""}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, game: value })
                                    }
                                >
                                    <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                        <SelectValue placeholder="Select game" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                        <SelectItem value="Free Fire" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Free Fire</SelectItem>
                                        <SelectItem value="BGMI" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">BGMI</SelectItem>
                                        <SelectItem value="Valorant" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Valorant</SelectItem>
                                        <SelectItem value="Call Of Duty" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Call Of Duty</SelectItem>
                                        <SelectItem value="OTHERS" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">OTHERS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddingEvent(false)}
                                className="border-[#FF0000] hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="flame"
                                onClick={handleCreate}
                                className=""
                            >
                                Create Event
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Event Dialog */}
            <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-[500px] bg-black border-2 border-red-600 rounded-xl p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                        <DialogDescription>
                            Update event information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Title</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <input
                                    className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                    value={formData.title || ""}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Description</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <textarea
                                    className="w-full bg-transparent border-none p-0 min-h-[44px] py-1.5 text-white focus:outline-none text-sm outline-none ring-0 resize-none"
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={1}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Event Image (Optional)</Label>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Input
                                            className="hidden"
                                            id="edit-event-image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 15 * 1024 * 1024) {
                                                        toast({
                                                            title: "Image too large",
                                                            description: "Image size should be 15MB only Max",
                                                            variant: "destructive",
                                                        });
                                                        e.target.value = '';
                                                        return;
                                                    }
                                                    try {
                                                        setIsUploadingEdit(true);
                                                        toast({
                                                            title: "Uploading...",
                                                            description: "Please wait while we upload your image.",
                                                            variant: "warning"
                                                        });

                                                        const uploadData = new FormData();
                                                        uploadData.append('image', file);

                                                        const token = localStorage.getItem("inferno_token");
                                                        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload/event-image`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: uploadData,
                                                        });

                                                        if (!response.ok) {
                                                            const errorData = await response.json().catch(() => ({}));
                                                            throw new Error(errorData.message || 'Failed to upload image');
                                                        }

                                                        const data = await response.json();
                                                        setFormData({ ...formData, image_url: data.url });

                                                        toast({
                                                            title: "Success",
                                                            description: "Image uploaded successfully!",
                                                            variant: "success"
                                                        });
                                                    } catch (error: any) {
                                                        toast({
                                                            title: "Upload Failed",
                                                            description: error.message || "Failed to upload image.",
                                                            variant: "destructive",
                                                        });
                                                        e.target.value = '';
                                                    } finally {
                                                        setIsUploadingEdit(false);
                                                    }
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="default"
                                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => document.getElementById('edit-event-image-upload')?.click()}
                                            disabled={isUploadingEdit}
                                        >
                                            {isUploadingEdit ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4 mr-2" />
                                            )}
                                            {isUploadingEdit ? "Uploading..." : "Choose File"}
                                        </Button>
                                    </div>
                                </div>
                                {formData.image_url && (
                                    <div className="flex-shrink-0 relative group">
                                        <img src={formData.image_url} alt="Preview" className="w-24 h-24 object-cover rounded-md border-2 border-primary/50" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                setFormData({ ...formData, image_url: '' });
                                                const fileInput = document.getElementById('edit-event-image-upload') as HTMLInputElement;
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
                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Start Date</Label>
                                <div className="relative">
                                    <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                        <input
                                            type="date"
                                            value={formData.event_date ? formData.event_date.split('T')[0] : ''}
                                            onChange={(e) => {
                                                const date = e.target.value;
                                                const time = formData.event_date ? formData.event_date.split('T')[1] : '12:00';
                                                setFormData({ ...formData, event_date: `${date}T${time}` });
                                            }}
                                            required
                                            className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">End Date</Label>
                                <div className="relative">
                                    <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                        <input
                                            type="date"
                                            value={formData.end_time ? formData.end_time.split('T')[0] : ''}
                                            onChange={(e) => {
                                                const date = e.target.value;
                                                const time = formData.end_time ? formData.end_time.split('T')[1] : '12:00';
                                                setFormData({ ...formData, end_time: `${date}T${time}` });
                                            }}
                                            className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Max Participants</Label>
                                <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                    <input
                                        type="number"
                                        value={formData.max_participants || ""}
                                        onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                                        className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Venue</Label>
                                <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                    <input
                                        className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                        value={formData.location || ""}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Enter event venue"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Start Time</Label>
                                <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center gap-2">
                                    <Select
                                        value={(() => {
                                            if (!formData.event_date) return "12";
                                            const hours = parseInt(formData.event_date.split('T')[1]?.split(':')[0] || "12");
                                            const h12 = hours % 12 || 12;
                                            return h12.toString();
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                            const currentMins = formData.event_date?.split('T')[1]?.split(':')[1] || "00";
                                            let hours = parseInt(formData.event_date?.split('T')[1]?.split(':')[0] || "12");
                                            const isPM = hours >= 12;

                                            let newHours = parseInt(val);
                                            if (isPM && newHours < 12) newHours += 12;
                                            if (!isPM && newHours === 12) newHours = 0;

                                            setFormData({ ...formData, event_date: `${datePart}T${newHours.toString().padStart(2, '0')}:${currentMins}` });
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                            <SelectValue placeholder="HH" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                                <SelectItem key={h} value={h.toString()} className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">
                                                    {h}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={formData.event_date?.split('T')[1]?.split(':')[1] || "00"}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                            const hours = formData.event_date?.split('T')[1]?.split(':')[0] || "12";
                                            setFormData({ ...formData, event_date: `${datePart}T${hours}:${val}` });
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                            <SelectValue placeholder="MM" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                                                <SelectItem key={m} value={m} className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={(() => {
                                            if (!formData.event_date) return "AM";
                                            const hours = parseInt(formData.event_date.split('T')[1]?.split(':')[0] || "0");
                                            return hours >= 12 ? "PM" : "AM";
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                            const currentMins = formData.event_date?.split('T')[1]?.split(':')[1] || "00";
                                            let hours = parseInt(formData.event_date?.split('T')[1]?.split(':')[0] || "12");

                                            if (val === "PM" && hours < 12) hours += 12;
                                            if (val === "AM" && hours >= 12) hours -= 12;

                                            setFormData({ ...formData, event_date: `${datePart}T${hours.toString().padStart(2, '0')}:${currentMins}` });
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            <SelectItem value="AM" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">AM</SelectItem>
                                            <SelectItem value="PM" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2 text-left">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">End Time</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={(() => {
                                            if (!formData.end_time) return undefined;
                                            const hours = parseInt(formData.end_time.split('T')[1]?.split(':')[0] || "12");
                                            const h12 = hours % 12 || 12;
                                            return h12.toString();
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.end_time ? formData.end_time.split('T')[0] : (formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0]);
                                            const currentMins = formData.end_time?.split('T')[1]?.split(':')[1] || "00";
                                            let hours = parseInt(formData.end_time?.split('T')[1]?.split(':')[0] || "12");
                                            const isPM = hours >= 12;

                                            let newHours = parseInt(val);
                                            if (isPM && newHours < 12) newHours += 12;
                                            if (!isPM && newHours === 12) newHours = 0;

                                            setFormData({ ...formData, end_time: `${datePart}T${newHours.toString().padStart(2, '0')}:${currentMins}` });
                                        }}
                                    >
                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                            <SelectValue placeholder="HH" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                                <SelectItem key={h} value={h.toString()} className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">
                                                    {h}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={formData.end_time?.split('T')[1]?.split(':')[1] || undefined}
                                        onValueChange={(val) => {
                                            const datePart = formData.end_time ? formData.end_time.split('T')[0] : (formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0]);
                                            const timePart = formData.end_time?.split('T')[1] || "12:00";
                                            const hours = timePart.split(':')[0];
                                            setFormData({ ...formData, end_time: `${datePart}T${hours}:${val}` });
                                        }}
                                    >
                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                            <SelectValue placeholder="MM" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                                                <SelectItem key={m} value={m} className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={(() => {
                                            if (!formData.end_time) return undefined;
                                            const hours = parseInt(formData.end_time.split('T')[1]?.split(':')[0] || "0");
                                            return hours >= 12 ? "PM" : "AM";
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.end_time ? formData.end_time.split('T')[0] : (formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0]);
                                            const currentMins = formData.end_time?.split('T')[1]?.split(':')[1] || "00";
                                            let hours = parseInt(formData.end_time?.split('T')[1]?.split(':')[0] || "12");

                                            if (val === "PM" && hours < 12) hours += 12;
                                            if (val === "AM" && hours >= 12) hours -= 12;

                                            setFormData({ ...formData, end_time: `${datePart}T${hours.toString().padStart(2, '0')}:${currentMins}` });
                                        }}
                                    >
                                        <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                            <SelectItem value="AM" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">AM</SelectItem>
                                            <SelectItem value="PM" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>



                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Registration Status</Label>
                            <div className={`bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center ${formData.end_time && new Date(formData.end_time) < new Date() ? "opacity-50 cursor-not-allowed" : ""}`}>
                                <Select
                                    disabled={formData.end_time && new Date(formData.end_time) < new Date()}
                                    value={formData.end_time && new Date(formData.end_time) < new Date() ? "false" : (formData.is_registration_open !== false ? "true" : "false")}
                                    onValueChange={(val) => setFormData({ ...formData, is_registration_open: val === "true" })}
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
                            {formData.end_time && new Date(formData.end_time) < new Date() && (
                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1">Event Completed - Registration Closed</p>
                            )}
                        </div>

                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Game</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <Select
                                    value={formData.game || ""}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, game: value })
                                    }
                                >
                                    <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                        <SelectValue placeholder="Select game" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                        <SelectItem value="Free Fire" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Free Fire</SelectItem>
                                        <SelectItem value="BGMI" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">BGMI</SelectItem>
                                        <SelectItem value="Valorant" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Valorant</SelectItem>
                                        <SelectItem value="Call Of Duty" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Call Of Duty</SelectItem>
                                        <SelectItem value="OTHERS" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">OTHERS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-row justify-between w-full gap-2 mt-8 pt-4 border-t border-white/10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingEvent(null)}
                                className="flex-1 border-red-600 bg-transparent text-white hover:bg-red-600 hover:text-white h-10 transition-all duration-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="flame"
                                onClick={handleUpdate}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white h-10 transition-all duration-300"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingEvent} onOpenChange={() => setDeletingEvent(null)}>
                <AlertDialogContent className="bg-black border-2 border-red-600 w-[90%] max-w-md mx-auto rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white font-display text-xl">Delete Event</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete the event{" "}
                            <strong className="text-red-500">{deletingEvent?.title}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row items-center gap-3 w-full sm:justify-end">
                        <AlertDialogCancel className="mt-0 flex-1 sm:flex-none bg-transparent border-2 border-red-600 text-white hover:bg-red-600 hover:text-white transition-all duration-300">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
