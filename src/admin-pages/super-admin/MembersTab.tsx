import { useState } from "react";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Eye, Search, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/utils/apiClient";

interface Member {
    id: string;
    username: string;
    name?: string;
    email?: string;
    inGameName?: string;
    collegeId?: string;
    mobile?: string;
    full_name?: string;
    created_at?: string;
    createdAt?: string;
    game?: string;
    gameYouPlay?: string;
    role?: string;
    user_roles?: { role: string }[];
    bio?: string;
}

interface MembersTabProps {
    members: Member[];
}

export const MembersTab = ({ members }: MembersTabProps) => {
    // Normalize incoming members so we always have `id` (backend may return `_id`)
    const normalizedMembers = (members || []).map((m: any) => ({ ...m, id: m.id || m._id }));
    const [gameFilter, setGameFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [deletingMember, setDeletingMember] = useState<Member | null>(null);
    const [formData, setFormData] = useState<Partial<Member>>({});
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user } = useAuth();


    const filteredMembers = (normalizedMembers?.filter((member: any) => {
        // Exclude current user
        if (member.email === user?.email || member.id === user?.id) return false;

        // Exclude all admins and super admins from members tab
        if (member.role && (member.role === 'super_admin' || member.role.startsWith('admin_'))) return false;

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = member.name?.toLowerCase().includes(query) || false;
            const matchesEmail = member.email?.toLowerCase().includes(query) || false;
            const matchesInGameName = member.inGameName?.toLowerCase().includes(query) || false;
            const matchesCollegeId = member.collegeId?.toLowerCase().includes(query) || false;

            if (!matchesName && !matchesEmail && !matchesInGameName && !matchesCollegeId) {
                return false;
            }
        }

        // Apply game filter
        if (gameFilter === "all") return true;
        return member.game === gameFilter || member.gameYouPlay === gameFilter;
    }) || []).sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
        return dateB - dateA;
    });

    const handleEdit = (member: any) => {
        const normalized = { ...member, id: member.id || member._id };
        setEditingMember(normalized);
        setFormData({
            name: normalized.name,
            username: normalized.username,
            email: normalized.email,
            inGameName: normalized.inGameName,
            collegeId: normalized.collegeId,
            mobile: normalized.mobile,
            gameYouPlay: normalized.gameYouPlay || normalized.game,
            bio: normalized.bio,
            createdAt: normalized.createdAt || normalized.created_at,
        });
    };

    const handleUpdate = async () => {
        if (!editingMember) return;

        try {
            const res = await api.put(`/users/${editingMember.id}`, formData);

            toast({
                title: "Success",
                description: res.message || "Member updated successfully",
                variant: "success",
            });

            queryClient.invalidateQueries({ queryKey: ["admin-members"] });
            setEditingMember(null);
        } catch (error) {
            const message = error?.message || "Failed to update member";
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!deletingMember) return;

        try {
            const token = localStorage.getItem("inferno_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/users/${deletingMember.id}`,
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

    return (
        <div className="space-y-6">
            {/* Desktop: All in one row */}
            <div className="hidden md:flex justify-between items-center gap-4">
                <h2 className="font-display text-3xl font-bold whitespace-nowrap">Members</h2>
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                    <Input
                        placeholder="Search by name, email, game tag, ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 w-full h-11 text-base bg-black border-2 border-red-600 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-[0_0_10px_rgba(220,38,38,0.1)]"
                    />
                </div>
                <div className="flex items-center">
                    <Select value={gameFilter} onValueChange={setGameFilter}>
                        <SelectTrigger className="w-[150px] bg-black border-2 border-red-600 h-11 focus:ring-0 focus:ring-offset-0">
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
            </div>
            {/* Mobile: Stacked */}
            <div className="md:hidden space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="font-display text-2xl font-bold">Members</h2>
                    <Select value={gameFilter} onValueChange={setGameFilter}>
                        <SelectTrigger className="w-[140px] bg-black border-2 border-red-600 h-10 focus:ring-0 focus:ring-offset-0">
                            <SelectValue placeholder="All Games" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                            <SelectItem value="all" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">All Games</SelectItem>
                            <SelectItem value="Free Fire" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Free Fire</SelectItem>
                            <SelectItem value="BGMI" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">BGMI</SelectItem>
                            <SelectItem value="Valorant" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Valorant</SelectItem>
                            <SelectItem value="Call Of Duty" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Call Of Duty</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    <Input
                        placeholder="Search by name, email, game tag, ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full h-10 text-sm bg-black border-2 border-red-600 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-[0_0_10px_rgba(220,38,38,0.2)]"
                    />
                </div>
            </div>
            {filteredMembers && filteredMembers.length > 0 ? (
                <div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
                >
                    {filteredMembers?.map((member) => (
                        <div
                            key={member.id}
                            className="bg-transparent rounded-xl border-2 border-red-600 flex flex-col hover:border-red-500 transition-all overflow-hidden group"
                        >
                            <div className="p-2.5 md:p-6 flex flex-col items-center justify-center text-center gap-5 md:gap-3 bg-black">
                                <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-red-600/20 flex items-center justify-center ring-2 ring-red-600/30">
                                    <span className="font-display font-bold text-lg md:text-3xl text-red-500">
                                        {(member.name || member.inGameName || "U").charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="space-y-0.5 md:space-y-2 w-full flex flex-col items-center">
                                    <h3 className="font-display font-bold text-sm md:text-xl text-foreground truncate w-full text-center">
                                        {member.name || member.inGameName}
                                    </h3>
                                    <p className="text-red-500 font-medium text-[11px] md:text-sm truncate w-full text-center">
                                        {member.email}
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
                                    onClick={() => handleEdit(member)}
                                    className="flex-1 h-9 md:h-10 px-2 md:px-4 text-[11px] md:text-sm border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                                >
                                    <span className="action-swap">
                                        <span className="action-swap-item action-swap-a">
                                            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            <span>View</span>
                                        </span>
                                        <span className="action-swap-item action-swap-b">
                                            <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            <span>Edit</span>
                                        </span>
                                    </span>
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setDeletingMember(member)}
                                    className="flex-1 h-9 md:h-10 px-2 md:px-4 gap-1 md:gap-2 text-[11px] md:text-sm bg-red-600 hover:bg-red-700 text-white border-0 transition-all duration-300"
                                >
                                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span>Delete</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-red-600 rounded-2xl bg-black/40 w-full relative overflow-hidden group mt-10 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/[0.05] to-transparent pointer-events-none" />
                    <div className="relative">
                        <Users className="w-16 h-16 text-red-500 mb-4" style={{ filter: 'drop-shadow(0 0 18px rgba(220, 38, 38, 0.5))' }} />
                    </div>
                    <p className="text-xl font-display font-black uppercase tracking-[0.2em] text-white mb-2">No Members Found</p>
                    <p className="text-[11px] text-white/40 font-display mb-8 tracking-widest uppercase max-w-xs mx-auto leading-relaxed">
                        {searchQuery || gameFilter !== "all"
                            ? <>No members found matching your search criteria for <span className="text-red-500 font-bold">{gameFilter === 'all' ? 'all games' : gameFilter}</span>.</>
                            : "There are no verified members registered in the community yet."}
                    </p>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingMember} onOpenChange={(o) => o ? null : setEditingMember(null)}>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-[500px] bg-black border-2 border-red-600 rounded-xl p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Edit Member</DialogTitle>
                        <DialogDescription>
                            Update member information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
                        <div className="grid gap-1.5 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Name</Label>
                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{formData.name || "N/A"}</p>
                            </div>
                        </div>

                        <div className="grid gap-1.5 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">College ID</Label>
                            <div className="bg-black/90 p-1 px-3 rounded-lg border-2 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)] focus-within:border-red-500 transition-all min-h-[38px] flex items-center focus-within:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                <input
                                    className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                    id="collegeId"
                                    value={formData.collegeId || ""}
                                    onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-1.5 text-left col-span-1 md:col-span-2">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Game Assignment</Label>
                            <div className="bg-black/90 p-1 px-3 rounded-lg border-2 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)] focus-within:border-red-500 transition-all min-h-[38px] flex items-center focus-within:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                <Select
                                    value={formData.gameYouPlay || 'Free Fire'}
                                    onValueChange={(val) => setFormData({ ...formData, gameYouPlay: val })}
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
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">In-Game Name</Label>
                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{formData.inGameName || "N/A"}</p>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4">
                            <div className="grid gap-1.5 text-left md:flex-[1.6] overflow-hidden">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Email</Label>
                                <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                    <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{formData.email || "N/A"}</p>
                                </div>
                            </div>

                            <div className="grid gap-1.5 text-left md:flex-1">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Mobile</Label>
                                <div className="bg-black/90 p-1 px-3 rounded-lg border-2 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)] focus-within:border-red-500 transition-all min-h-[38px] flex items-center focus-within:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                    <input
                                        className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                        id="mobile"
                                        value={formData.mobile || ""}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-1.5 text-left col-span-1 md:col-span-2">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Bio</Label>
                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{formData.bio || "No bio set"}</p>
                            </div>
                        </div>

                        <div className="grid gap-1.5 text-left col-span-1 md:col-span-2">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Member Since</Label>
                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center cursor-not-allowed">
                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center">{formData.createdAt ? format(new Date(formData.createdAt), "PPP") : "N/A"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row justify-between w-full gap-3 pt-4 border-t border-white/10 mt-2 px-0">
                        <Button variant="ghost" onClick={() => setEditingMember(null)} className="flex-1 max-w-[140px] border border-red-600 bg-transparent text-white hover:bg-red-600 hover:text-white h-9 transition-all duration-300 font-display uppercase tracking-widest text-[10px]">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} className="flex-1 max-w-[140px] bg-red-600 hover:bg-red-700 text-white h-9 transition-all duration-300 font-display uppercase tracking-widest text-[10px]">Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
                <AlertDialogContent className="bg-black border-2 border-red-600 w-[90%] max-w-md mx-auto rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white font-display text-xl">Delete Member</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete the member{" "}
                            <strong className="text-red-500">{deletingMember?.username}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row gap-2 justify-between sm:justify-between">
                        <AlertDialogCancel className="border border-red-600 bg-transparent text-white hover:bg-red-600 hover:text-white transition-all duration-300 mt-0">Cancel</AlertDialogCancel>
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
