import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Users, Upload, Loader2, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/ui/Loader";

interface PlayerInfo {
    name: string;
    email: string;
    accountVerified?: boolean;
    collegeId: string;
    mobileNumber: string;
    inGameName?: string;
    riotId?: string;
    peakRank?: string;
    currentRank?: string;
    level?: string;
}

interface TeamLeadInfo {
    name: string;
    collegeId: string;
    discordId: string;
    mobileNumber: string;
    email: string;
    inGameName?: string;
    riotId?: string;
    peakRank?: string;
    currentRank?: string;
    level?: string;
}

const EventRegistration = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();

    const eventId = searchParams.get("eventId");
    const eventTitle = searchParams.get("eventTitle");
    const game = searchParams.get("game");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [teamLogo, setTeamLogo] = useState("");

    const isValorant = game === "Valorant";
    const teamSize = isValorant ? 5 : 4;

    const [teamLead, setTeamLead] = useState<TeamLeadInfo>({
        name: "",
        collegeId: "",
        discordId: "",
        mobileNumber: "",
        email: "",
        inGameName: "",
        riotId: "",
        peakRank: "",
        currentRank: "",
        level: ""
    });

    const [players, setPlayers] = useState<PlayerInfo[]>([
        { name: "", email: "", accountVerified: false, collegeId: "", mobileNumber: "", inGameName: "", riotId: "", peakRank: "", currentRank: "", level: "" },
        { name: "", email: "", accountVerified: false, collegeId: "", mobileNumber: "", inGameName: "", riotId: "", peakRank: "", currentRank: "", level: "" },
        { name: "", email: "", accountVerified: false, collegeId: "", mobileNumber: "", inGameName: "", riotId: "", peakRank: "", currentRank: "", level: "" },
        { name: "", email: "", accountVerified: false, collegeId: "", mobileNumber: "", inGameName: "", riotId: "", peakRank: "", currentRank: "", level: "" }
    ]);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login");
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        if (user && user.role !== 'user') {
            toast({
                title: "Registration Restricted",
                description: "Super Admins and Admins are not allowed to participate in events with their main accounts.",
                variant: "destructive"
            });
            navigate("/events");
        }
    }, [user, navigate, toast]);

    useEffect(() => {
        if (!eventId || !eventTitle || !game) {
            navigate("/events");
        }
    }, [eventId, eventTitle, game, navigate]);

    useEffect(() => {
        if (user) {
            setTeamLead(prev => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
                mobileNumber: user.mobile || "",
                collegeId: user.collegeId || "",
                riotId: user.inGameId || user.inGameName || "",
                inGameName: user.inGameName || ""
            }));
        }
    }, [user]);

    const handlePlayerChange = (index: number, field: keyof PlayerInfo, value: string) => {
        setPlayers(prev => {
            const updated = [...prev];
            // If email changes, reset verification
            if (field === 'email') {
                updated[index] = { ...updated[index], [field]: value, accountVerified: false };
            } else {
                updated[index] = { ...updated[index], [field]: value };
            }
            return updated;
        });
    };

    const verifyMemberAccount = async (index: number, email: string) => {
        if (!email || !email.includes('@')) {
            toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
            return;
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Check if it matches Team Lead
        if (teamLead.email.toLowerCase().trim() === normalizedEmail) {
            toast({
                title: "Duplicate Player",
                description: "This person is already the Team Lead.",
                variant: "destructive"
            });
            return;
        }

        // 2. Check if it's already added as another player
        const isAlreadyAdded = players.some((p, i) =>
            i !== index &&
            p.email.toLowerCase().trim() === normalizedEmail &&
            p.accountVerified
        );

        if (isAlreadyAdded) {
            toast({
                title: "Duplicate Player",
                description: "This player is already part of your team.",
                variant: "destructive"
            });
            return;
        }

        try {
            const token = localStorage.getItem("inferno_token");
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/check-email/${encodeURIComponent(email)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to verify account');

            const data = await response.json();
            if (data.exists) {
                if (data.user.role !== 'user') {
                    toast({
                        title: "Action Restricted",
                        description: "Super Admins and Admins represent the organization and cannot participate as players.",
                        variant: "destructive"
                    });
                    return;
                }

                setPlayers(prev => {
                    const updated = [...prev];
                    updated[index] = {
                        ...updated[index],
                        name: data.user.name || updated[index].name,
                        collegeId: data.user.collegeId || updated[index].collegeId,
                        mobileNumber: data.user.mobile || updated[index].mobileNumber,
                        inGameName: data.user.inGameName || updated[index].inGameName,
                        riotId: data.user.inGameId || data.user.inGameName || updated[index].riotId,
                        accountVerified: true
                    };
                    return updated;
                });
                toast({
                    title: "Details Fetched",
                    description: `Successfully loaded profile for ${data.user.name}`,
                    variant: "success"
                });
            } else {
                toast({ title: "User Not Found", description: "This user has not created an account.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to verify account. Please try again.", variant: "destructive" });
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            toast({
                title: "Uploading...",
                description: "Optimizing and saving your logo.",
                variant: "warning"
            });
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem("inferno_token");
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload/team-logo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload logo');

            const data = await response.json();
            setTeamLogo(data.url);
            toast({
                title: "Success",
                description: "Team logo uploaded!",
                variant: "success"
            });
        } catch (error) {
            toast({ title: "Error", description: "Failed to upload logo", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Verify all required players have accounts
        const requiredPlayers = players.slice(0, teamSize - 1);
        const unverified = requiredPlayers.filter(p => !p.accountVerified);

        if (unverified.length > 0) {
            toast({
                title: "Incomplete Verification",
                description: "All team members must have a registered account on the platform.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("inferno_token");

            const registrationData: any = {
                eventId,
                eventTitle,
                game,
                teamName,
                teamSize,
                teamLogo,
                teamLead: isValorant ? {
                    name: teamLead.name,
                    collegeId: teamLead.collegeId,
                    discordId: teamLead.discordId,
                    mobileNumber: teamLead.mobileNumber,
                    email: teamLead.email,
                    riotId: teamLead.riotId,
                    peakRank: teamLead.peakRank,
                    currentRank: teamLead.currentRank,
                    level: teamLead.level
                } : {
                    name: teamLead.name,
                    collegeId: teamLead.collegeId,
                    discordId: teamLead.discordId,
                    mobileNumber: teamLead.mobileNumber,
                    email: teamLead.email,
                    inGameName: teamLead.inGameName
                },
                player2: isValorant ? {
                    name: players[0].name,
                    email: players[0].email,
                    collegeId: players[0].collegeId,
                    mobileNumber: players[0].mobileNumber,
                    riotId: players[0].riotId,
                    peakRank: players[0].peakRank,
                    currentRank: players[0].currentRank,
                    level: players[0].level
                } : {
                    name: players[0].name,
                    email: players[0].email,
                    collegeId: players[0].collegeId,
                    mobileNumber: players[0].mobileNumber,
                    inGameName: players[0].inGameName
                },
                player3: isValorant ? {
                    name: players[1].name,
                    email: players[1].email,
                    collegeId: players[1].collegeId,
                    mobileNumber: players[1].mobileNumber,
                    riotId: players[1].riotId,
                    peakRank: players[1].peakRank,
                    currentRank: players[1].currentRank,
                    level: players[1].level
                } : {
                    name: players[1].name,
                    email: players[1].email,
                    collegeId: players[1].collegeId,
                    mobileNumber: players[1].mobileNumber,
                    inGameName: players[1].inGameName
                },
                player4: isValorant ? {
                    name: players[2].name,
                    email: players[2].email,
                    collegeId: players[2].collegeId,
                    mobileNumber: players[2].mobileNumber,
                    riotId: players[2].riotId,
                    peakRank: players[2].peakRank,
                    currentRank: players[2].currentRank,
                    level: players[2].level
                } : {
                    name: players[2].name,
                    email: players[2].email,
                    collegeId: players[2].collegeId,
                    mobileNumber: players[2].mobileNumber,
                    inGameName: players[2].inGameName
                }
            };

            if (isValorant) {
                registrationData.player5 = {
                    name: players[3].name,
                    email: players[3].email,
                    collegeId: players[3].collegeId,
                    mobileNumber: players[3].mobileNumber,
                    riotId: players[3].riotId,
                    peakRank: players[3].peakRank,
                    currentRank: players[3].currentRank,
                    level: players[3].level
                };
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/registrations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(registrationData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Registration failed');
            }

            toast({
                title: "Registration Successful!",
                description: "Your team has been registered for the event.",
                variant: "success"
            });

            navigate("/profile?view=events");
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b-2 border-[#FF0000]">
                <div className="container mx-auto px-4">
                    <div className="flex items-center h-16">
                        <button
                            onClick={() => navigate("/events")}
                            className="flex items-center gap-2 text-white hover:text-red-500 transition-colors font-display uppercase tracking-wider text-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Events
                        </button>
                    </div>
                </div>
            </div>

            {/* Form */}
            <main className="container mx-auto px-4 py-8 pb-24 md:pb-12 max-w-3xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF0000] border border-[#FF0000] mb-4 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                        <Gamepad2 className="w-5 h-5 text-white" />
                        <span className="font-display uppercase tracking-wider text-sm text-white">{game}</span>
                    </div>
                    <h1 className="font-display font-bold text-3xl md:text-4xl text-white uppercase mb-2">
                        Event Registration
                    </h1>
                    <p className="text-muted-foreground font-body">
                        {eventTitle}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Team Info */}
                    <div className="glass-dark rounded-xl p-6 border-2 border-[#FF0000] space-y-6">
                        <h2 className="font-display font-bold text-xl text-white uppercase flex items-center gap-2">
                            <Users className="w-5 h-5 text-red-500" />
                            Team Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Team Name *</Label>
                                <Input
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500 font-display uppercase text-xs tracking-wider">
                                    Total Team Size (Including You) *
                                </Label>
                                <Input
                                    value={teamSize}
                                    readOnly
                                    className="bg-black/50 border border-red-600/30 text-white/70 cursor-not-allowed focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                        </div>

                        {/* Team Logo Upload */}
                        <div className="space-y-2">
                            <Label className="text-red-500 font-display uppercase text-xs tracking-wider">
                                Upload Team Logo (Optional)
                            </Label>
                            <div className="flex items-center gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-red-600/50 rounded-lg hover:border-red-600 hover:bg-red-600/5 transition-all">
                                        {isUploading ? (
                                            <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                                        ) : (
                                            <Upload className="w-5 h-5 text-red-500" />
                                        )}
                                        <span className="text-white/70 text-sm">
                                            {teamLogo ? "Logo uploaded ✓" : "Click to upload"}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                </label>
                                {teamLogo && (
                                    <img src={teamLogo} alt="Team Logo" className="w-12 h-12 rounded-lg object-cover border border-red-600" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Team Lead */}
                    <div className="glass-dark rounded-xl p-6 border-2 border-[#FF0000] space-y-6">
                        <h2 className="font-display font-bold text-xl text-white uppercase">
                            Team Lead (Player 1)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Name *</Label>
                                <Input
                                    value={teamLead.name}
                                    onChange={(e) => setTeamLead({ ...teamLead, name: e.target.value })}
                                    className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500 font-display uppercase text-xs tracking-wider">College ID *</Label>
                                <Input
                                    value={teamLead.collegeId}
                                    onChange={(e) => setTeamLead({ ...teamLead, collegeId: e.target.value })}
                                    className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Discord ID *</Label>
                                <Input
                                    value={teamLead.discordId}
                                    onChange={(e) => setTeamLead({ ...teamLead, discordId: e.target.value })}
                                    className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Mobile Number *</Label>
                                <Input
                                    value={teamLead.mobileNumber}
                                    onChange={(e) => setTeamLead({ ...teamLead, mobileNumber: e.target.value })}
                                    className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                    required
                                    maxLength={10}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Email ID *</Label>
                                <Input
                                    type="email"
                                    value={teamLead.email}
                                    onChange={(e) => setTeamLead({ ...teamLead, email: e.target.value })}
                                    className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                    required
                                />
                            </div>
                            {isValorant ? (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Riot ID *</Label>
                                        <Input
                                            value={teamLead.riotId}
                                            onChange={(e) => setTeamLead({ ...teamLead, riotId: e.target.value })}
                                            className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Peak Rank *</Label>
                                        <Input
                                            value={teamLead.peakRank}
                                            onChange={(e) => setTeamLead({ ...teamLead, peakRank: e.target.value })}
                                            className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Current Rank *</Label>
                                        <Input
                                            value={teamLead.currentRank}
                                            onChange={(e) => setTeamLead({ ...teamLead, currentRank: e.target.value })}
                                            className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Level *</Label>
                                        <Input
                                            value={teamLead.level}
                                            onChange={(e) => setTeamLead({ ...teamLead, level: e.target.value })}
                                            className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                            required
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="text-red-500 font-display uppercase text-xs tracking-wider">In-Game Name *</Label>
                                    <Input
                                        value={teamLead.inGameName}
                                        onChange={(e) => setTeamLead({ ...teamLead, inGameName: e.target.value })}
                                        className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Other Players */}
                    {[...Array(teamSize - 1)].map((_, idx) => (
                        <div key={idx} className="glass-dark rounded-xl p-6 border-2 border-[#FF0000] space-y-6">
                            <h2 className="font-display font-bold text-xl text-white uppercase">
                                Player {idx + 2}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4 col-span-1 md:col-span-2">
                                    <div className="space-y-2">
                                        <Label className="text-red-500 font-display uppercase text-xs tracking-wider flex items-center justify-between">
                                            Email ID *
                                            {players[idx]?.accountVerified ? (
                                                <span className="text-green-500 font-bold lowercase italic">verified</span>
                                            ) : players[idx]?.email && players[idx]?.email.includes('@') ? (
                                                <span className="text-yellow-500 font-bold lowercase italic">check now</span>
                                            ) : (
                                                <span className="text-red-600/50 font-bold lowercase italic">required</span>
                                            )}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="email"
                                                value={players[idx]?.email || ""}
                                                onChange={(e) => handlePlayerChange(idx, "email", e.target.value)}
                                                placeholder="Enter member's account email"
                                                className={`bg-black border focus-visible:ring-0 focus-visible:ring-offset-0 outline-none ${players[idx]?.accountVerified ? "border-green-600/50 focus:border-green-600" : "border-[#FF0000] focus:border-[#FF0000]"
                                                    }`}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => verifyMemberAccount(idx, players[idx]?.email)}
                                                className="border-[#FF0000] text-[#FF0000] hover:bg-[#FF0000] hover:text-white shrink-0 transition-all duration-300"
                                                disabled={!players[idx]?.email || !players[idx]?.email.includes('@')}
                                            >
                                                Check
                                            </Button>
                                        </div>
                                    </div>
                                    {!players[idx]?.accountVerified && players[idx]?.email && players[idx]?.email.includes('@') && (
                                        <p className="text-[10px] text-red-600 font-medium italic">
                                            Note: This player must have a registered account on the platform.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Player Name *</Label>
                                    <Input
                                        value={players[idx]?.name || ""}
                                        onChange={(e) => handlePlayerChange(idx, "name", e.target.value)}
                                        className={`bg-black border focus-visible:ring-0 focus-visible:ring-offset-0 outline-none ${players[idx]?.accountVerified ? "border-green-600/30 text-white/50 cursor-not-allowed" : "border-[#FF0000] text-white focus:border-[#FF0000]"
                                            }`}
                                        required
                                        readOnly={players[idx]?.accountVerified}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-red-500 font-display uppercase text-xs tracking-wider">College ID *</Label>
                                    <Input
                                        value={players[idx]?.collegeId || ""}
                                        onChange={(e) => handlePlayerChange(idx, "collegeId", e.target.value)}
                                        className={`bg-black border focus-visible:ring-0 focus-visible:ring-offset-0 outline-none ${players[idx]?.accountVerified ? "border-green-600/30 text-white/50 cursor-not-allowed" : "border-[#FF0000] text-white focus:border-[#FF0000]"
                                            }`}
                                        required
                                        readOnly={players[idx]?.accountVerified}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Mobile Number *</Label>
                                    <Input
                                        value={players[idx]?.mobileNumber || ""}
                                        onChange={(e) => handlePlayerChange(idx, "mobileNumber", e.target.value)}
                                        className={`bg-black border focus-visible:ring-0 focus-visible:ring-offset-0 outline-none ${players[idx]?.accountVerified ? "border-green-600/30 text-white/50 cursor-not-allowed" : "border-[#FF0000] text-white focus:border-[#FF0000]"
                                            }`}
                                        required
                                        maxLength={10}
                                        readOnly={players[idx]?.accountVerified}
                                    />
                                </div>
                                {isValorant ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Riot ID *</Label>
                                            <Input
                                                value={players[idx]?.riotId || ""}
                                                onChange={(e) => handlePlayerChange(idx, "riotId", e.target.value)}
                                                className={`bg-black border focus-visible:ring-0 focus-visible:ring-offset-0 outline-none ${players[idx]?.accountVerified ? "border-green-600/30 text-white/50 cursor-not-allowed" : "border-[#FF0000] text-white focus:border-[#FF0000]"
                                                    }`}
                                                required
                                                readOnly={players[idx]?.accountVerified}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Peak Rank *</Label>
                                            <Input
                                                value={players[idx]?.peakRank || ""}
                                                onChange={(e) => handlePlayerChange(idx, "peakRank", e.target.value)}
                                                className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Current Rank *</Label>
                                            <Input
                                                value={players[idx]?.currentRank || ""}
                                                onChange={(e) => handlePlayerChange(idx, "currentRank", e.target.value)}
                                                className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-red-500 font-display uppercase text-xs tracking-wider">Level *</Label>
                                            <Input
                                                value={players[idx]?.level || ""}
                                                onChange={(e) => handlePlayerChange(idx, "level", e.target.value)}
                                                className="bg-black border border-[#FF0000] focus:border-[#FF0000] text-white focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                                                required
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <Label className="text-red-500 font-display uppercase text-xs tracking-wider">In-Game Name *</Label>
                                        <Input
                                            value={players[idx]?.inGameName || ""}
                                            onChange={(e) => handlePlayerChange(idx, "inGameName", e.target.value)}
                                            className={`bg-black border focus-visible:ring-0 focus-visible:ring-offset-0 outline-none ${players[idx]?.accountVerified ? "border-green-600/30 text-white/50 cursor-not-allowed" : "border-[#FF0000] text-white focus:border-[#FF0000]"
                                                }`}
                                            required
                                            readOnly={players[idx]?.accountVerified}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="flame"
                        className="w-full h-14 text-lg font-display uppercase tracking-widest"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Registration"
                        )}
                    </Button>
                </form>
            </main>
        </div>
    );
};

export default EventRegistration;
