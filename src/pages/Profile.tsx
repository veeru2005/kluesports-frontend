import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Edit2, Save, Lock, Mail, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const Profile = () => {
  const { user, isAdmin, role, isLoading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const anim = useScrollAnimation();

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

  // Security States
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passDialogOpen, setPassDialogOpen] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1: Send OTP, 2: Verify OTP
  const [securityData, setSecurityData] = useState({
    newEmail: "",
    newPassword: "",
    otp: "",
  });
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      setFormData({
        username: user.username || "",
        full_name: user.name || user.username || "",
        collegeId: user.collegeId || "",
        gameYouPlay: user.gameYouPlay || user.game || "",
        email: user.email || "",
        mobile: user.mobile || "",
        bio: user.bio || "",
      });
    }
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const result = await (await import('@/utils/apiClient')).default.put('/users/profile', formData);

      if (result && (result.success || result.user)) {
        updateUser({ ...user, ...(result.user || {}), name: (result.user && result.user.name) || user.name });
        setIsEditing(false);
        toast({ title: 'Profile Updated', description: result.message || 'Your profile has been saved successfully.', variant: 'success' });
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast({ title: 'Error', description: error?.message || 'Failed to save profile. Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmailOTP = async () => {
    if (!securityData.newEmail) return;
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/otp/send-change-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail: securityData.newEmail }),
      });
      const result = await response.json();
      if (result.success) {
        setOtpStep(2);
        toast({ title: "OTP Sent", description: "Verification code sent to your new email." });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSecurityLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/otp/verify-change-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: securityData.otp, newEmail: securityData.newEmail }),
      });
      const result = await response.json();
      if (result.success) {
        updateUser({ ...user!, email: result.newEmail });
        setEmailDialogOpen(false);
        setOtpStep(1);
        setSecurityData({ ...securityData, otp: "", newEmail: "" });
        toast({ title: "Success", description: "Email updated successfully.", variant: "success" });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSecurityLoading(false);
    }
  };

  const handleSendPasswordOTP = async () => {
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/otp/send-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setOtpStep(2);
        toast({ title: "OTP Sent", description: "Verification code sent to your current email." });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSecurityLoading(false);
    }
  };

  const handleVerifyPasswordOTP = async () => {
    if (!securityData.newPassword) return;
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/otp/verify-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: securityData.otp, newPassword: securityData.newPassword }),
      });
      const result = await response.json();
      if (result.success) {
        setPassDialogOpen(false);
        setOtpStep(1);
        setSecurityData({ ...securityData, otp: "", newPassword: "" });
        toast({ title: "Success", description: "Password updated successfully.", variant: "success" });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSecurityLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-display text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
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
          <div
            ref={anim.elementRef}
            className={`max-w-2xl mx-auto scroll-fade-up ${anim.isVisible ? 'scroll-visible' : ''}`}
          >
            {/* Profile Header */}
            <div className="glass-dark rounded-xl p-8 border border-red-600/40 mb-8 text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/4 rounded-full blur-3xl" />
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary/50">
                <User className="w-12 h-12 text-primary" />
              </div>
              <h1 className="font-display font-bold text-3xl text-foreground mb-2 uppercase">
                {user.name || user.username || "Warrior"}
              </h1>
              <p className="text-muted-foreground font-body">
                {user.email}
              </p>
            </div>

            {/* Profile Form */}
            <div className="glass-dark rounded-xl p-8 border border-red-600/40 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-red-600/4 rounded-full blur-3xl" />
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display font-bold text-2xl">
                  Profile <span className="flame-text">Details</span>
                </h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 border-red-600/50 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
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

              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-2 group">
                  <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Full Name</Label>
                  <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/40 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)]'}`}>
                    {isEditing ? (
                      <Input
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                        }
                        spellCheck={false}
                        className="w-full !bg-transparent !border-none !shadow-none !ring-0 !ring-offset-0 !outline-none focus:ring-0 focus:outline-none p-0 h-8 text-lg text-white placeholder:text-muted-foreground/50 font-body"
                      />
                    ) : (
                      <p className="text-white font-display font-bold text-lg h-8 flex items-center">
                        {user.name || user.username || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Gamer Tag (In-Game Name)</Label>
                  <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/40 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)]'}`}>
                    {isEditing ? (
                      <Input
                        value={formData.username}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, username: e.target.value }))
                        }
                        spellCheck={false}
                        className="w-full !bg-transparent !border-none !shadow-none !ring-0 !ring-offset-0 !outline-none focus:ring-0 focus:outline-none p-0 h-8 text-lg text-white placeholder:text-muted-foreground/50 font-body"
                      />
                    ) : (
                      <p className="text-white font-display font-bold text-lg h-8 flex items-center">
                        {user.username || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">College ID</Label>
                  <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing && role === 'super_admin' ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/40 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)]'} ${isEditing && role !== 'super_admin' ? 'opacity-60 cursor-not-allowed border-white/5' : ''}`}>
                    {isEditing && role === 'super_admin' ? (
                      <Input
                        value={formData.collegeId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, collegeId: e.target.value }))
                        }
                        spellCheck={false}
                        className="w-full !bg-transparent !border-none !shadow-none !ring-0 !ring-offset-0 !outline-none focus:ring-0 focus:outline-none p-0 h-8 text-lg text-white placeholder:text-muted-foreground/50 font-body"
                      />
                    ) : (
                      <p className="text-white font-display font-bold text-lg h-8 flex items-center">
                        {user.collegeId || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Game You Play</Label>
                  <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing && role === 'super_admin' ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/40 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)]'} ${isEditing && role !== 'super_admin' ? 'opacity-60 cursor-not-allowed border-white/5' : ''}`}>
                    {isEditing && role === 'super_admin' ? (
                      <Select
                        value={formData.gameYouPlay}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, gameYouPlay: value }))
                        }
                      >
                        <SelectTrigger className="w-full !bg-transparent !border-0 !shadow-none !ring-offset-0 !outline-none focus:ring-0 focus:outline-none p-0 h-8 text-lg text-white font-body rounded-md px-3">
                          <SelectValue placeholder="Select game" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border border-red-600">
                          <SelectItem value="Free Fire">Free Fire</SelectItem>
                          <SelectItem value="BGMI">BGMI</SelectItem>
                          <SelectItem value="Valorant">Valorant</SelectItem>
                          <SelectItem value="Call Of Duty">Call Of Duty</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-white font-display font-bold text-lg h-8 flex items-center">
                        {user.gameYouPlay || user.game || "Not selected"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Email</Label>
                  <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing && role !== 'user' ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/40 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)]'} ${isEditing && role === 'user' ? 'opacity-60 cursor-not-allowed border-white/5' : ''}`}>
                    {isEditing && role !== 'user' ? (
                      <Input
                        value={formData.email}
                        type="email"
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        spellCheck={false}
                        className="w-full !bg-transparent !border-none !shadow-none !ring-0 !ring-offset-0 !outline-none focus:ring-0 focus:outline-none p-0 h-8 text-lg text-white placeholder:text-muted-foreground/50 font-body"
                      />
                    ) : (
                      <p className="text-white font-display font-bold text-lg h-8 flex items-center">
                        {user.email || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Mobile Number</Label>
                  <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing && role !== 'user' ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/25 hover:border-red-500/40 shadow-[0_0_6px_rgba(220,38,38,0.02)]'} ${isEditing && role === 'user' ? 'opacity-60 cursor-not-allowed border-white/5' : ''}`}>
                    {isEditing && role !== 'user' ? (
                      <Input
                        value={formData.mobile}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, mobile: e.target.value }))
                        }
                        spellCheck={false}
                        maxLength={10}
                        className="w-full !bg-transparent !border-none !shadow-none !ring-0 !ring-offset-0 !outline-none focus:ring-0 focus:outline-none p-0 h-8 text-lg text-white placeholder:text-muted-foreground/50 font-body"
                      />
                    ) : (
                      <p className="text-white font-display font-bold text-lg h-8 flex items-center">
                        {user.mobile || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2 group">
                  <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Bio</Label>
                  <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/40 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)]'}`}>
                    {isEditing ? (
                      <Input
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, bio: e.target.value }))
                        }
                        maxLength={25}
                        spellCheck={false}
                        className="w-full !bg-transparent !border-none !shadow-none !ring-0 !ring-offset-0 !outline-none focus:ring-0 focus:outline-none p-0 h-8 text-lg text-white placeholder:text-muted-foreground/50 font-body"
                      />
                    ) : (
                      <p className="text-white font-display font-bold text-lg h-8 flex items-center">
                        {user.bio || "No bio yet"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label className="font-display text-primary/80 block">Member Since</Label>
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5 opacity-60 cursor-not-allowed">
                    <p className="text-muted-foreground font-body text-lg h-8 flex items-center">
                      {user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Join Date Unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Account Security Section */}
            {!isEditing && (
                <div className="glass-dark rounded-xl p-8 border border-red-600/40 mt-8 shadow-2xl relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl" />
                <h2 className="font-display font-bold text-2xl mb-6">
                  Account <span className="flame-text">Security</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-red-600/50 hover:bg-red-600 hover:text-white"
                    onClick={() => { setEmailDialogOpen(true); setOtpStep(1); }}
                  >
                    <Mail className="w-4 h-4" />
                    Change Email
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-red-600/50 hover:bg-red-600 hover:text-white"
                    onClick={() => { setPassDialogOpen(true); setOtpStep(1); }}
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </Button>
                </div>
              </div>
            )}

            {/* Change Email Dialog */}
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogContent className="bg-black border-2 border-red-600 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl uppercase">Change Email</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {otpStep === 1
                      ? "Enter your new email address. We'll send a code to verify it."
                      : `Enter the code sent to ${securityData.newEmail}`}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {otpStep === 1 ? (
                    <div className="space-y-2">
                      <Label>New Email Address</Label>
                      <Input
                        placeholder="new@example.com"
                        className="bg-black border-2 border-red-600 focus-visible:ring-0 focus-visible:border-red-400 !ring-0 !ring-offset-0"
                        value={securityData.newEmail}
                        onChange={(e) => setSecurityData({ ...securityData, newEmail: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 text-center">
                      <Label className="mb-4 block">Verification Code</Label>
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        className="bg-black border-2 border-red-600 text-center text-2xl tracking-[1em] focus-visible:ring-0 focus-visible:border-red-400 !ring-0 !ring-offset-0"
                        value={securityData.otp}
                        onChange={(e) => setSecurityData({ ...securityData, otp: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
                  {otpStep === 1 ? (
                    <Button variant="flame" onClick={handleSendEmailOTP} disabled={isSecurityLoading}>
                      {isSecurityLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  ) : (
                    <Button variant="flame" onClick={handleVerifyEmailOTP} disabled={isSecurityLoading}>
                      {isSecurityLoading ? "Verifying..." : "Update Email"}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={passDialogOpen} onOpenChange={setPassDialogOpen}>
              <DialogContent className="bg-black border-2 border-red-600 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl uppercase">Change Password</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {otpStep === 1
                      ? `We'll send a verification code to ${user.email} to confirm it's you.`
                      : "Set your new password and enter the OTP."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {otpStep === 1 ? (
                    <div className="flex justify-center py-4">
                      <ShieldCheck className="w-16 h-16 text-red-600 animate-pulse" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-black border-2 border-red-600 focus-visible:ring-0 focus-visible:border-red-400 !ring-0 !ring-offset-0"
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Verification Code</Label>
                        <Input
                          placeholder="000000"
                          maxLength={6}
                          className="bg-black border-2 border-red-600 text-center text-2xl tracking-[1em] focus-visible:ring-0 focus-visible:border-red-400 !ring-0 !ring-offset-0"
                          value={securityData.otp}
                          onChange={(e) => setSecurityData({ ...securityData, otp: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPassDialogOpen(false)}>Cancel</Button>
                  {otpStep === 1 ? (
                    <Button variant="flame" onClick={handleSendPasswordOTP} disabled={isSecurityLoading}>
                      {isSecurityLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  ) : (
                    <Button variant="flame" onClick={handleVerifyPasswordOTP} disabled={isSecurityLoading}>
                      {isSecurityLoading ? "Verifying..." : "Reset Password"}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

export default Profile;
