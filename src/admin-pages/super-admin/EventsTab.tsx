import { useState } from "react";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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


    const filteredEvents = events?.filter((event) => {
        if (gameFilter === "all") return true;
        return event.game === gameFilter;
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
            <div
                className="grid gap-4"
            >
                {filteredEvents?.map((event) => {
                    const eventId = event.id || event._id || "";
                    return (
                        <div
                            key={eventId}
                            className="bg-transparent rounded-xl border-2 border-red-600 hover:border-red-500 transition-all overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-3 p-4 md:p-6 bg-black">
                                <div className="flex-1">
                                    <h3 className="font-display font-bold text-base md:text-xl text-foreground mb-2">
                                        {event.title}
                                    </h3>
                                    <p className="text-muted-foreground text-xs md:text-sm mb-3">
                                        {event.description}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                                        <span>📅 {format(new Date(event.event_date), "PPP")}</span>
                                        <span>📍 {event.location}</span>
                                        <span>👥 {event.max_participants} slots</span>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-auto">
                                    <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                                        {event.game}
                                    </Badge>
                                    <div className="flex gap-2 ml-auto md:ml-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(event)}
                                            className="text-xs px-3 py-1 h-8 border-primary/50 hover:bg-primary/10"
                                        >
                                            <Pencil className="w-3 h-3 md:mr-1" />
                                            <span className="hidden md:inline">Edit</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDeletingEvent(event)}
                                            className="text-xs px-3 py-1 h-8 border-destructive/50 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-3 h-3 md:mr-1" />
                                            <span className="hidden md:inline">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Event Dialog */}
            <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-[500px] bg-black border-2 border-red-600 rounded-xl p-6">
                    <DialogHeader>
                        <DialogTitle>Create Event</DialogTitle>
                        <DialogDescription>
                            Add a new gaming event
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-title">Title *</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="add-title"
                                value={formData.title || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-description">Description *</Label>
                            <Textarea
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="add-description"
                                value={formData.description || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-date">Event Date *</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="add-date"
                                type="datetime-local"
                                value={formData.event_date || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, event_date: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-location">Location *</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="add-location"
                                value={formData.location || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, location: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-max-participants">Max Participants *</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="add-max-participants"
                                type="number"
                                value={formData.max_participants || 50}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        max_participants: parseInt(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-game">Game *</Label>
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
                        <div className="grid gap-2">
                            <Label htmlFor="add-image">Image URL</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="add-image"
                                value={formData.image_url || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, image_url: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-row gap-2">
                        <Button variant="outline" onClick={() => setIsAddingEvent(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} className="flex-1">Create Event</Button>
                    </DialogFooter>
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
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="edit-title"
                                value={formData.title || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="edit-description"
                                value={formData.description || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-date">Event Date</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="edit-date"
                                type="datetime-local"
                                value={formData.event_date || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, event_date: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-location">Location</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="edit-location"
                                value={formData.location || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, location: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-max-participants">Max Participants</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="edit-max-participants"
                                type="number"
                                value={formData.max_participants || 50}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        max_participants: parseInt(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
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
                        <div className="grid gap-2">
                            <Label htmlFor="edit-image">Image URL</Label>
                            <Input
                                className="bg-black border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                id="edit-image"
                                value={formData.image_url || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, image_url: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-row gap-2">
                        <Button variant="outline" onClick={() => setEditingEvent(null)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} className="flex-1">Save Changes</Button>
                    </DialogFooter>
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
                    <AlertDialogFooter className="flex flex-row gap-2 justify-between sm:justify-between">
                        <AlertDialogCancel className="border-red-600 text-white hover:bg-red-600/10 mt-0">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
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
