import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate, useLocation } from "react-router-dom";
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
import { User, Edit2, Save, Lock, Mail, ShieldCheck, Trophy } from "lucide-react";
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

  const location = useLocation();
  const isEventsView = new URLSearchParams(location.search).get("view") === "events";
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [location.search]);
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
    confirmPassword: "",
    otp: "",
  });
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
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

  // 1: Send Current OTP, 2: Verify Current OTP, 3: Send New OTP, 4: Verify New OTP
  // This otpStep state is shared between email and password flows, but the email flow uses all 4 steps,
  // while the password flow reuses steps 1 and 2 for its simpler 2-step process.

  const handleSendCurrentEmailOTP = async () => {
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/otp/send-current-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend not updated. Please restart the backend server.");
      }

      const result = await response.json();
      if (result.success) {
        setOtpStep(2);
        toast({ title: "OTP Sent", description: "Verification code sent to your current email.", variant: "success" });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSecurityLoading(false);
    }
  };

  const handleVerifyCurrentEmailOTP = async () => {
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/otp/verify-current-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: securityData.otp }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please restart backend.");
      }

      const result = await response.json();
      if (result.success) {
        setOtpStep(3);
        setSecurityData({
          newEmail: securityData.newEmail,
          newPassword: securityData.newPassword,
          confirmPassword: securityData.confirmPassword,
          otp: ""
        }); // Clear OTP for next step
        toast({ title: "Success", description: "Current email verified. Please enter new email.", variant: "success" });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSecurityLoading(false);
    }
  };

  const handleSendNewEmailOTP = async () => {
    if (!securityData.newEmail) return;
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/otp/send-new-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail: securityData.newEmail }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please restart backend.");
      }

      const result = await response.json();
      if (result.success) {
        setOtpStep(4);
        toast({ title: "OTP Sent", description: "Verification code sent to your new email.", variant: "success" });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSecurityLoading(false);
    }
  };

  const handleVerifyNewEmailOTP = async () => {
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/otp/verify-new-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: securityData.otp }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please restart backend.");
      }

      const result = await response.json();
      if (result.success) {
        updateUser({ ...user!, email: result.newEmail });
        setEmailDialogOpen(false);
        setOtpStep(1);
        setSecurityData({
          newEmail: "",
          newPassword: securityData.newPassword,
          confirmPassword: securityData.confirmPassword,
          otp: ""
        });
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
        /* Password flow reuses otpStep 1 & 2 for simpler flow, separate from email flow */
        setOtpStep(2);
        toast({ title: "OTP Sent", description: "Verification code sent to your current email.", variant: "success" });
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
    if (!securityData.otp) {
      toast({ title: "Error", description: "Please enter the OTP.", variant: "destructive" });
      return;
    }
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/otp/verify-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: securityData.otp, newPassword: "temp_verification_only" }),
      });
      const result = await response.json();
      if (result.success) {
        setOtpStep(3);
        toast({ title: "Verified", description: "OTP verified. Please set your new password.", variant: "success" });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSecurityLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!securityData.newPassword || !securityData.confirmPassword) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
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
        setSecurityData({
          newEmail: "",
          newPassword: "",
          confirmPassword: "",
          otp: ""
        });
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
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white gap-4">
        <p className="text-red-500 font-display">Session expired. Redirecting...</p>
        <button onClick={() => window.location.href = '/'} className="text-sm underline opacity-50 hover:opacity-100">Click here if not redirected</button>
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
      <main className="pt-28 md:pt-32 pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
            <div className="space-y-4 md:space-y-8">
              {/* View Tabs */}
              <div className={`grid ${isAdmin ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <Button
                  variant={!isEventsView ? "flame" : "outline"}
                  className={`rounded-lg border transition-all ${!isEventsView ? 'border-red-600 shadow-lg' : 'border-red-600 text-white hover:bg-red-600/10'}`}
                  onClick={() => navigate("/profile")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </Button>
                {!isAdmin && (
                  <Button
                    variant={isEventsView ? "flame" : "outline"}
                    className={`rounded-lg border transition-all ${isEventsView ? 'border-red-600 shadow-lg' : 'border-red-600 text-white hover:bg-red-600/10'}`}
                    onClick={() => navigate("/profile?view=events")}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    My Events
                  </Button>
                )}
              </div>

              {/* Profile Header */}
              <div className={`glass-dark rounded-xl p-8 border border-red-600/90 text-center shadow-2xl relative overflow-hidden group ${isEventsView && !isAdmin ? 'hidden' : ''}`}>
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
              <div className={`glass-dark rounded-xl p-8 border border-red-600/90 shadow-2xl relative overflow-hidden ${isEventsView && !isAdmin ? 'hidden' : ''}`}>
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
                      className="gap-2 border-red-600/80 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
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
                    <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/90 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)]'}`}>
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
                        <p className="text-gray-300 font-display font-medium text-lg h-8 flex items-center">
                          {user.name || user.username || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Gamer Tag (In-Game Name)</Label>
                    <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/90 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)]'}`}>
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
                        <p className="text-gray-300 font-display font-medium text-lg h-8 flex items-center">
                          {user.username || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">College ID</Label>
                    <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing && role !== 'user' ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/90 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)]'} ${isEditing && role === 'user' ? 'opacity-60 cursor-not-allowed border-white/5' : ''}`}>
                      {isEditing && role !== 'user' ? (
                        <Input
                          value={formData.collegeId}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, collegeId: e.target.value }))
                          }
                          spellCheck={false}
                          className="w-full !bg-transparent !border-none !shadow-none !ring-0 !ring-offset-0 !outline-none focus:ring-0 focus:outline-none p-0 h-8 text-lg text-white placeholder:text-muted-foreground/50 font-body"
                        />
                      ) : (
                        <p className="text-gray-300 font-display font-medium text-lg h-8 flex items-center">
                          {user.collegeId || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Game You Play</Label>
                    <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing && role === 'super_admin' ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/90 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)]'} ${isEditing && role !== 'super_admin' ? 'opacity-60 cursor-not-allowed border-white/5' : ''}`}>
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
                        <p className="text-gray-300 font-display font-medium text-lg h-8 flex items-center">
                          {user.gameYouPlay || user.game || "Not selected"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Email</Label>
                    <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 border-red-600/90 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)] ${isEditing ? 'opacity-60 cursor-not-allowed border-white/5' : ''}`}>
                      <p className="text-gray-300 font-display font-medium text-lg h-8 flex items-center">
                        {user.email || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Mobile Number</Label>
                    <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing && role !== 'user' ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/90 hover:border-red-500/80 shadow-[0_0_6px_rgba(220,38,38,0.02)]'} ${isEditing && role === 'user' ? 'opacity-60 cursor-not-allowed border-white/5' : ''}`}>
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
                        <p className="text-gray-300 font-display font-medium text-lg h-8 flex items-center">
                          {user.mobile || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2 group">
                    <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Bio</Label>
                    <div className={`bg-black/90 p-3 rounded-lg border-2 transition-all duration-300 ${isEditing ? 'border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.12)] focus-within:border-red-400' : 'border-red-600/90 hover:border-red-500/60 shadow-[0_0_6px_rgba(220,38,38,0.02)]'}`}>
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
                        <p className="text-gray-300 font-display font-medium text-lg h-8 flex items-center">
                          {user.bio || "No bio yet"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label className="font-display text-red-500 font-bold block uppercase tracking-wider text-[11px] mb-1 drop-shadow-[0_0_6px_rgba(239,68,68,0.12)]">Member Since</Label>
                    <div className="bg-black/90 p-3 rounded-lg border-2 border-red-600/50 transition-all duration-300 opacity-60 cursor-not-allowed text-white/50">
                      <p className="text-gray-300 font-display font-medium text-lg h-8 flex items-center">
                        {user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Join Date Unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* My Events Section */}
              {!isEditing && !isAdmin && (
                <div className={`glass-dark rounded-xl p-8 border border-red-600/90 shadow-2xl relative overflow-hidden ${!isEventsView ? 'hidden' : ''}`}>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl" />
                  <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-red-500" />
                    My <span className="flame-text">Events</span>
                  </h2>

                  <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-red-600/20 rounded-xl bg-black/40">
                    <Trophy className="w-12 h-12 text-red-500/20 mb-3" />
                    <p className="text-lg font-display text-white/60 mb-1">No Upcoming Events</p>
                    <p className="text-sm text-muted-foreground">You haven't registered for any events yet.</p>
                    <Button variant="link" className="text-red-500 hover:text-red-400 mt-2" onClick={() => navigate("/events")}>
                      Browse Events
                    </Button>
                  </div>
                </div>
              )}

              {/* Account Security Section */}
              {!isEditing && (
                <div className={`glass-dark rounded-xl p-8 border border-red-600/90 shadow-2xl relative overflow-hidden ${isEventsView ? 'hidden' : ''}`}>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl" />
                  <h2 className="font-display font-bold text-2xl mb-6">
                    Account <span className="flame-text">Security</span>
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 border-red-600/80 hover:bg-red-600 hover:text-white"
                      onClick={() => { setEmailDialogOpen(true); setOtpStep(1); }}
                    >
                      <Mail className="w-4 h-4" />
                      Change Email
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 border-red-600/80 hover:bg-red-600 hover:text-white"
                      onClick={() => { setPassDialogOpen(true); setOtpStep(1); }}
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </Button>
                  </div>
                </div>
              )}

              {/* Change Email Dialog */}
              <Dialog open={emailDialogOpen} onOpenChange={(open) => { setEmailDialogOpen(open); if (!open) setOtpStep(1); }}>
                <DialogContent className="bg-black border-2 border-red-600 text-white sm:max-w-md w-[95%] rounded-3xl md:rounded-2xl gap-6">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl uppercase">Change Email</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      {otpStep === 1 && "Security Check: Verify your current email first."}
                      {otpStep === 2 && `Enter the code sent to ${user?.email}`}
                      {otpStep === 3 && "Authorization successful. Enter your new email address."}
                      {otpStep === 4 && `Enter the code sent to ${securityData.newEmail}`}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">

                    {/* Step 1: Just a button to trigger OTP */}
                    {otpStep === 1 && (
                      <div className="flex justify-center py-4">
                        <ShieldCheck className="w-16 h-16 text-red-600" />
                      </div>
                    )}

                    {/* Step 2: Verify Current OTP */}
                    {otpStep === 2 && (
                      <div className="space-y-2 text-center">
                        <Label className="mb-4 block">Current Email Verification Code</Label>
                        <Input
                          placeholder="000000"
                          maxLength={6}
                          className="bg-black border-2 border-red-600 text-center text-2xl tracking-[1em] focus-visible:ring-0 focus-visible:border-red-400 !ring-0 !ring-offset-0 rounded-xl"
                          value={securityData.otp}
                          onChange={(e) => setSecurityData({
                            newEmail: securityData.newEmail,
                            newPassword: securityData.newPassword,
                            confirmPassword: securityData.confirmPassword,
                            otp: e.target.value
                          })}
                        />
                      </div>
                    )}

                    {/* Step 3: Input New Email */}
                    {otpStep === 3 && (
                      <div className="space-y-2">
                        <Label>New Email Address</Label>
                        <Input
                          placeholder="new@example.com"
                          className="bg-black border border-red-600 h-10 px-3 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-red-500 rounded-xl"
                          value={securityData.newEmail}
                          onChange={(e) => setSecurityData({
                            newEmail: e.target.value,
                            newPassword: securityData.newPassword,
                            confirmPassword: securityData.confirmPassword,
                            otp: securityData.otp
                          })}
                        />
                      </div>
                    )}

                    {/* Step 4: Verify New OTP */}
                    {otpStep === 4 && (
                      <div className="space-y-2 text-center">
                        <Label className="mb-4 block">New Email Verification Code</Label>
                        <Input
                          placeholder="000000"
                          maxLength={6}
                          className="bg-black border-2 border-red-600 text-center text-2xl tracking-[1em] focus-visible:ring-0 focus-visible:border-red-400 !ring-0 !ring-offset-0 rounded-xl"
                          value={securityData.otp}
                          onChange={(e) => setSecurityData({
                            newEmail: securityData.newEmail,
                            newPassword: securityData.newPassword,
                            confirmPassword: securityData.confirmPassword,
                            otp: e.target.value
                          })}
                        />
                      </div>
                    )}

                  </div>
                  <DialogFooter className="!flex !flex-row !justify-between gap-2 sm:gap-3">
                    <Button variant="ghost" onClick={() => setEmailDialogOpen(false)} className="rounded-xl border border-red-600 hover:bg-red-600 hover:text-white transition-colors flex-1 sm:flex-none">Cancel</Button>

                    {otpStep === 1 && (
                      <Button variant="flame" onClick={handleSendCurrentEmailOTP} disabled={isSecurityLoading} className="rounded-xl flex-1 sm:flex-none">
                        {isSecurityLoading ? "Sending..." : "Send Verification Code"}
                      </Button>
                    )}

                    {otpStep === 2 && (
                      <Button variant="flame" onClick={handleVerifyCurrentEmailOTP} disabled={isSecurityLoading} className="rounded-xl flex-1 sm:flex-none">
                        {isSecurityLoading ? "Verifying..." : "Verify & Proceed"}
                      </Button>
                    )}

                    {otpStep === 3 && (
                      <Button variant="flame" onClick={handleSendNewEmailOTP} disabled={isSecurityLoading} className="rounded-xl flex-1 sm:flex-none">
                        {isSecurityLoading ? "Sending..." : "Send Code to New Email"}
                      </Button>
                    )}

                    {otpStep === 4 && (
                      <Button variant="flame" onClick={handleVerifyNewEmailOTP} disabled={isSecurityLoading} className="rounded-xl flex-1 sm:flex-none">
                        {isSecurityLoading ? "Updating..." : "Verify & Update"}
                      </Button>
                    )}

                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Change Password Dialog */}
              <Dialog open={passDialogOpen} onOpenChange={setPassDialogOpen}>
                <DialogContent className="bg-black border-2 border-red-600 text-white sm:max-w-md w-[95%] rounded-3xl md:rounded-2xl gap-6">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl uppercase">Change Password</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      {otpStep === 1 && `We'll send a verification code to ${user.email} to confirm it's you.`}
                      {otpStep === 2 && `Enter the verification code sent to ${user.email}`}
                      {otpStep === 3 && "OTP verified! Now set your new password."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {otpStep === 1 && (
                      <div className="flex justify-center py-4">
                        <ShieldCheck className="w-16 h-16 text-red-600" />
                      </div>
                    )}

                    {otpStep === 2 && (
                      <div className="space-y-2">
                        <Label>Verification Code</Label>
                        <Input
                          placeholder="000000"
                          maxLength={6}
                          className="bg-black border-2 border-red-600 text-center text-2xl tracking-[1em] focus-visible:ring-0 focus-visible:border-red-400 !ring-0 !ring-offset-0 rounded-xl"
                          value={securityData.otp}
                          onChange={(e) => setSecurityData({
                            newEmail: securityData.newEmail,
                            newPassword: securityData.newPassword,
                            confirmPassword: securityData.confirmPassword,
                            otp: e.target.value
                          })}
                        />
                      </div>
                    )}

                    {otpStep === 3 && (
                      <>
                        <div className="space-y-2">
                          <Label>New Password</Label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-black border-2 border-red-600 focus-visible:ring-0 focus-visible:border-red-400 !ring-0 !ring-offset-0 rounded-xl"
                            value={securityData.newPassword}
                            onChange={(e) => setSecurityData({
                              newEmail: securityData.newEmail,
                              newPassword: e.target.value,
                              confirmPassword: securityData.confirmPassword,
                              otp: securityData.otp
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm Password</Label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-black border-2 border-red-600 focus-visible:ring-0 focus-visible:border-red-400 !ring-0 !ring-offset-0 rounded-xl"
                            value={securityData.confirmPassword || ''}
                            onChange={(e) => setSecurityData({
                              newEmail: securityData.newEmail,
                              newPassword: securityData.newPassword,
                              confirmPassword: e.target.value,
                              otp: securityData.otp
                            })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter className="!flex !flex-row !justify-between gap-2 sm:gap-3">
                    <Button variant="ghost" onClick={() => setPassDialogOpen(false)} className="rounded-xl border border-red-600 hover:bg-red-600 hover:text-white transition-colors flex-1 sm:flex-none">Cancel</Button>

                    {otpStep === 1 && (
                      <Button variant="flame" onClick={handleSendPasswordOTP} disabled={isSecurityLoading} className="rounded-xl flex-1 sm:flex-none">
                        {isSecurityLoading ? "Sending..." : "Send OTP"}
                      </Button>
                    )}

                    {otpStep === 2 && (
                      <Button variant="flame" onClick={handleVerifyPasswordOTP} disabled={isSecurityLoading} className="rounded-xl flex-1 sm:flex-none">
                        {isSecurityLoading ? "Verifying..." : "Verify OTP"}
                      </Button>
                    )}

                    {otpStep === 3 && (
                      <Button variant="flame" onClick={handleResetPassword} disabled={isSecurityLoading} className="rounded-xl flex-1 sm:flex-none">
                        {isSecurityLoading ? "Updating..." : "Reset Password"}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Profile;
