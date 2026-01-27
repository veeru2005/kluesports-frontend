import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { AdminNavbar } from "@/admin-pages/components/AdminNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { User, Edit2, Save } from "lucide-react";

const Profile = () => {
  const { user, isAdmin, role, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    collegeId: "",
    gameYouPlay: "",
    email: "",
    mobile: "",
    bio: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      const mockProfile = {
        username: user.username,
        full_name: user.name || user.username,
        collegeId: user.collegeId,
        gameYouPlay: user.gameYouPlay || user.game,
        email: user.email,
        mobile: user.mobile,
        bio: user.bio,
        created_at: new Date().toISOString(), // In real app, this would be user.createdAt
      };
      setProfile(mockProfile);
      setFormData({
        username: mockProfile.username,
        full_name: mockProfile.full_name,
        collegeId: mockProfile.collegeId,
        gameYouPlay: mockProfile.gameYouPlay,
        email: mockProfile.email,
        mobile: mockProfile.mobile,
        bio: mockProfile.bio,
      });
    }
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    // Mock save delay
    await new Promise(r => setTimeout(r, 800));

    setProfile({ ...profile, ...formData });
    setIsEditing(false);
    setIsSaving(false);

    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
      variant: "success",
    });
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-display text-2xl">Loading...</div>
      </div>
    );
  }

  // Helper function to get base URL for admin navbar
  const getAdminBaseUrl = () => {
    if (role === "super_admin") return "/admin/super";
    if (role === "admin_freefire") return "/admin/freefire";
    if (role === "admin_bgmi") return "/admin/bgmi";
    if (role === "admin_valorant") return "/admin/valorant";
    if (role === "admin_call_of_duty") return "/admin/call-of-duty";
    return "/";
  };

  const getAdminTitle = () => {
    if (role === "super_admin") return "Super Admin";
    if (role === "admin_freefire") return "Free Fire Admin";
    if (role === "admin_bgmi") return "BGMI Admin";
    if (role === "admin_valorant") return "Valorant Admin";
    if (role === "admin_call_of_duty") return "Call Of Duty Admin";
    return "Profile";
  };

  return (
    <div className="min-h-screen bg-background">
      {isAdmin ? (
        <AdminNavbar
          title={getAdminTitle()}
          baseUrl={getAdminBaseUrl()}
          showMessages={role === "super_admin"}
        />
      ) : (
        <Navbar />
      )}
      <main className="pt-32 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Profile Header */}
            <div className="glass-dark rounded-xl p-8 border border-border mb-8 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-primary" />
              </div>
              <h1 className="font-display font-bold text-3xl text-foreground mb-2">
                {profile?.username || profile?.full_name || "Warrior"}
              </h1>
              <p className="text-muted-foreground font-body">
                {profile?.email}
              </p>
            </div>

            {/* Profile Form */}
            <div className="glass-dark rounded-xl p-8 border border-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display font-bold text-2xl">
                  Profile <span className="flame-text">Details</span>
                </h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="flame"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="font-display text-primary/80 mb-2 block">Full Name</Label>
                  <div className="bg-black/50 p-3 rounded-lg border border-white/10">
                    {isEditing ? (
                      <Input
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                        }
                        spellCheck={false}
                        className="w-full !bg-transparent !border-none !shadow-none !ring-0 !ring-offset-0 !outline-none focus:ring-0 focus:outline-none p-0 h-8 text-lg text-white placeholder:text-muted-foreground/50"
                      />
                    ) : (
                      <p className="text-white font-body text-lg h-8 flex items-center">
                        {profile?.full_name || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="font-display text-primary/80 mb-2 block">Gamer Tag (In-Game Name)</Label>
                  <div className="bg-black/50 p-3 rounded-lg border border-white/10">
                    {isEditing ? (
                      <Input
                        value={formData.username}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, username: e.target.value }))
                        }
                        spellCheck={false}
                        className="w-full !bg-transparent !border-none !shadow-none !ring-0 !ring-offset-0 !outline-none focus:ring-0 focus:outline-none p-0 h-8 text-lg text-white placeholder:text-muted-foreground/50"
                      />
                    ) : (
                      <p className="text-white font-body text-lg h-8 flex items-center">
                        {profile?.username || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="font-display text-primary/80 mb-2 block">College ID</Label>
                  <div className="bg-black/50 p-3 rounded-lg border border-white/10 opacity-70">
                    <p className="text-white font-body text-lg h-8 flex items-center">
                      {profile?.collegeId || "Not set"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="font-display text-primary/80 mb-2 block">Game You Play</Label>
                  <div className="bg-black/50 p-3 rounded-lg border border-white/10 opacity-70">
                    <p className="text-white font-body text-lg h-8 flex items-center">
                      {profile?.gameYouPlay || "Not selected"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="font-display text-primary/80 mb-2 block">Email</Label>
                  <div className="bg-black/50 p-3 rounded-lg border border-white/10 opacity-70">
                    <p className="text-white font-body text-lg h-8 flex items-center">
                      {profile?.email || "Not set"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="font-display text-primary/80 mb-2 block">Mobile Number</Label>
                  <div className="bg-black/50 p-3 rounded-lg border border-white/10 opacity-70">
                    <p className="text-white font-body text-lg h-8 flex items-center">
                      {profile?.mobile || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Label className="font-display text-primary/80 mb-2 block">Bio</Label>
                  <div className="bg-black/50 p-3 rounded-lg border border-white/10">
                    {isEditing ? (
                      <Input
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, bio: e.target.value }))
                        }
                        maxLength={25}
                        spellCheck={false}
                        className="w-full !bg-transparent !border-none !shadow-none !ring-0 !ring-offset-0 !outline-none focus:ring-0 focus:outline-none p-0 h-8 text-lg text-white placeholder:text-muted-foreground/50"
                      />
                    ) : (
                      <p className="text-white font-body text-lg h-8 flex items-center">
                        {profile?.bio || "No bio yet"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Label className="font-display text-primary/80 mb-2 block">Member Since</Label>
                  <div className="bg-black/50 p-3 rounded-lg border border-white/10">
                    <p className="text-muted-foreground font-body text-lg">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

export default Profile;
