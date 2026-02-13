import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Admin {
    id?: string;
    _id?: string;
    name?: string;
    email: string;
    mobile?: string;
    role: string;
    game?: string;
    lastLogin?: string;
    created_at?: string;
    createdAt?: string;
    password?: string;
    inGameName?: string;
    inGameId?: string;
    collegeId?: string;
    bio?: string;
}

// Helper functions
const getRoleName = (role: string) => {
    const roleMap: { [key: string]: string } = {
        super_admin: "Super Admin",
        admin_freefire: "Free Fire Admin",
        admin_bgmi: "BGMI Admin",
        admin_valorant: "Valorant Admin",
        admin_call_of_duty: "Call Of Duty Admin",
    };
    return roleMap[role] || role;
};



interface AdminsTabProps {
    admins: Admin[];
}

export const AdminsTab = ({ admins }: AdminsTabProps) => {
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
    const [gameFilter, setGameFilter] = useState("all");
    const [formData, setFormData] = useState<Partial<Admin>>({
        role: "",
    });
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Filter and sort admins: exclude current user, show super admins first, then other admins
    const sortedAdmins = useMemo(() => {
        if (!admins) return [];

        return admins
            .filter(admin => {
                const adminId = admin.id || admin._id;
                const userId = user?.id;
                // Exclude current logged-in user
                if (admin.email === user?.email || adminId === userId) return false;

                // Filter by game
                if (gameFilter !== "all") {
                    return admin.game === gameFilter;
                }
                return true;
            })
            .sort((a, b) => {
                // Sort super admins first
                if (a.role === 'super_admin' && b.role !== 'super_admin') return -1;
                if (a.role !== 'super_admin' && b.role === 'super_admin') return 1;
                return 0;
            });
    }, [admins, user, gameFilter]);

    const handleAdd = () => {
        setFormData({
            name: "",
            inGameName: "",
            inGameId: "",
            collegeId: "",
            email: "",
            mobile: "",
            password: "",
            role: "",
            game: "",
        } as any);
        setIsAddingAdmin(true);
    };

    const handleEdit = (admin: Admin) => {
        setEditingAdmin(admin);
        setFormData({
            name: admin.name,
            email: admin.email,
            mobile: admin.mobile,
            role: admin.role,
            game: admin.game,
            inGameName: admin.inGameName,
            inGameId: admin.inGameId,
            collegeId: admin.collegeId,
            bio: admin.bio,
            createdAt: admin.createdAt || admin.created_at,
        });
    };

    const handleCreate = async () => {
        try {
            const token = localStorage.getItem("inferno_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/users/admins`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create admin");
            }

            toast({
                title: "Success",
                description: "Admin created successfully",
                variant: "success",
            });

            queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
            setIsAddingAdmin(false);
            setFormData({ role: "" });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create admin",
                variant: "destructive",
            });
        }
    };

    const handleUpdate = async () => {
        if (!editingAdmin) return;

        try {
            const token = localStorage.getItem("inferno_token");
            const adminId = editingAdmin.id || editingAdmin._id;
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/users/admins/${adminId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) throw new Error("Failed to update admin");

            toast({
                title: "Success",
                description: "Admin updated successfully",
                variant: "success",
            });

            queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
            setEditingAdmin(null);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update admin",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!deletingAdmin) return;

        try {
            const token = localStorage.getItem("inferno_token");
            const adminId = deletingAdmin.id || deletingAdmin._id;
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/users/admins/${adminId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to delete admin");

            toast({
                title: "Success",
                description: "Admin deleted successfully",
                variant: "success",
            });

            queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
            setDeletingAdmin(null);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete admin",
                variant: "destructive",
            });
        }
    };

    const updateGameFromRole = (role: string) => {
        const gameMap: { [key: string]: string } = {
            admin_freefire: "Free Fire",
            admin_bgmi: "BGMI",
            admin_valorant: "Valorant",
            admin_call_of_duty: "Call Of Duty",
        };
        return gameMap[role] || "";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold order-1">Admins</h2>

                <Button
                    onClick={handleAdd}
                    size="sm"
                    className="h-10 md:h-11 px-4 whitespace-nowrap bg-red-600 hover:bg-red-700 text-white border-0 gap-2 order-2 md:order-3"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Admin</span>
                    <span className="sm:hidden">Add</span>
                </Button>

                <div className="w-full md:w-auto order-3 md:order-2 md:ml-auto">
                    <Select value={gameFilter} onValueChange={setGameFilter}>
                        <SelectTrigger className="w-full md:w-[200px] bg-black border-2 border-red-600 h-11 focus:ring-0 focus:ring-offset-0">
                            <SelectValue placeholder="Filter by Game" />
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
            </div>

            <div
                className="grid gap-3 md:gap-4"
            >
                {sortedAdmins?.map((admin) => {
                    const adminId = admin.id || admin._id || "";
                    const createdDate = admin.created_at || admin.createdAt;
                    return (
                        <div
                            key={adminId}
                            className="bg-transparent rounded-xl border-2 border-[#FF0000] hover:border-[#FF0000] transition-all overflow-hidden"
                        >
                            <div className="flex flex-col md:grid md:grid-cols-12 items-center p-3 md:p-4 bg-black gap-5 md:gap-4">
                                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto md:col-span-5">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <span className="font-display font-bold text-primary text-sm md:text-lg">
                                            {admin.name ? admin.name.charAt(0).toUpperCase() : '?'}
                                        </span>
                                    </div>
                                    <div className="relative flex-1 min-w-0">
                                        <h3 className="font-display font-semibold text-sm md:text-base text-foreground truncate">
                                            {admin.name}
                                        </h3>
                                        <p className="text-muted-foreground text-xs md:text-sm truncate">
                                            {admin.email}
                                        </p>
                                        {createdDate && (
                                            <p className="text-muted-foreground text-xs mt-0.5">
                                                Joined: {format(new Date(createdDate), "PP")}
                                            </p>
                                        )}
                                        {/* Only super admins can see last login time */}
                                        {user?.role === 'super_admin' && admin.lastLogin && (
                                            <p className="text-muted-foreground text-xs">
                                                Last login: {format(new Date(admin.lastLogin), "PP p")}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="hidden md:flex md:col-span-4 justify-center w-full">
                                    <Badge className="bg-red-600 border-2 border-red-600 text-white hover:bg-red-700 transition-all duration-300 text-[10px] md:text-xs whitespace-nowrap uppercase tracking-widest font-bold px-4 py-1 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                                        {getRoleName(admin.role)}
                                    </Badge>
                                </div>

                                <div className="flex flex-row items-center gap-2 w-full md:w-auto justify-between md:justify-end md:col-span-3">
                                    <Badge className="md:hidden bg-red-600 border-2 border-red-600 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                                        {getRoleName(admin.role)}
                                    </Badge>
                                    {admin.role !== "super_admin" && (
                                        <div className="flex gap-2 ml-auto md:ml-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(admin)}
                                                className="text-xs px-3 py-1 h-8 border-red-600 text-white bg-transparent hover:bg-red-600 hover:text-white transition-all duration-300"
                                            >
                                                <Pencil className="h-3 w-3 mr-1" />
                                                <span>Edit</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => setDeletingAdmin(admin)}
                                                className="text-xs px-3 py-1 h-8 bg-[#FF0000] hover:bg-red-700 text-white border-0"
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                <span>Delete</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {(!sortedAdmins || sortedAdmins.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-[#FF0000] rounded-2xl bg-black/40 w-full relative overflow-hidden group mt-10 shadow-[0_0_30px_rgba(255,0,0,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-b from-red-600/[0.05] to-transparent pointer-events-none" />
                        <div className="relative">
                            <ShieldCheck className="w-16 h-16 text-red-500 mb-4" style={{ filter: 'drop-shadow(0 0 18px rgba(220, 38, 38, 0.5))' }} />
                        </div>
                        <p className="text-xl font-display font-black uppercase tracking-[0.2em] text-white mb-2">No Admins Found</p>
                        <p className="text-[11px] text-white/40 font-display mb-8 tracking-widest uppercase max-w-xs mx-auto leading-relaxed">
                            {gameFilter === "all"
                                ? "There are no administrative accounts registered in the system yet."
                                : <>There are no admins assigned to the <span className="text-red-500 font-bold">{gameFilter}</span> category at the moment.</>}
                        </p>
                    </div>
                )}
            </div>

            {/* Add Admin Dialog */}
            <Dialog open={isAddingAdmin} onOpenChange={setIsAddingAdmin}>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-[500px] bg-black border-2 border-red-600 rounded-xl p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Add New Admin</DialogTitle>
                        <DialogDescription>
                            Create a new admin account
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 py-3 sm:py-4">
                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Name *</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <input
                                    className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                    id="add-name"
                                    required
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">College ID</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <input
                                    className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                    id="add-collegeid"
                                    value={formData.collegeId || ""}
                                    maxLength={10}
                                    onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 text-left col-span-1 md:col-span-2">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Admin Role *</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <Select
                                    value={formData.role || ""}
                                    onValueChange={(value) => {
                                        setFormData({
                                            ...formData,
                                            role: value,
                                            game: updateGameFromRole(value),
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                        <SelectValue placeholder="Select Game" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                        <SelectItem value="admin_freefire" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Free Fire Admin</SelectItem>
                                        <SelectItem value="admin_bgmi" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">BGMI Admin</SelectItem>
                                        <SelectItem value="admin_valorant" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Valorant Admin</SelectItem>
                                        <SelectItem value="admin_call_of_duty" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Call Of Duty Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">In-Game Name *</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <input
                                    className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                    id="add-ingamename"
                                    required
                                    value={formData.inGameName || ""}
                                    onChange={(e) => setFormData({ ...formData, inGameName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">In-Game ID</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <input
                                    className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                    id="add-ingameid"
                                    value={formData.inGameId || ""}
                                    onChange={(e) => setFormData({ ...formData, inGameId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4">
                            <div className="grid gap-1.5 text-left md:flex-[1.6] overflow-hidden">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Email *</Label>
                                <div className="bg-black/90 p-1 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[38px] flex items-center">
                                    <input
                                        className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                        id="add-email"
                                        type="email"
                                        required
                                        value={formData.email || ""}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-1.5 text-left md:flex-1 overflow-hidden">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Mobile</Label>
                                <div className="bg-black/90 p-1 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[38px] flex items-center">
                                    <input
                                        className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                        id="add-mobile"
                                        value={formData.mobile || ""}
                                        maxLength={10}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2 text-left col-span-1 md:col-span-2">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Password *</Label>
                            <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 border-red-600 transition-all min-h-[44px] flex items-center">
                                <input
                                    className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                                    id="add-password"
                                    type="password"
                                    required
                                    value={formData.password || ""}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="!flex !flex-row !justify-between sm:!justify-between gap-2">
                        <Button variant="ghost" onClick={() => setIsAddingAdmin(false)} className="border border-red-600 bg-transparent text-white hover:bg-red-600 hover:text-white transition-all duration-300">
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-all duration-300">Create Admin</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Admin Dialog */}
            <Dialog open={!!editingAdmin} onOpenChange={(o) => o ? null : setEditingAdmin(null)}>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-[500px] bg-black border-2 border-red-600 rounded-xl p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Edit Admin</DialogTitle>
                        <DialogDescription>
                            Update admin information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 py-3">
                        <div className="grid gap-1.5 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Name</Label>
                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{formData.name || "N/A"}</p>
                            </div>
                        </div>

                        <div className="grid gap-1.5 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">College ID</Label>
                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{formData.collegeId || "N/A"}</p>
                            </div>
                        </div>

                        <div className="grid gap-1.5 text-left col-span-1 md:col-span-2">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Admin Role</Label>
                            <div className="bg-black/90 p-1 px-3 rounded-lg border-2 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)] focus-within:border-red-500 transition-all min-h-[38px] flex items-center focus-within:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                <Select
                                    value={formData.role || ""}
                                    onValueChange={(value) => {
                                        setFormData({
                                            ...formData,
                                            role: value,
                                            game: updateGameFromRole(value),
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-2 border-red-600 rounded-lg">
                                        <SelectItem value="admin_freefire" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Free Fire Admin</SelectItem>
                                        <SelectItem value="admin_bgmi" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">BGMI Admin</SelectItem>
                                        <SelectItem value="admin_valorant" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Valorant Admin</SelectItem>
                                        <SelectItem value="admin_call_of_duty" className="text-white hover:bg-red-600/10 focus:bg-red-600/10 focus:text-white data-[state=checked]:bg-[#ff4d00] data-[state=checked]:text-white cursor-pointer rounded-md m-1">Call Of Duty Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-1.5 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">In-Game Name</Label>
                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{formData.inGameName || "N/A"}</p>
                            </div>
                        </div>

                        <div className="grid gap-1.5 text-left">
                            <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">In-Game ID</Label>
                            <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{formData.inGameId || "N/A"}</p>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4">
                            <div className="grid gap-1.5 text-left md:flex-[1.6] overflow-hidden">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Email</Label>
                                <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                    <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{formData.email || "N/A"}</p>
                                </div>
                            </div>

                            <div className="grid gap-1.5 text-left md:flex-1 overflow-hidden">
                                <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Mobile</Label>
                                <div className="bg-zinc-900/40 p-1 px-3 rounded-lg border-2 border-red-900/40 transition-all min-h-[38px] flex items-center overflow-hidden cursor-not-allowed">
                                    <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center truncate">{formData.mobile || "N/A"}</p>
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
                        <Button variant="ghost" onClick={() => setEditingAdmin(null)} className="flex-1 max-w-[140px] border border-red-600 bg-transparent text-white hover:bg-red-600 hover:text-white h-9 transition-all duration-300 font-display uppercase tracking-widest text-[10px]">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} className="flex-1 max-w-[140px] bg-[#FF0000] hover:bg-red-700 text-white h-9 transition-all duration-300 font-display uppercase tracking-widest text-[10px]">Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingAdmin} onOpenChange={() => setDeletingAdmin(null)}>
                <AlertDialogContent className="bg-black border-2 border-[#FF0000] w-[90%] max-w-md mx-auto rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white font-display text-xl">Delete Admin</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete the admin{" "}
                            <strong className="text-red-500">{deletingAdmin?.name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row gap-2 justify-between sm:justify-between">
                        <AlertDialogCancel className="border border-red-600 bg-transparent text-white hover:bg-red-600 hover:text-white transition-all duration-300 mt-0">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-[#FF0000] hover:bg-red-700 text-white"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
};
