import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    Download, Users, Calendar, Trophy, MapPin, Clock, Trash2, Loader2,
    ChevronDown, ChevronUp, Search, Shield, Gamepad2, Mail, Phone, Hash, X
} from "lucide-react";
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

// ─── Player Detail Row ───────────────────────
const PlayerDetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 text-[11px] text-gray-300">
            <Icon className="w-3 h-3 text-[#FF0000] shrink-0" />
            <span className="text-white/40 min-w-[65px]">{label}:</span>
            <span className="text-white/90 truncate">{value}</span>
        </div>
    );
};

// ─── Single Player Card ───────────────────────
const PlayerCard = ({ player, role, isValorant }: { player: any; role: string; isValorant: boolean }) => {
    if (!player || !player.name) return null;
    const isLead = role === "Team Lead";

    return (
        <div className="bg-white/[0.03] rounded-lg p-3 border border-[#FF0000] transition-colors">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${isLead ? 'bg-red-600 text-white' : 'bg-white/10 text-white/60'}`}>
                    {isLead ? <Shield className="w-3 h-3" /> : role.replace("Player ", "P")}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{player.name}</p>
                    <p className="text-[9px] text-[#FF0000] uppercase tracking-widest font-bold">{role}</p>
                </div>
            </div>
            <div className="space-y-1.5 pl-0 sm:pl-8">
                <PlayerDetailRow icon={Mail} label="Email" value={player.email} />
                <PlayerDetailRow icon={Hash} label="College ID" value={player.collegeId} />
                <PlayerDetailRow icon={Phone} label="Mobile" value={player.mobileNumber} />
                {isLead && player.discordId && (
                    <PlayerDetailRow icon={Gamepad2} label="Discord" value={player.discordId} />
                )}
                {isValorant ? (
                    <>
                        <PlayerDetailRow icon={Gamepad2} label="Riot ID" value={player.riotId} />
                        <PlayerDetailRow icon={Trophy} label="Peak Rank" value={player.peakRank} />
                        <PlayerDetailRow icon={Trophy} label="Curr Rank" value={player.currentRank} />
                        <PlayerDetailRow icon={Hash} label="Level" value={player.level} />
                    </>
                ) : (
                    <PlayerDetailRow icon={Gamepad2} label="IGN" value={player.inGameName || player.inGameId} />
                )}
            </div>
        </div>
    );
};

// ─── Team Registration Card ───────────────────
const TeamCard = ({
    registration,
    isValorant,
    onDelete,
    isDeleting,
    expanded,
    onToggle,
}: {
    registration: Registration;
    isValorant: boolean;
    onDelete: (id: string, teamName: string) => void;
    isDeleting: boolean;
    expanded: boolean;
    onToggle: () => void;
}) => {

    const players = [
        { data: registration.teamLead, role: "Team Lead" },
        { data: registration.player2, role: "Player 2" },
        { data: registration.player3, role: "Player 3" },
        { data: registration.player4, role: "Player 4" },
        ...(isValorant && registration.player5 ? [{ data: registration.player5, role: "Player 5" }] : []),
    ].filter(p => p.data && p.data.name);

    return (
        <div className="bg-black/60 rounded-xl border border-[#FF0000] hover:border-2 hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] transition-all overflow-hidden">
            {/* Team Header */}
            <div
                className="flex items-center justify-between p-3 cursor-pointer select-none group"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600/20 to-red-900/20 border border-[#FF0000] flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-[#FF0000]" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-[#FF0000] transition-colors">
                            {registration.teamName}
                        </h4>
                        <div className="flex items-center justify-start gap-2 text-[10px] text-white/40">
                            <span>{registration.teamSize} Players</span>
                            <span>•</span>
                            <span>{format(new Date(registration.createdAt), "MMM dd, yyyy 'at' p")}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        size="sm"
                        className="h-8 px-1.5 sm:px-3 text-[10px] font-bold bg-[#FF0000] hover:bg-red-700 text-white border-0 shadow-[0_0_8px_rgba(255,0,0,0.3)] transition-all rounded-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(registration._id, registration.teamName);
                        }}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 sm:mr-1 animate-spin" />
                        ) : (
                            <Trash2 className="w-3.5 h-3.5 sm:mr-1" />
                        )}
                        <span className="hidden sm:inline">Delete</span>
                    </Button>
                    <div className="text-white/30 group-hover:text-red-500/60 transition-colors">
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </div>
            </div>

            {/* Expanded Player Details */}
            {expanded && (
                <div className="px-3 pb-3 border-t border-[#FF0000]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                        {players.map((p, idx) => (
                            <PlayerCard key={idx} player={p.data} role={p.role} isValorant={isValorant} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Expanded Event Registrations Section ─────
const EventRegistrationsSection = ({
    eventId,
    eventGame,
    selectedGame,
    onDeleteTeam,
    deletingTeamId,
}: {
    eventId: string;
    eventGame: string;
    selectedGame: string;
    onDeleteTeam: (id: string, teamName: string, game: string) => void;
    deletingTeamId: string | null;
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

    const gameForApi = eventGame || selectedGame;
    const isValorant = gameForApi === "Valorant";

    const { data: registrations, isLoading } = useQuery({
        queryKey: ["event-registrations", eventId, gameForApi],
        queryFn: async () => {
            const token = localStorage.getItem("inferno_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/registrations/game/${encodeURIComponent(gameForApi)}?eventId=${eventId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error("Failed to fetch registrations");
            return response.json() as Promise<Registration[]>;
        },
    });

    const filteredRegistrations = useMemo(() => {
        if (!registrations) return [];
        if (!searchQuery.trim()) return registrations;

        const q = searchQuery.toLowerCase();
        return registrations.filter((reg) => {
            if (reg.teamName.toLowerCase().includes(q)) return true;
            const allPlayers = [reg.teamLead, reg.player2, reg.player3, reg.player4, reg.player5].filter(Boolean);
            return allPlayers.some(
                (p: any) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.email?.toLowerCase().includes(q) ||
                    p.collegeId?.toLowerCase().includes(q) ||
                    p.inGameName?.toLowerCase().includes(q) ||
                    p.riotId?.toLowerCase().includes(q)
            );
        });
    }, [registrations, searchQuery]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
            </div>
        );
    }

    if (!registrations || registrations.length === 0) {
        return (
            <div className="text-center py-6 text-white/30 text-xs uppercase tracking-widest">
                No registrations found
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#FF0000]" />
                <input
                    type="text"
                    placeholder="Search by team name, player name, email, college ID, IGN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-white/[0.04] border-2 border-[#FF0000] rounded-lg text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#FF0000] transition-colors"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Results count */}
            <div className="text-[10px] text-white/30 uppercase tracking-widest px-1">
                Showing {filteredRegistrations.length} of {registrations.length} teams
            </div>

            {/* Team cards */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-red-500/20 scrollbar-track-transparent">
                {filteredRegistrations.map((reg) => (
                    <TeamCard
                        key={reg._id}
                        registration={reg}
                        isValorant={isValorant}
                        onDelete={(id, teamName) => onDeleteTeam(id, teamName, gameForApi)}
                        isDeleting={deletingTeamId === reg._id}
                        expanded={expandedTeamId === reg._id}
                        onToggle={() => setExpandedTeamId(expandedTeamId === reg._id ? null : reg._id)}
                    />
                ))}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════
// ─── Main Registrations Panel ─────────────────
// ═══════════════════════════════════════════════
const RegistrationsPanel = ({ game, isSuperAdmin = false }: RegistrationsPanelProps) => {
    const [selectedGame, setSelectedGame] = useState(game);
    const [isExporting, setIsExporting] = useState<string | null>(null);
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
    const eventRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string; game: string } | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<{ id: string; teamName: string; game: string; eventId: string } | null>(null);
    const [hiddenEvents, setHiddenEvents] = useState<string[]>(() => {
        const saved = localStorage.getItem("hidden_registration_events");
        return saved ? JSON.parse(saved) : [];
    });

    // Scroll expanded event card into view — ensure bottom border visible with gap
    useEffect(() => {
        if (expandedEventId) {
            const scrollToCard = () => {
                const el = eventRefs.current[expandedEventId];
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const bottomGap = 80; // gap below the bottom border
                // Calculate where the bottom of the box is
                const bottomVisible = rect.bottom <= viewportHeight - bottomGap;
                const topVisible = rect.top >= 0;
                if (topVisible && bottomVisible) return; // already fully visible with gap
                if (rect.height <= viewportHeight - bottomGap * 2) {
                    // Box fits in viewport — center it
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    // Box taller than viewport — show bottom border with generous gap
                    const scrollTarget = window.scrollY + rect.bottom - viewportHeight + bottomGap;
                    window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
                }
            };
            // First scroll after expand toggle
            setTimeout(scrollToCard, 250);
            // Second scroll after teams data loads (React Query fetch)
            setTimeout(scrollToCard, 600);
        }
    }, [expandedEventId]);

    // Click outside expanded event card → collapse it
    useEffect(() => {
        if (!expandedEventId) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Don't close if clicking inside a dialog/portal overlay
            if (target.closest('[role="alertdialog"]') || target.closest('[data-radix-popper-content-wrapper]') || target.closest('[role="dialog"]')) return;
            // Don't close if clicking inside the expanded event card
            const expandedEl = eventRefs.current[expandedEventId];
            if (expandedEl && expandedEl.contains(target)) return;
            setExpandedEventId(null);
        };
        // Use mousedown so it fires before any button click handlers
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [expandedEventId]);

    const { data: registrationSummaries, isLoading: isRegistrationsLoading } = useQuery({
        queryKey: ["registrations-summary", selectedGame],
        queryFn: async () => {
            const token = localStorage.getItem("inferno_token");
            let url = `${import.meta.env.VITE_API_BASE_URL}/api/registrations/all-summary`;
            if (selectedGame !== 'All') {
                url = `${import.meta.env.VITE_API_BASE_URL}/api/registrations/events/summary?game=${encodeURIComponent(selectedGame)}`;
            }
            const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok) throw new Error("Failed to fetch summaries");
            return response.json() as Promise<{ _id: string; count: number }[]>;
        },
    });

    // Delete ALL registrations for an event
    const deleteRegistrationsMutation = useMutation({
        mutationFn: async ({ eventId, game }: { eventId: string; game: string }) => {
            const token = localStorage.getItem("inferno_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/registrations/event/${eventId}?game=${encodeURIComponent(game)}`,
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
            setExpandedEventId(null);
            queryClient.invalidateQueries({ queryKey: ["registrations-summary", selectedGame] });
            toast({ title: "Success", description: "All registrations for this event have been deleted.", variant: "success" });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    // Delete a SINGLE team registration
    const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
    const deleteTeamMutation = useMutation({
        mutationFn: async ({ id, game }: { id: string; game: string }) => {
            const token = localStorage.getItem("inferno_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/registrations/${id}?game=${encodeURIComponent(game)}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to delete registration");
            }
            return response.json();
        },
        onSuccess: () => {
            setDeletingTeamId(null);
            queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
            queryClient.invalidateQueries({ queryKey: ["registrations-summary", selectedGame] });
            toast({ title: "Deleted", description: "Team registration removed successfully.", variant: "success" });
        },
        onError: (error: any) => {
            setDeletingTeamId(null);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const { data: events, isLoading: isEventsLoading } = useQuery({
        queryKey: ["events", selectedGame],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events`);
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
                `${import.meta.env.VITE_API_BASE_URL}/api/registrations/game/${encodeURIComponent(gameForApi)}?eventId=${eventId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) throw new Error("Failed to fetch detailed registrations");
            const data = await response.json();
            downloadExcel(data, title, gameForApi);
        } catch (error: any) {
            toast({ title: "Export Error", description: error.message, variant: "destructive" });
        } finally {
            setIsExporting(null);
        }
    };

    const downloadExcel = async (data: Registration[], filenamePrefix: string, gameForExport?: string) => {
        if (!data || data.length === 0) {
            toast({ title: "No Data", description: "No registrations to export", variant: "destructive" });
            return;
        }

        const exportGame = gameForExport || selectedGame;
        const isValorant = exportGame === "Valorant";
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
                if (dateB !== dateA) return dateB - dateA;
                const createdAtA = new Date(a.createdAt || a.created_at || 0).getTime();
                const createdAtB = new Date(b.createdAt || b.created_at || 0).getTime();
                return createdAtB - createdAtA;
            });
    }, [events, selectedGame, registrationSummaries, hiddenEvents]);

    const handleDeleteTeamRequest = (id: string, teamName: string, game: string) => {
        const eventId = expandedEventId || "";
        setTeamToDelete({ id, teamName, game, eventId });
    };

    const confirmDeleteTeam = () => {
        if (!teamToDelete) return;
        setDeletingTeamId(teamToDelete.id);
        deleteTeamMutation.mutate({ id: teamToDelete.id, game: teamToDelete.game });
        setTeamToDelete(null);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-red-500" />
                    <h2 className="font-display font-black text-2xl uppercase tracking-[0.15em]">
                        <span className="text-white">Event </span><span className="flame-text">Registrations</span>
                    </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {isSuperAdmin && (
                        <Select value={selectedGame} onValueChange={(val) => { setSelectedGame(val); setExpandedEventId(null); }}>
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

            {/* Content */}
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
                <div className="flex flex-col gap-4 pb-8">
                    {displayedEvents.map((event: any) => {
                        const regSummary = registrationSummaries?.find((s: any) => s._id === event._id);
                        const regCount = regSummary?.count || 0;
                        const isExpanded = expandedEventId === event._id;

                        return (
                            <div
                                key={event._id}
                                ref={(el) => { eventRefs.current[event._id] = el; }}
                                className="bg-black rounded-xl border-2 border-[#FF0000] shadow-[0_0_15px_-5px_rgba(255,0,0,0.3)] relative overflow-hidden transition-all scroll-mt-4"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

                                {/* Event header */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3 min-w-0">
                                        <div className="flex flex-col gap-2 min-w-0 flex-1">
                                            <div className="bg-[#FF0000] border border-[#FF0000] text-white text-[8px] px-2 py-0.5 rounded-full uppercase font-bold tracking-[0.12em] shrink-0 w-fit shadow-[0_0_10px_rgba(255,0,0,0.2)]">
                                                {event.game || selectedGame}
                                            </div>
                                            <h3 className="font-display font-black text-xl text-white uppercase tracking-wider truncate">
                                                {event.title}
                                            </h3>
                                        </div>
                                        {/* Teams count badge - right corner, fully colored with icon */}
                                        <div className="bg-[#FF0000] rounded-lg px-3 py-1.5 flex items-center gap-2 shrink-0 shadow-[0_0_12px_rgba(255,0,0,0.3)]">
                                            <Users className="w-4 h-4 text-white" />
                                            <span className="text-white text-xs font-bold tracking-wide">
                                                {regCount} / {event.max_participants || '60'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-2 z-10 text-[11px] md:text-xs mt-3">
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

                                    {/* Actions row */}
                                    <div className="w-full mt-4 pt-3 border-t border-[#FF0000]">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0 sm:gap-2">
                                            {/* View Teams button - centered below on mobile, left on desktop */}
                                            <button
                                                className="order-2 sm:order-1 flex items-center justify-center sm:justify-start w-full sm:w-auto gap-2 text-xs transition-colors py-2 mt-3 sm:mt-0 cursor-pointer"
                                                onClick={() => setExpandedEventId(isExpanded ? null : event._id)}
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="w-4 h-4 text-[#FF0000]" />
                                                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#FF0000]">Hide Teams</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4 text-[#FF0000]" />
                                                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#FF0000]">
                                                            {regCount > 0 ? `View ${regCount} Teams` : "No Teams Yet"}
                                                        </span>
                                                    </>
                                                )}
                                            </button>

                                            {/* Delete & Export buttons - row on mobile (above), right on desktop */}
                                            <div className="order-1 sm:order-2 flex items-center justify-between sm:justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    className="h-9 px-4 text-xs font-bold bg-[#FF0000] hover:bg-red-700 text-white border-0 shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all rounded-lg"
                                                    onClick={() => {
                                                        const eventEndTime = event.end_time ? new Date(event.end_time) : new Date(event.event_date);
                                                        if (new Date() < eventEndTime) {
                                                            toast({ title: "Delete Restricted", description: `You can only clear data after the event ends (${format(eventEndTime, "MMM dd, yyyy 'at' p")}).`, variant: "destructive" });
                                                            return;
                                                        }
                                                        setEventToDelete({ id: event._id, title: event.title, game: event.game });
                                                    }}
                                                    disabled={deleteRegistrationsMutation.isPending}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete All
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="h-9 px-4 text-xs font-bold bg-green-600 hover:bg-green-700 text-white border-0 shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all rounded-lg"
                                                    onClick={() => handleExport(event._id, event.title)}
                                                    disabled={regCount === 0 || isExporting === event._id}
                                                >
                                                    {isExporting === event._id ? (
                                                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                                    ) : (
                                                        <Download className="w-4 h-4 mr-1.5" />
                                                    )}
                                                    {isExporting === event._id ? "Exporting..." : "Export CSV"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded: show all registered teams */}
                                {isExpanded && regCount > 0 && (
                                    <div className="px-4 pb-4 border-t border-[#FF0000]">
                                        <div className="mt-4">
                                            <EventRegistrationsSection
                                                eventId={event._id}
                                                eventGame={event.game}
                                                selectedGame={selectedGame}
                                                onDeleteTeam={handleDeleteTeamRequest}
                                                deletingTeamId={deletingTeamId}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete ALL registrations dialog */}
            <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                <AlertDialogContent className="bg-black border-2 border-[#FF0000] rounded-2xl p-5 sm:p-8 max-w-[calc(100vw-2rem)] sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                            <Trash2 className="w-5 h-5 text-red-600 shrink-0" /> Clear All Data?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 mt-2 text-sm">
                            Delete <span className="text-red-500 font-bold">all registrations</span> for <span className="text-red-500 font-bold">{eventToDelete?.title}</span>? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex items-center justify-between gap-4 sm:gap-6 mt-6 sm:mt-8">
                        <AlertDialogCancel asChild>
                            <Button variant="ghost" className="border-2 border-[#FF0000] text-white hover:bg-[#FF0000] hover:text-white transition-all h-10 sm:h-11 px-4 sm:px-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button className="bg-[#FF0000] hover:bg-red-700 text-white transition-all h-10 sm:h-11 px-4 sm:px-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 sm:gap-2" onClick={() => { if (eventToDelete) { deleteRegistrationsMutation.mutate({ eventId: eventToDelete.id, game: eventToDelete.game }); setEventToDelete(null); } }}><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> Delete All</Button>
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete SINGLE team dialog */}
            <AlertDialog open={!!teamToDelete} onOpenChange={(open) => !open && setTeamToDelete(null)}>
                <AlertDialogContent className="bg-black border-2 border-[#FF0000] rounded-2xl p-5 sm:p-8 max-w-[calc(100vw-2rem)] sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                            <Trash2 className="w-5 h-5 text-red-600 shrink-0" /> Remove Team?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 mt-2 text-sm">
                            Remove team <span className="text-red-500 font-bold">&ldquo;{teamToDelete?.teamName}&rdquo;</span> from this event? This will also remove the registration from all team members&apos; profiles. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex items-center justify-between gap-4 sm:gap-6 mt-6 sm:mt-8">
                        <AlertDialogCancel asChild>
                            <Button variant="ghost" className="border-2 border-[#FF0000] text-white hover:bg-[#FF0000] hover:text-white transition-all h-10 sm:h-11 px-4 sm:px-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button className="bg-[#FF0000] hover:bg-red-700 text-white transition-all h-10 sm:h-11 px-4 sm:px-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 sm:gap-2" onClick={confirmDeleteTeam}><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> Remove</Button>
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RegistrationsPanel;
