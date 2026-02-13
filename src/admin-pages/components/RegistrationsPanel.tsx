import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Users, Calendar, Trophy, MapPin, Clock, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/Loader";

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
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RegistrationsPanelProps {
    game: string;
    isSuperAdmin?: boolean;
}

interface Registration {
    _id: string;
    eventId: string | { _id: string; title: string; event_date: string };
    eventTitle: string;
    userId: { _id: string; name: string; email: string } | string;
    teamName: string;
    teamSize: number;
    teamLogo?: string;
    teamLead: any;
    player2: any;
    player3: any;
    player4: any;
    player5?: any;
    game: string;
    status: string;
    createdAt: string;
}

const RegistrationsPanel = ({ game, isSuperAdmin = false }: RegistrationsPanelProps) => {
    const [selectedGame, setSelectedGame] = useState(game);
    const [isExporting, setIsExporting] = useState<string | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string; game: string } | null>(null);
    const [hiddenEvents, setHiddenEvents] = useState<string[]>(() => {
        const saved = localStorage.getItem("hidden_registration_events");
        return saved ? JSON.parse(saved) : [];
    });

    const { data: registrationSummaries, isLoading: isRegistrationsLoading } = useQuery({
        queryKey: ["registrations-summary", selectedGame],
        queryFn: async () => {
            const token = localStorage.getItem("inferno_token");
            let url = `${import.meta.env.VITE_API_BASE_URL}/registrations/all-summary`;
            if (selectedGame !== 'All') {
                url = `${import.meta.env.VITE_API_BASE_URL}/registrations/events/summary?game=${encodeURIComponent(selectedGame)}`;
            }
            const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok) throw new Error("Failed to fetch summaries");
            return response.json() as Promise<{ _id: string; count: number }[]>;
        },
    });

    const deleteRegistrationsMutation = useMutation({
        mutationFn: async ({ eventId, game }: { eventId: string; game: string }) => {
            const token = localStorage.getItem("inferno_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/registrations/event/${eventId}?game=${encodeURIComponent(game)}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (!response.ok) throw new Error("Failed to delete registrations");
            return response.json();
        },
        onSuccess: (_, { eventId }) => {
            setHiddenEvents(prev => {
                const updated = [...prev, eventId];
                localStorage.setItem("hidden_registration_events", JSON.stringify(updated));
                return updated;
            });
            queryClient.invalidateQueries({ queryKey: ["registrations-summary", selectedGame] });
            toast({ title: "Success", description: "All registrations for this event have been deleted.", variant: "success" });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const { data: events, isLoading: isEventsLoading } = useQuery({
        queryKey: ["events", selectedGame],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events`);
            if (!response.ok) throw new Error("Failed to fetch events");
            return await response.json();
        }
    });

    const isLoading = isRegistrationsLoading || isEventsLoading;

    useEffect(() => {
        if (registrationSummaries && registrationSummaries.length > 0 && hiddenEvents.length > 0) {
            const eventsWithRegs = new Set(registrationSummaries.map(s => s._id));

            const stillHidden = hiddenEvents.filter(id => !eventsWithRegs.has(id));
            if (stillHidden.length !== hiddenEvents.length) {
                setHiddenEvents(stillHidden);
                localStorage.setItem("hidden_registration_events", JSON.stringify(stillHidden));
            }
        }
    }, [registrationSummaries, hiddenEvents]);

    const handleExport = async (eventId: string, title: string) => {
        setIsExporting(eventId);
        try {
            const token = localStorage.getItem("inferno_token");
            const targetEvent = events?.find((e: any) => e._id === eventId);
            const gameForApi = targetEvent?.game || selectedGame;

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/registrations/game/${encodeURIComponent(gameForApi)}?eventId=${eventId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) throw new Error("Failed to fetch detailed registrations");
            const data = await response.json();
            downloadExcel(data, title);
        } catch (error: any) {
            toast({ title: "Export Error", description: error.message, variant: "destructive" });
        } finally {
            setIsExporting(null);
        }
    };

    const downloadExcel = async (data: Registration[], filenamePrefix: string) => {
        if (!data || data.length === 0) {
            toast({ title: "No Data", description: "No registrations to export", variant: "destructive" });
            return;
        }

        const isValorant = selectedGame === "Valorant";
        let headers = ["Team Name", "Team Size", "Registered On", "Event Title"];
        headers.push("Lead Name", "Lead College ID", "Lead Discord", "Lead Mobile", "Lead Email");

        if (isValorant) {
            headers.push("Lead Riot ID", "Lead Peak Rank", "Lead Current Rank", "Lead Level");
            for (let i = 2; i <= 5; i++) {
                headers.push(`P${i} Name`, `P${i} Email`, `P${i} College ID`, `P${i} Mobile`, `P${i} Riot ID`, `P${i} Peak Rank`, `P${i} Current Rank`, `P${i} Level`);
            }
        } else {
            headers.push("Lead In-Game Name");
            for (let i = 2; i <= 4; i++) {
                headers.push(`P${i} Name`, `P${i} Email`, `P${i} College ID`, `P${i} Mobile`, `P${i} In-Game Name`);
            }
        }

        let csvContent = headers.join(",") + "\n";

        data.forEach((reg) => {
            const row: string[] = [
                `"${reg.teamName}"`,
                String(reg.teamSize),
                format(new Date(reg.createdAt), "yyyy-MM-dd"),
                `"${reg.eventTitle}"`,
                `"${reg.teamLead?.name || ''}"`,
                `"${reg.teamLead?.collegeId || ''}"`,
                `"${reg.teamLead?.discordId || ''}"`,
                `"${reg.teamLead?.mobileNumber || ''}"`,
                `"${reg.teamLead?.email || ''}"`,
            ];

            if (isValorant) {
                row.push(
                    `"${reg.teamLead?.riotId || ''}"`,
                    `"${reg.teamLead?.peakRank || ''}"`,
                    `"${reg.teamLead?.currentRank || ''}"`,
                    `"${reg.teamLead?.level || ''}"`
                );
                [reg.player2, reg.player3, reg.player4, reg.player5].forEach((p) => {
                    row.push(
                        `"${p?.name || ''}"`,
                        `"${p?.email || ''}"`,
                        `"${p?.collegeId || ''}"`,
                        `"${p?.mobileNumber || ''}"`,
                        `"${p?.riotId || ''}"`,
                        `"${p?.peakRank || ''}"`,
                        `"${p?.currentRank || ''}"`,
                        `"${p?.level || ''}"`
                    );
                });
            } else {
                row.push(`"${reg.teamLead?.inGameName || reg.teamLead?.inGameId || ''}"`);
                [reg.player2, reg.player3, reg.player4].forEach((p) => {
                    row.push(
                        `"${p?.name || ''}"`,
                        `"${p?.email || ''}"`,
                        `"${p?.collegeId || ''}"`,
                        `"${p?.mobileNumber || ''}"`,
                        `"${p?.inGameName || p?.inGameId || ''}"`
                    );
                });
            }
            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filenamePrefix.replace(/ /g, "_")}_registrations_${format(new Date(), "yyyy-MM-dd")}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({ title: "Success", description: "Registrations exported successfully!", variant: "success" });
    };

    const displayedEvents = useMemo(() => {
        if (!events) return [];

        const eventIdsWithRegs = new Set(registrationSummaries?.map(s => s._id) || []);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return events
            .filter((e: any) =>
                (selectedGame === "All" || e.game === selectedGame || e.game === "All") &&
                (new Date(e.event_date) >= today || eventIdsWithRegs.has(e._id)) &&
                !hiddenEvents.includes(e._id)
            ).sort((a: any, b: any) => {
                const dateA = new Date(a.event_date).getTime();
                const dateB = new Date(b.event_date).getTime();

                if (dateB !== dateA) {
                    return dateB - dateA;
                }

                const createdAtA = new Date(a.createdAt || a.created_at || 0).getTime();
                const createdAtB = new Date(b.createdAt || b.created_at || 0).getTime();
                return createdAtB - createdAtA;
            });
    }, [events, selectedGame, registrationSummaries, hiddenEvents]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-red-500" />
                    <h2 className="font-display font-bold text-xl text-white uppercase tracking-wider">
                        Event <span className="flame-text">Registrations</span>
                    </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {isSuperAdmin && (
                        <Select value={selectedGame} onValueChange={setSelectedGame}>
                            <SelectTrigger className="w-full sm:w-40 bg-black border-2 border-red-600 text-white focus:ring-0 focus:ring-offset-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                <SelectItem value="All" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">All Games</SelectItem>
                                <SelectItem value="Free Fire" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Free Fire</SelectItem>
                                <SelectItem value="BGMI" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">BGMI</SelectItem>
                                <SelectItem value="Valorant" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Valorant</SelectItem>
                                <SelectItem value="Call Of Duty" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Call Of Duty</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader />
                </div>
            ) : displayedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-red-600 rounded-2xl bg-black/40 w-full relative overflow-hidden group mt-10 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/[0.05] to-transparent pointer-events-none" />
                    <div className="relative">
                        <Trophy className="w-16 h-16 text-red-500 mb-4" style={{ filter: 'drop-shadow(0 0 18px rgba(220, 38, 38, 0.5))' }} />
                    </div>
                    <p className="text-xl font-display font-black uppercase tracking-[0.2em] text-white mb-2">No Registrations Found</p>
                    <p className="text-[11px] text-white/40 font-display mb-8 tracking-widest uppercase max-w-xs mx-auto leading-relaxed">
                        There are no registrations available for <span className="text-red-500 font-bold">{selectedGame}</span>. Upcoming and historical events with registrations will appear here.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {displayedEvents.map((event: any) => {
                        const regSummary = registrationSummaries?.find(s => s._id === event._id);
                        const regCount = regSummary?.count || 0;

                        return (
                            <div
                                key={event._id}
                                className="bg-black rounded-xl p-4 border-2 border-[#FF0000] shadow-[0_0_15px_-5px_rgba(255,0,0,0.3)] relative overflow-hidden flex flex-col gap-4"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

                                <div className="flex flex-col gap-2 min-w-0">
                                    <div className="bg-[#FF0000] border border-[#FF0000] text-white text-[8px] px-2 py-0.5 rounded-full uppercase font-bold tracking-[0.12em] shrink-0 w-fit shadow-[0_0_10px_rgba(255,0,0,0.2)]">
                                        {event.game || selectedGame}
                                    </div>
                                    <h3 className="font-display font-black text-xl text-white uppercase tracking-wider truncate">
                                        {event.title}
                                    </h3>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 z-10 text-[11px] md:text-xs">
                                    <div className="flex items-center gap-1.5 text-gray-300">
                                        <Calendar className="w-4 h-4 text-red-500 shrink-0" />
                                        <span>{format(new Date(event.event_date), "MMM dd, yyyy")}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-300">
                                        <Clock className="w-4 h-4 text-red-500 shrink-0" />
                                        <span>
                                            {format(new Date(event.event_date), "p")}
                                            {event.end_time && ` - ${format(new Date(event.end_time), "p")}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-300">
                                        <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                                        <span className="truncate">{event.location || event.venue || "TBA"}</span>
                                    </div>
                                </div>

                                <div className="w-full flex items-center justify-between mt-5 pt-3 border-t border-[#FF0000]/60">
                                    <div className="flex items-center gap-2.5 text-gray-300">
                                        <Users className="w-4 h-4 text-red-500 shrink-0" />
                                        <span className="text-sm font-bold tracking-tight">
                                            {regCount} / {event.max_participants || '60'} Teams
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isSuperAdmin && (
                                            <Button
                                                size="sm"
                                                className="h-8 px-3 text-[10px] font-bold bg-[#FF0000] hover:bg-red-700 text-white border-0 shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const startDate = new Date(event.event_date);
                                                    const eventEndTime = event.end_time ? new Date(event.end_time) : new Date(event.event_date);
                                                    const targetEndTime = new Date(startDate);
                                                    targetEndTime.setHours(eventEndTime.getHours(), eventEndTime.getMinutes(), eventEndTime.getMilliseconds());
                                                    if (new Date() < targetEndTime) {
                                                        toast({ title: "Delete Restricted", description: `You can only clear data after the event ends (${format(targetEndTime, "MMM dd, p")}).`, variant: "destructive" });
                                                        return;
                                                    }
                                                    setEventToDelete({ id: event._id, title: event.title, game: event.game });
                                                }}
                                                disabled={deleteRegistrationsMutation.isPending}
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" /> Delete Data
                                            </Button>
                                        )}

                                        <Button
                                            size="sm"
                                            className="h-8 px-3 text-[10px] font-bold bg-green-600 hover:bg-green-700 text-white border-0 shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all"
                                            onClick={(e) => { e.stopPropagation(); handleExport(event._id, event.title); }}
                                            disabled={regCount === 0 || isExporting === event._id}
                                        >
                                            {isExporting === event._id ? (
                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            ) : (
                                                <Download className="w-3 h-3 mr-1" />
                                            )}
                                            {isExporting === event._id ? "Exporting..." : "Export Data"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                <AlertDialogContent className="bg-black border-2 border-[#FF0000] rounded-2xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-600" /> Clear Data?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Delete all registrations for <span className="text-red-500 font-bold">{eventToDelete?.title}</span>? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 mt-6">
                        <AlertDialogCancel asChild>
                            <Button variant="ghost" className="flex-1 border-2 border-[#FF0000] text-white hover:bg-[#FF0000] hover:text-white transition-all h-10 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button className="flex-1 bg-[#FF0000] hover:bg-red-700 text-white transition-all h-10 text-[10px] font-bold uppercase tracking-widest" onClick={() => { if (eventToDelete) { deleteRegistrationsMutation.mutate({ eventId: eventToDelete.id, game: eventToDelete.game }); setEventToDelete(null); } }}>Delete Data</Button>
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RegistrationsPanel;

