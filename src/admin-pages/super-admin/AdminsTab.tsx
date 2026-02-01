import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
    collegeId?: string;
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

const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const loginDate = new Date(dateString);
    const diffMs = now.getTime() - loginDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
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
        role: "admin_freefire",
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
            collegeId: "",
            email: "",
            mobile: "",
            password: "",
            role: "admin_freefire",
            game: "Free Fire",
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
        });
    };

    const handleCreate = async () => {
        try {
            const token = localStorage.getItem("inferno_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/users/admins`,
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
            });

            queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
            setIsAddingAdmin(false);
            setFormData({ role: "admin_freefire" });
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
                `${import.meta.env.VITE_API_BASE_URL}/users/admins/${adminId}`,
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
                `${import.meta.env.VITE_API_BASE_URL}/users/admins/${adminId}`,
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
            <div className="flex justify-between items-center">
                <h2 className="font-display text-2xl md:text-3xl font-bold">Admins</h2>
                <Button onClick={handleAdd} size="sm" className="text-xs md:text-sm">
                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Add Admin
                </Button>
            </div>
            <div className="flex justify-end">
                <Select value={gameFilter} onValueChange={setGameFilter}>
                    <SelectTrigger className="w-full md:w-[200px] bg-black border-2 border-red-600 h-11 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Filter by Game" />
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
            <div className="grid gap-3 md:gap-4">
                {sortedAdmins?.map((admin) => {
                    const adminId = admin.id || admin._id || "";
                    const createdDate = admin.created_at || admin.createdAt;
                    return (
                        <div
                            key={adminId}
                            className="bg-transparent rounded-xl border-2 border-red-600 hover:border-red-500 transition-all overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 md:p-4 bg-black gap-2 md:gap-4">
                                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <span className="font-display font-bold text-primary text-sm md:text-lg">
                                            {admin.name ? admin.name.charAt(0).toUpperCase() : '?'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
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
                                                Last login: {getTimeAgo(admin.lastLogin)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Badge className="hidden md:block bg-red-600 hover:bg-red-700 text-white border-0 text-xs md:text-sm">
                                    {getRoleName(admin.role)}
                                </Badge>
                                <div className="flex flex-row items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                                    <Badge className="md:hidden bg-red-600 hover:bg-red-700 text-white border-0 text-sm">
                                        {getRoleName(admin.role)}
                                    </Badge>
                                    {admin.role !== "super_admin" && (
                                        <div className="flex gap-2">
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
                                                className="text-xs px-3 py-1 h-8 bg-red-600 hover:bg-red-700 text-white border-0"
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
                    <div className="text-center py-12 text-muted-foreground">
                        No admins found.
                    </div>
                )}
            </div>

            {/* Add Admin Dialog */}
            <Dialog open={isAddingAdmin} onOpenChange={setIsAddingAdmin}>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Admin</DialogTitle>
                        <DialogDescription>
                            Create a new admin account
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-name">Name *</Label>
                            <Input
                                id="add-name"
                                required
                                value={formData.name || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-ingamename">In-Game Name</Label>
                            <Input
                                id="add-ingamename"
                                value={(formData as any).inGameName || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, inGameName: e.target.value } as any)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-collegeid">College ID</Label>
                            <Input
                                id="add-collegeid"
                                value={(formData as any).collegeId || ""}
                                maxLength={10}
                                onChange={(e) =>
                                    setFormData({ ...formData, collegeId: e.target.value } as any)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-email">Email *</Label>
                            <Input
                                id="add-email"
                                type="email"
                                required
                                value={formData.email || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-mobile">Mobile</Label>
                            <Input
                                id="add-mobile"
                                value={formData.mobile || ""}
                                maxLength={10}
                                onChange={(e) =>
                                    setFormData({ ...formData, mobile: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-password">Password *</Label>
                            <Input
                                id="add-password"
                                type="password"
                                required
                                value={(formData as any).password || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-role">Admin Role *</Label>
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin_freefire">Free Fire Admin</SelectItem>
                                    <SelectItem value="admin_bgmi">BGMI Admin</SelectItem>
                                    <SelectItem value="admin_valorant">Valorant Admin</SelectItem>
                                    <SelectItem value="admin_call_of_duty">Call Of Duty Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex-row gap-2">
                        <Button variant="outline" onClick={() => setIsAddingAdmin(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} className="flex-1">Create Admin</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Admin Dialog */}
            <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Admin</DialogTitle>
                        <DialogDescription>
                            Update admin information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-mobile">Mobile</Label>
                            <Input
                                id="edit-mobile"
                                value={formData.mobile || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, mobile: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Admin Role</Label>
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin_freefire">Free Fire Admin</SelectItem>
                                    <SelectItem value="admin_bgmi">BGMI Admin</SelectItem>
                                    <SelectItem value="admin_valorant">Valorant Admin</SelectItem>
                                    <SelectItem value="admin_call_of_duty">Call Of Duty Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex-row gap-2">
                        <Button variant="outline" onClick={() => setEditingAdmin(null)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} className="flex-1">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingAdmin} onOpenChange={() => setDeletingAdmin(null)}>
                <AlertDialogContent className="bg-black border-2 border-red-600 w-[90%] max-w-md mx-auto rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white font-display text-xl">Delete Admin</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete the admin{" "}
                            <strong className="text-red-500">{deletingAdmin?.name}</strong>? This action cannot be undone.
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
