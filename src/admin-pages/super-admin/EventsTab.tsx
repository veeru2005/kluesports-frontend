import { useState } from "react";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Calendar, Clock, MapPin, Users, Edit, Upload, X } from "lucide-react";
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
}

interface EventsTabProps {
    events: Event[];
}

export const EventsTab = ({ events }: EventsTabProps) => {
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
    const [gameFilter, setGameFilter] = useState("all");
    const [formData, setFormData] = useState<Partial<Event>>({
        game: "Free Fire",
    });
    const { toast } = useToast();
    const queryClient = useQueryClient();


    const filteredEvents = (events?.filter((event) => {
        if (gameFilter === "all") return true;
        return event.game === gameFilter;
    }) || []).sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.created_at || a.event_date).getTime();
        const dateB = new Date(b.createdAt || b.created_at || b.event_date).getTime();
        return dateB - dateA;
    });

    const handleAdd = () => {
        setFormData({
            title: "",
            description: "",
            event_date: "",
            location: "",
            max_participants: 50,
            game: "Free Fire",
            image_url: "",
            end_time: "",
        });
        setIsAddingEvent(true);
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            event_date: event.event_date,
            location: event.location,
            max_participants: event.max_participants,
            game: event.game,
            image_url: event.image_url,
            end_time: event.end_time || "",
        });
    };

    const handleCreate = async () => {
        try {
            const token = localStorage.getItem("inferno_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/events`,
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

        try {
            const token = localStorage.getItem("inferno_token");
            const eventId = editingEvent.id || editingEvent._id;
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/events/${eventId}`,
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
                `${import.meta.env.VITE_API_BASE_URL}/events/${eventId}`,
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

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold order-1">Events</h2>

                <Button
                    onClick={handleAdd}
                    size="sm"
                    className="h-10 md:h-11 px-4 whitespace-nowrap bg-red-600 hover:bg-red-700 text-white border-0 gap-2 order-2 md:order-3"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Event</span>
                    <span className="sm:hidden">Add</span>
                </Button>

                <div className="w-full md:w-auto order-3 md:order-2 md:ml-auto">
                    <Select value={gameFilter} onValueChange={setGameFilter}>
                        <SelectTrigger className="w-full md:w-[200px] bg-black border-2 border-red-600 h-11 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                            <SelectValue placeholder="Filter by Game" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                            <SelectItem value="all" className="text-white hover:bg-red-600/20 focus:bg-red-600/20 focus:text-white">All Games</SelectItem>
                            <SelectItem value="Free Fire" className="text-white hover:bg-red-600/20 focus:bg-red-600/20 focus:text-white">Free Fire</SelectItem>
                            <SelectItem value="BGMI" className="text-white hover:bg-red-600/20 focus:bg-red-600/20 focus:text-white">BGMI</SelectItem>
                            <SelectItem value="Valorant" className="text-white hover:bg-red-600/20 focus:bg-red-600/20 focus:text-white">Valorant</SelectItem>
                            <SelectItem value="Call Of Duty" className="text-white hover:bg-red-600/20 focus:bg-red-600/20 focus:text-white">Call Of Duty</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {filteredEvents.length === 0 ? (
                <div className="w-full glass-dark border-2 border-red-600 rounded-xl p-12 text-center my-8">
                    <h3 className="text-xl font-bold text-white font-display mb-2">No Events Found</h3>
                    <p className="text-white/60 font-body">
                        {gameFilter === "all"
                            ? "There are no events scheduled at the moment."
                            : `There are no events found for ${gameFilter}.`}
                    </p>
                </div>
            ) : (
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {filteredEvents?.map((event) => {
                        const eventId = event.id || event._id || "";
                        return (
                            <Dialog key={eventId}>
                                <DialogTrigger asChild>
                                    <div className="glass-dark rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all group hover:ember-glow flex flex-col h-full cursor-pointer relative w-[90%] mx-auto">
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

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 flex flex-col justify-end p-4">
                                                <div className="absolute top-4 right-4">
                                                    <span className="bg-black/60 border border-primary/30 text-primary px-2 py-0.5 rounded-full backdrop-blur-md text-[9px] font-display uppercase tracking-wider">
                                                        {event.game}
                                                    </span>
                                                </div>
                                                <h3 className="font-display font-bold text-xl text-white mb-1 leading-tight group-hover:text-primary transition-colors">
                                                    {event.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-white/80 text-xs font-display tracking-widest uppercase">
                                                    <Calendar className="w-3 h-3 text-primary" />
                                                    {format(new Date(event.event_date), "MMM dd, yyyy")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="glass-dark border-2 border-primary w-[85vw] max-w-[500px] text-white px-8 pb-8 pt-6 overflow-hidden max-h-[90vh] flex flex-col rounded-3xl shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] [&>button]:hidden">
                                    <div className="overflow-y-auto custom-scrollbar flex flex-col gap-5">
                                        <div className="flex items-center justify-end w-full">
                                            <span className="bg-primary/90 border border-primary text-white px-2 py-1 rounded-md text-[10px] font-bold font-display tracking-wider uppercase shadow-lg">
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

                                        <div className="flex flex-col gap-5 text-sm text-white/90 bg-black/50 p-6 rounded-2xl border border-primary/50 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.2)]">
                                            <div className="flex items-center gap-4">
                                                <Calendar className="w-5 h-5 text-primary shrink-0" />
                                                <span className="font-display tracking-wide uppercase text-sm">{format(new Date(event.event_date), "MMM dd, yyyy")}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Clock className="w-5 h-5 text-primary shrink-0" />
                                                <span className="font-display tracking-wide uppercase text-sm">
                                                    {format(new Date(event.event_date), "h:mm a")}
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
                                                    handleEdit(event);
                                                }}
                                            >
                                                <Edit className="w-4 h-4" /> Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 h-12 rounded-full border-2 border-red-600 bg-black/50 hover:bg-red-600 hover:border-red-600 text-white font-display text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all duration-300 outline-none ring-0 focus:ring-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeletingEvent(event);
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
                        );
                    })}
                </div>
            )}

            {/* Add Event Dialog */}
            <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-[500px] bg-black border-2 border-red-600 rounded-xl p-6">
                    <DialogHeader>
                        <DialogTitle>Create Event</DialogTitle>
                        <DialogDescription>
                            Add a new gaming event
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                value={formData.title || ""}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px] resize-none"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                            id="add-event-image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        toast({
                                                            title: "Uploading...",
                                                            description: "Please wait while we upload your image.",
                                                            className: "bg-orange-500 text-white border-none"
                                                        });

                                                        const uploadData = new FormData();
                                                        uploadData.append('image', file);

                                                        const token = localStorage.getItem("inferno_token");
                                                        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload/event-image`, {
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
                                                            className: "bg-green-600 text-white border-none"
                                                        });
                                                    } catch (error: any) {
                                                        toast({
                                                            title: "Upload Failed",
                                                            description: error.message || "Failed to upload image.",
                                                            variant: "destructive",
                                                        });
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="default"
                                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => document.getElementById('add-event-image-upload')?.click()}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Choose File
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
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={formData.event_date ? formData.event_date.split('T')[0] : ''}
                                        onChange={(e) => {
                                            const date = e.target.value;
                                            const time = formData.event_date ? formData.event_date.split('T')[1] : '12:00';
                                            setFormData({ ...formData, event_date: `${date}T${time}` });
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
                                    value={formData.max_participants || ""}
                                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
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
                                        value={formData.event_date?.split('T')[1]?.split(':')[1] || "00"}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                            const hours = formData.event_date?.split('T')[1]?.split(':')[0] || "12";
                                            setFormData({ ...formData, event_date: `${datePart}T${hours}:${val}` });
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
                                            if (!formData.end_time) return undefined;
                                            const hours = parseInt(formData.end_time.split('T')[1]?.split(':')[0] || "12");
                                            const h12 = hours % 12 || 12;
                                            return h12.toString();
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
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
                                        <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                                <SelectItem key={h} value={h.toString()}>
                                                    {h}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={formData.end_time?.split('T')[1]?.split(':')[1] || undefined}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                            const timePart = formData.end_time?.split('T')[1] || "12:00";
                                            const hours = timePart.split(':')[0];
                                            setFormData({ ...formData, end_time: `${datePart}T${hours}:${val}` });
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
                                            if (!formData.end_time) return undefined;
                                            const hours = parseInt(formData.end_time.split('T')[1]?.split(':')[0] || "0");
                                            return hours >= 12 ? "PM" : "AM";
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
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
                                value={formData.location || ""}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Enter event venue"
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="add-game">Game</Label>
                            <Select
                                value={formData.game || ""}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, game: value })
                                }
                            >
                                <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Select game" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Free Fire">Free Fire</SelectItem>
                                    <SelectItem value="BGMI">BGMI</SelectItem>
                                    <SelectItem value="Valorant">Valorant</SelectItem>
                                    <SelectItem value="Call Of Duty">Call Of Duty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddingEvent(false)}
                                className="border-primary/100 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
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
                <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-[500px] bg-black border-2 border-red-600 rounded-xl p-6">
                    <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                        <DialogDescription>
                            Update event information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                value={formData.title || ""}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px] resize-none"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                            id="edit-event-image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        toast({
                                                            title: "Uploading...",
                                                            description: "Please wait while we upload your image.",
                                                            className: "bg-orange-500 text-white border-none"
                                                        });

                                                        const uploadData = new FormData();
                                                        uploadData.append('image', file);

                                                        const token = localStorage.getItem("inferno_token");
                                                        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload/event-image`, {
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
                                                            className: "bg-green-600 text-white border-none"
                                                        });
                                                    } catch (error: any) {
                                                        toast({
                                                            title: "Upload Failed",
                                                            description: error.message || "Failed to upload image.",
                                                            variant: "destructive",
                                                        });
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="default"
                                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => document.getElementById('edit-event-image-upload')?.click()}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Choose File
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
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={formData.event_date ? formData.event_date.split('T')[0] : ''}
                                        onChange={(e) => {
                                            const date = e.target.value;
                                            const time = formData.event_date ? formData.event_date.split('T')[1] : '12:00';
                                            setFormData({ ...formData, event_date: `${date}T${time}` });
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
                                    value={formData.max_participants || ""}
                                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
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
                                        value={formData.event_date?.split('T')[1]?.split(':')[1] || "00"}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                            const hours = formData.event_date?.split('T')[1]?.split(':')[0] || "12";
                                            setFormData({ ...formData, event_date: `${datePart}T${hours}:${val}` });
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
                                            if (!formData.end_time) return undefined;
                                            const hours = parseInt(formData.end_time.split('T')[1]?.split(':')[0] || "12");
                                            const h12 = hours % 12 || 12;
                                            return h12.toString();
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
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
                                        <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                                <SelectItem key={h} value={h.toString()}>
                                                    {h}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={formData.end_time?.split('T')[1]?.split(':')[1] || undefined}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                            const timePart = formData.end_time?.split('T')[1] || "12:00";
                                            const hours = timePart.split(':')[0];
                                            setFormData({ ...formData, end_time: `${datePart}T${hours}:${val}` });
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
                                            if (!formData.end_time) return undefined;
                                            const hours = parseInt(formData.end_time.split('T')[1]?.split(':')[0] || "0");
                                            return hours >= 12 ? "PM" : "AM";
                                        })()}
                                        onValueChange={(val) => {
                                            const datePart = formData.event_date ? formData.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
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
                                value={formData.location || ""}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Enter event venue"
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-game">Game</Label>
                            <Select
                                value={formData.game || ""}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, game: value })
                                }
                            >
                                <SelectTrigger className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Select game" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Free Fire">Free Fire</SelectItem>
                                    <SelectItem value="BGMI">BGMI</SelectItem>
                                    <SelectItem value="Valorant">Valorant</SelectItem>
                                    <SelectItem value="Call Of Duty">Call Of Duty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingEvent(null)}
                                className="border-primary/100 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="flame"
                                onClick={handleUpdate}
                                className=""
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
                        <AlertDialogCancel className="mt-0 flex-1 sm:flex-none bg-transparent border-red-600 text-white hover:bg-red-600/10">Cancel</AlertDialogCancel>
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
