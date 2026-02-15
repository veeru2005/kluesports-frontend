import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { AdminNavbar } from "@/admin-pages/components/AdminNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { User, Edit2, Save, Lock, Mail, ShieldCheck, Trophy, Calendar, MapPin, Clock, Info, ChevronRight, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/Loader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Registration {
  registrationId: string;
  eventId: string | {
    _id: string;
    event_date: string;
    end_time?: string;
    location: string;
  };
  eventTitle: string;
  game: string;
  teamName: string;
  registeredAt: string;
  eventDate?: string;
  eventLocation?: string;
  eventEndTime?: string;
}

const RegistrationCard = ({ reg }: { reg: Registration }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: details, isLoading } = useQuery({
    queryKey: ['reg-details', reg.registrationId],
    queryFn: async () => {
      // Always fetch fresh data to ensure event details (like date/time) are up to date
      const token = localStorage.getItem("inferno_token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/registrations/${reg.registrationId}?game=${encodeURIComponent(reg.game)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    retry: false
  });



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div
        className="bg-black rounded-2xl overflow-hidden flex flex-col relative w-full border-2 border-[#FF0000] shadow-[0_0_40px_rgba(0,0,0,0.8)] group/card"
      >


        {/* Top: Branding & Tag */}
        <div className="h-[140px] bg-black relative flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

          {/* Game Tag at TOP */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <span className="px-2 py-0.5 bg-red-600 text-white font-black font-display text-[9px] uppercase rounded-full tracking-widest shadow-xl border border-white/10 whitespace-nowrap">
              {reg.game}
            </span>
          </div>

          {/* KLU Branding */}
          <div className="relative z-10 flex flex-col items-center mt-7">
            <h1 className="font-display font-black text-5xl text-transparent bg-clip-text bg-gradient-to-b from-orange-400 via-red-600 to-red-900 tracking-tighter drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]">
              KLU
            </h1>
            <span className="font-display text-white/50 text-[13px] tracking-[0.85em] uppercase mt-1.5 font-black leading-none text-center -mr-[0.85em]">
              ESPORTS
            </span>
          </div>

          {/* Flame Divider below Branding */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
        </div>

        {/* Bottom: Details */}
        <div className="flex-1 bg-black p-4 flex flex-col relative gap-2">
          {/* Event Name & Status */}
          <div className="text-center">
            <h2 className="text-2xl font-display font-black text-white leading-tight line-clamp-2 uppercase tracking-tight mb-2">
              {reg.eventTitle}
            </h2>
            <div className="flex justify-center">
              {(details?.eventId?.end_time || reg.eventEndTime) && new Date(details?.eventId?.end_time || reg.eventEndTime!) < new Date() ? (
                <span className="text-[10px] font-black text-gray-400 border-2 border-gray-500/40 px-4 py-1.5 rounded-lg bg-gray-500/10 uppercase tracking-widest">
                  Completed
                </span>
              ) : (
                <span className="text-[10px] font-black text-green-400 border-2 border-green-500/40 px-4 py-1.5 rounded-lg bg-green-500/10 uppercase tracking-widest">
                  Registered
                </span>
              )}
            </div>
          </div>

          {/* Team & Registered Date */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2.5 text-white/80 text-base font-display uppercase tracking-widest">
              <ShieldCheck className="w-6 h-6 text-red-500" style={{ filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.8))' }} />
              <span className="text-white font-black text-base text-center leading-tight">{reg.teamName}</span>
            </div>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.25em] font-mono font-bold">
              REG AT {reg.registeredAt ? format(new Date(reg.registeredAt), 'dd/MM/yyyy') : 'N/A'}
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/10 my-1" />

          {/* Bottom Row Blocks */}
          <div className="grid grid-cols-[0.85fr_1.15fr] gap-2.5 mt-auto">
            <DialogTrigger asChild>
              <div className="flex flex-col justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 group cursor-pointer transition-colors hover:bg-white/[0.06]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Info className="w-4 h-4 text-red-500" style={{ filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.8))' }} />
                  <span className="text-[8px] text-white/50 uppercase font-black tracking-widest font-display">Team Details</span>
                </div>
                <div className="flex items-center justify-between text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest">Details</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-red-500 transition-colors" />
                </div>
              </div>
            </DialogTrigger>

            <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center gap-2 mb-0.5">
                <Trophy className="w-5 h-5 text-red-500" style={{ filter: 'drop-shadow(0 0 12px rgba(220, 38, 38, 0.8))' }} />
                <span className="text-[9px] text-white/50 uppercase font-black tracking-widest font-display">Event Details</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5 text-white/90">
                  <Calendar className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {details?.eventId ? format(new Date(details.eventId.event_date), 'dd/MM/yyyy') : (reg.eventDate ? format(new Date(reg.eventDate), 'dd/MM/yyyy') : '...')}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-white/90">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[9px] font-black uppercase tracking-tight">
                    {details?.eventId ? (
                      <>
                        {format(new Date(details.eventId.event_date), 'hh:mm a')}
                        {details.eventId.end_time && ` - ${format(new Date(details.eventId.end_time), 'hh:mm a')}`}
                      </>
                    ) : reg.eventDate ? (
                      <>
                        {format(new Date(reg.eventDate), 'hh:mm a')}
                        {reg.eventEndTime && ` - ${format(new Date(reg.eventEndTime), 'hh:mm a')}`}
                      </>
                    ) : '...'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-white/90">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[9px] font-black uppercase tracking-tight truncate">
                    {details?.eventId ? details.eventId.location : (reg.eventLocation || '...')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogContent className="glass-dark border-2 border-[#FF0000] w-[90vw] max-w-2xl text-white p-0 overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(255,0,0,0.2)] [&>button]:hidden">
        <DialogHeader className="p-4 pb-2 bg-black/40 border-b border-white/5">
          <DialogTitle className="font-display text-xl uppercase tracking-wider text-white">Event Registration Details</DialogTitle>
          <DialogDescription className="text-gray-400 font-display text-[10px] uppercase tracking-widest mt-1">
            {reg.eventTitle} • {reg.registeredAt ? format(new Date(reg.registeredAt), 'dd/MM/yyyy') : 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 pt-2 pb-0 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader /></div>
          ) : details ? (
            <>
              {/* Team Header with Logo */}
              <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3 flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/10 shadow-lg">
                  {details.teamLogo ? (
                    <img src={details.teamLogo} alt="Team" className="w-full h-full object-cover" />
                  ) : (
                    <ShieldCheck className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-red-500 uppercase font-black tracking-widest mb-0.5 font-display">Registered Team</p>
                  <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight">{details.teamName}</h3>
                </div>
              </div>

              {/* Team Lead Section */}
              <div>
                <h4 className="font-display text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" /> TEAM LEAD
                </h4>
                <div className="bg-black/40 rounded-xl p-3 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[11px] uppercase font-black font-display tracking-wider">Name</span>
                    <span className="font-display font-black text-white uppercase text-sm">{details.teamLead?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[11px] uppercase font-black font-display tracking-wider">In-Game Name</span>
                    <span className="font-display text-red-500 font-black text-sm tracking-tight">{details.teamLead?.inGameName || details.teamLead?.inGameId || details.teamLead?.riotId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[11px] uppercase font-black font-display tracking-wider">Email</span>
                    <span className="font-display text-white/80 text-xs font-black">{details.teamLead?.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[11px] uppercase font-black font-display tracking-wider">College ID</span>
                    <span className="font-display text-white/80 text-xs font-black">{details.teamLead?.collegeId}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-white/40 text-[11px] uppercase font-black font-display tracking-wider">Contact</span>
                    <span className="font-display text-white/80 text-xs tracking-widest font-black">{details.teamLead?.mobileNumber}</span>
                  </div>
                </div>
              </div>

              {/* Team Members Section */}
              <div>
                <h4 className="font-display text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-600" /> SQUAD MEMBERS
                </h4>
                <div className="space-y-1.5">
                  {['player2', 'player3', 'player4', 'player5'].map((key, idx) => {
                    const player = details[key];
                    if (!player) return null;
                    return (
                      <div key={key} className="bg-black/40 rounded-xl p-2 sm:p-2.5 px-3 sm:px-4 border border-white/10 grid grid-cols-12 gap-2 sm:gap-x-2 items-center group hover:bg-black/50 transition-all">
                        <div className="col-span-12 sm:col-span-6 flex items-center gap-3 sm:gap-4 min-w-0">
                          <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white/30 border border-white/5 font-display shrink-0">
                            {idx + 2}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-display font-black text-white text-[13px] uppercase tracking-tight mb-0.5 break-words block w-full">{player.name || 'Unknown'}</span>
                            <div className="flex flex-col">
                              <span className="font-display text-red-500 text-[10px] font-black uppercase tracking-tight leading-none break-words">{player.inGameName || player.inGameId || player.riotId || 'N/A'}</span>
                              <span className="text-[8px] text-white/20 uppercase font-black tracking-widest font-display leading-tight">In-Game Name</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-6 sm:col-span-3 text-left sm:text-right flex flex-col items-start sm:items-end min-w-0 pl-9 sm:pl-0">
                          <span className="font-display text-white/60 text-[10px] tracking-widest font-black uppercase break-words w-full">{player.collegeId}</span>
                          <span className="text-[9px] text-white/20 uppercase font-black tracking-widest font-display">College ID</span>
                        </div>
                        <div className="col-span-6 sm:col-span-3 text-right flex flex-col items-end pl-2 border-l border-white/5 min-w-0">
                          <span className="font-display text-white/60 text-[10px] tracking-widest font-black uppercase break-words w-full">{player.mobileNumber}</span>
                          <span className="text-[9px] text-white/20 uppercase font-black tracking-widest font-display">Mobile</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-red-500 font-display font-black uppercase tracking-widest">Failed to load registration.</div>
          )}
        </div>

        <DialogFooter className="p-3 px-4 bg-black/40">
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="w-full border-2 border-[#FF0000] text-white hover:bg-red-600 hover:text-white transition-all font-display uppercase tracking-[0.2em] font-black h-10 rounded-lg ring-0 ring-offset-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none shadow-none"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  );
};

interface MyEventsSectionProps {
  isEventsView: boolean;
  navigate: (path: string) => void;
}

const MyEventsSection = ({ isEventsView, navigate }: MyEventsSectionProps) => {
  const { data: registrations, isLoading } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: async () => {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/registrations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch registrations');
      return response.json() as Promise<Registration[]>;
    },
  });

  if (!isEventsView) return null;

  return (
    <div className="relative pt-0 sm:pt-0 w-full">
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      ) : registrations && registrations.filter(reg => {
        const eventTime = reg.eventEndTime || reg.eventDate;
        if (!eventTime) return true;
        return new Date(eventTime).getTime() > Date.now();
      }).length > 0 ? (
        <div className="flex flex-wrap gap-y-6 gap-x-6 w-full justify-center sm:justify-start pt-6">
          {[...registrations]
            .filter(reg => {
              const eventTime = reg.eventEndTime || reg.eventDate;
              if (!eventTime) return true;
              return new Date(eventTime).getTime() > Date.now();
            })
            .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
            .map((reg) => (
              <div key={reg.registrationId} className="w-[90%] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.33%-1rem)] xl:w-[320px] sm:mx-0">
                <RegistrationCard reg={reg} />
              </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-red-600 rounded-2xl bg-black/40 w-full relative overflow-hidden group mt-10 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-b from-red-600/[0.05] to-transparent pointer-events-none" />
          <div className="relative">
            <Trophy className="w-16 h-16 text-red-500 mb-4" style={{ filter: 'drop-shadow(0 0 18px rgba(220, 38, 38, 0.5))' }} />
          </div>
          <p className="text-xl font-display font-black uppercase tracking-[0.2em] text-white mb-2">
            {registrations && registrations.length > 0 ? "All Events Completed" : "No Registered Events"}
          </p>
          <p className="text-[11px] text-white/40 font-display mb-8 tracking-widest uppercase max-w-xs mx-auto leading-relaxed">
            {registrations && registrations.length > 0 ? (
              <>
                Tournament history and active registration data are <span className="text-red-500 font-bold">automatically wiped out by the organization</span> upon completion.
              </>
            ) : (
              <>
                Your journey begins here. No active registrations found. <span className="text-red-500 font-bold">Past event records are wiped from the profile by the organization.</span>
              </>
            )}
          </p>
          <Button
            variant="flame"
            className="rounded-lg px-10 py-2.5 font-display uppercase tracking-widest text-xs border-2 border-[#FF0000] shadow-[0_0_25px_rgba(255,0,0,0.3)] bg-red-600 hover:bg-red-700 text-white transition-all transform hover:-translate-y-1"
            onClick={() => navigate("/events")}
          >
            Browse Events
          </Button>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const { user, isAdmin, role, isLoading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const isEventsView = new URLSearchParams(location.search).get("view") === "events";
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    inGameName: "",
    inGameId: "",
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
  const [otpStep, setOtpStep] = useState(1);
  const [securityData, setSecurityData] = useState({
    newEmail: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [location.search]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      return;
    }
    if (user) {
      setFormData({
        username: user.username || "",
        inGameName: user.inGameName || "",
        inGameId: user.inGameId || "",
        full_name: user.name || user.username || "",
        collegeId: user.collegeId || "",
        gameYouPlay: user.gameYouPlay || user.game || "",
        email: user.email || "",
        mobile: user.mobile || "",
        bio: user.bio || "",
      });
    }
  }, [user, authLoading, navigate]);

  // Fetch fresh user data from backend if createdAt is missing (ensures "Member Since" is always available)
  useEffect(() => {
    if (!user?.id || user.createdAt) return;
    const fetchFreshUserData = async () => {
      try {
        const token = localStorage.getItem("inferno_token");
        if (!token) return;
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return;
        const freshUser = await response.json();
        if (freshUser?.createdAt) {
          updateUser({ ...user, createdAt: freshUser.createdAt });
        }
      } catch {
        // Silently fail - Member Since is non-critical
      }
    };
    fetchFreshUserData();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const result = await (await import('@/utils/apiClient')).default.put('/users/profile', { ...formData });
      if (result && (result.success || result.user)) {
        updateUser({ ...user, ...(result.user || {}), name: (result.user && result.user.name) || user.name });
        setIsEditing(false);
        toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.', variant: 'success' });
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast({ title: 'Error', description: error?.message || 'Failed to save profile.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendCurrentEmailOTP = async () => {
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/otp/send-current-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setOtpStep(2);
        toast({ title: "OTP Sent", description: "Code sent to your current email.", variant: "success" });
      } else throw new Error(result.message);
    } catch (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setIsSecurityLoading(false); }
  };

  const handleVerifyCurrentEmailOTP = async () => {
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/otp/verify-current-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: securityData.otp })
      });
      const result = await response.json();
      if (result.success) {
        setOtpStep(3);
        setSecurityData({ ...securityData, otp: "" });
        toast({ title: "Success", description: "Email verified. Enter new email.", variant: "success" });
      } else throw new Error(result.message);
    } catch (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setIsSecurityLoading(false); }
  };

  const handleSendNewEmailOTP = async () => {
    if (!securityData.newEmail) return;
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/otp/send-new-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail: securityData.newEmail })
      });
      const result = await response.json();
      if (result.success) {
        setOtpStep(4);
        toast({ title: "OTP Sent", description: "Code sent to your new email.", variant: "success" });
      } else throw new Error(result.message);
    } catch (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setIsSecurityLoading(false); }
  };

  const handleVerifyNewEmailOTP = async () => {
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/otp/verify-new-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: securityData.otp })
      });
      const result = await response.json();
      if (result.success) {
        updateUser({ ...user!, email: result.newEmail });
        setEmailDialogOpen(false);
        setOtpStep(1);
        setSecurityData({ ...securityData, newEmail: "", otp: "" });
        toast({ title: "Success", description: "Email updated successfully.", variant: "success" });
      } else throw new Error(result.message);
    } catch (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setIsSecurityLoading(false); }
  };

  const handleSendPasswordOTP = async () => {
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/otp/send-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setOtpStep(2);
        toast({ title: "OTP Sent", description: "Code sent to your current email.", variant: "success" });
      } else throw new Error(result.message);
    } catch (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setIsSecurityLoading(false); }
  };

  const handleVerifyPasswordOTP = async () => {
    if (!securityData.otp) return;
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/otp/verify-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: securityData.otp, newPassword: "temp_verification_only" })
      });
      const result = await response.json();
      if (result.success) {
        setOtpStep(3);
        toast({ title: "Verified", description: "Set your new password.", variant: "success" });
      } else throw new Error(result.message);
    } catch (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setIsSecurityLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!securityData.newPassword || securityData.newPassword !== securityData.confirmPassword) {
      toast({ title: "Error", description: "Passwords must match.", variant: "destructive" });
      return;
    }
    setIsSecurityLoading(true);
    try {
      const token = localStorage.getItem("inferno_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/otp/verify-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: securityData.otp, newPassword: securityData.newPassword })
      });
      const result = await response.json();
      if (result.success) {
        setPassDialogOpen(false);
        setOtpStep(1);
        setSecurityData({ ...securityData, newPassword: "", confirmPassword: "", otp: "" });
        toast({ title: "Success", description: "Password updated successfully.", variant: "success" });
      } else throw new Error(result.message);
    } catch (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setIsSecurityLoading(false); }
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader /></div>;

  if (!user) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white gap-4">
      <p className="text-red-500 font-display">Session expired. Redirecting...</p>
    </div>
  );

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
    <div className="min-h-screen bg-background text-white">
      {isAdmin ? (
        <AdminNavbar title={getAdminTitle()} baseUrl={getAdminBaseUrl()} showMessages={role === "super_admin"} />
      ) : (
        <Navbar />
      )}

      <main className="pt-28 md:pt-32 pb-32">
        <div className="container mx-auto px-4">
          {!isAdmin && (
            <div className="max-w-2xl mx-auto mb-4 md:mb-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={!isEventsView ? "flame" : "outline"}
                  className={`rounded-lg h-10 md:h-11 font-display uppercase tracking-widest text-[10px] md:text-xs border-2 transition-all ${!isEventsView ? 'bg-[#FF0000] border-[#FF0000] shadow-[0_0_20px_rgba(255,0,0,0.3)]' : 'border-[#FF0000]/60 hover:border-[#FF0000] text-white'}`}
                  onClick={() => navigate("/profile")}
                >
                  <User className="w-3.5 h-3.5 mr-2" /> Profile Settings
                </Button>
                <Button
                  variant={isEventsView ? "flame" : "outline"}
                  className={`rounded-lg h-10 md:h-11 font-display uppercase tracking-widest text-[10px] md:text-xs border-2 transition-all ${isEventsView ? 'bg-[#FF0000] border-[#FF0000] shadow-[0_0_20px_rgba(255,0,0,0.3)]' : 'border-[#FF0000]/60 hover:border-[#FF0000] text-white'}`}
                  onClick={() => navigate("/profile?view=events")}
                >
                  <Trophy className="w-3.5 h-3.5 mr-2" /> My Events
                </Button>
              </div>
            </div>
          )}

          {isEventsView ? (
            <div className="max-w-7xl mx-auto">
              <MyEventsSection isEventsView={isEventsView} navigate={navigate} />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Header */}
              <div className="glass-dark rounded-xl p-5 border-2 border-[#FF0000] text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/4 rounded-full blur-3xl" />
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary/50">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <h1 className="font-display font-bold text-3xl text-foreground mb-2 uppercase">
                  {user.name || user.username || "Warrior"}
                </h1>
                <p className="text-muted-foreground font-body">{user.email}</p>
              </div>

              {/* Form */}
              <div className="glass-dark rounded-xl p-5 border-2 border-[#FF0000] shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display font-bold text-2xl uppercase">Profile <span className="flame-text">Details</span></h2>
                  <Button
                    variant={isEditing ? "flame" : "outline"}
                    size="sm"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isSaving}
                    className="gap-2 border-[#FF0000] hover:bg-red-600"
                  >
                    {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    {isEditing ? (isSaving ? "Saving..." : "Save") : "Edit"}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-left">
                  {[
                    { label: "Full Name", key: "full_name", val: user.name || user.username },
                    { label: "College ID", key: "collegeId", val: user.collegeId, disabled: !isAdmin },
                    { label: "Game", key: "gameYouPlay", val: user.gameYouPlay || user.game, type: "select", disabled: role !== "super_admin", fullWidth: true },
                    { label: "In-Game Name", key: "inGameName", val: user.inGameName },
                    { label: "In-Game ID", key: "inGameId", val: user.inGameId },
                    { label: "Email", key: "email", val: user.email, readOnly: true },
                    { label: "Mobile", key: "mobile", val: user.mobile, disabled: !isAdmin, max: 10 }
                  ].map((field) => (
                    <div key={field.key} className={`space-y-2 ${field.fullWidth ? "col-span-1 md:col-span-2" : ""}`}>
                      <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">{field.label}</Label>
                      <div className={`bg-black/90 p-1.5 px-3 rounded-lg border-2 transition-all min-h-[44px] flex items-center ${isEditing && !field.readOnly && !field.disabled ? 'border-[#FF0000]' : 'border-[#FF0000]/30 opacity-80'}`}>
                        {isEditing && !field.readOnly && !field.disabled ? (
                          field.type === "select" ? (
                            <Select value={formData.gameYouPlay} onValueChange={(v) => setFormData({ ...formData, gameYouPlay: v })}>
                              <SelectTrigger className="w-full bg-transparent border-0 p-0 text-white h-5 focus:ring-0 focus:ring-offset-0 text-sm shadow-none ring-0 outline-none !border-0 !shadow-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-red-600">
                                {["Free Fire", "BGMI", "Valorant", "Call Of Duty"].map(g => (
                                  <SelectItem key={g} value={g} className="hover:bg-red-600/20 focus:bg-red-600/20">
                                    {g}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <input
                              value={formData[field.key as keyof typeof formData]}
                              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                              className="w-full bg-transparent border-none p-0 h-5 text-white focus:outline-none text-sm outline-none ring-0"
                              maxLength={field.max}
                            />
                          )
                        ) : (
                          <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center">{field.val || "Not set"}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Bio</Label>
                    <div className={`bg-black/90 p-2.5 px-3 rounded-lg border-2 transition-all ${isEditing ? 'border-[#FF0000]' : 'border-[#FF0000]/30'}`}>
                      {isEditing ? (
                        <textarea
                          value={formData.bio}
                          onChange={e => {
                            setFormData({ ...formData, bio: e.target.value });
                            // Auto-resize textarea
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          onFocus={e => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          ref={el => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = el.scrollHeight + 'px';
                            }
                          }}
                          maxLength={160}
                          rows={2}
                          className="w-full bg-transparent border-none p-0 text-white focus:outline-none text-sm outline-none ring-0 resize-none overflow-hidden"
                          style={{ minHeight: '40px' }}
                        />
                      ) : (
                        <p className="text-gray-300 font-display font-medium text-sm break-words whitespace-pre-wrap" style={{ minHeight: '20px' }}>{user.bio || "No bio yet"}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label className="text-red-500 font-bold uppercase text-[11px] tracking-wider">Member Since</Label>
                    <div className="bg-black/90 p-1.5 px-3 rounded-lg border-2 transition-all min-h-[44px] flex items-center border-[#FF0000]/30 opacity-80">
                      <p className="text-gray-300 font-display font-medium text-sm h-5 flex items-center">{user.createdAt ? format(new Date(user.createdAt), "PPP") : "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security */}
              {!isEditing && (
                <div className="glass-dark rounded-xl p-5 sm:p-8 border-2 border-[#FF0000] shadow-2xl relative overflow-hidden">
                  <h2 className="font-display font-bold text-2xl mb-6 uppercase">Account <span className="flame-text">Security</span></h2>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button variant="outline" className="flex-1 gap-2.5 border-[#FF0000] hover:bg-red-700 h-12 px-5 justify-center text-sm font-display" onClick={() => { setEmailDialogOpen(true); setOtpStep(1); }}>
                      <Mail className="w-4 h-4 shrink-0" /> Change Email
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2.5 border-[#FF0000] hover:bg-red-700 h-12 px-5 justify-center text-sm font-display" onClick={() => { setPassDialogOpen(true); setOtpStep(1); }}>
                      <Lock className="w-4 h-4 shrink-0" /> Change Password
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <Dialog open={emailDialogOpen} onOpenChange={(open) => { setEmailDialogOpen(open); if (!open) setOtpStep(1); }}>
        <DialogContent className="bg-black border-2 border-red-600 text-white rounded-2xl gap-6 w-[88vw] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase">Change Email</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {otpStep === 1 && "Security Check: Verify current email."}
              {otpStep === 2 && `Code sent to ${user?.email}`}
              {otpStep === 3 && "Enter new email address."}
              {otpStep === 4 && `Code sent to ${securityData.newEmail}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {otpStep === 1 && <div className="flex justify-center"><ShieldCheck className="w-16 h-16 text-red-600 animate-pulse" /></div>}
            {(otpStep === 2 || otpStep === 4) && <Input placeholder="000000" maxLength={6} className="bg-black border-red-600 text-center tracking-[1em] text-2xl" value={securityData.otp} onChange={e => setSecurityData({ ...securityData, otp: e.target.value })} />}
            {otpStep === 3 && <Input placeholder="new@example.com" className="bg-black border-red-600 h-12" value={securityData.newEmail} onChange={e => setSecurityData({ ...securityData, newEmail: e.target.value })} />}
          </div>
          <DialogFooter className="!flex !flex-row !justify-between sm:!justify-between gap-3">
            <Button variant="ghost" className="border border-[#FF0000] bg-transparent hover:bg-[#FF0000] hover:text-white text-white" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
            {otpStep === 1 && <Button variant="flame" onClick={handleSendCurrentEmailOTP} disabled={isSecurityLoading}>Send Code</Button>}
            {otpStep === 2 && <Button variant="flame" onClick={handleVerifyCurrentEmailOTP} disabled={isSecurityLoading}>Verify</Button>}
            {otpStep === 3 && <Button variant="flame" onClick={handleSendNewEmailOTP} disabled={isSecurityLoading}>Send to New</Button>}
            {otpStep === 4 && <Button variant="flame" onClick={handleVerifyNewEmailOTP} disabled={isSecurityLoading}>Update</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passDialogOpen} onOpenChange={setPassDialogOpen}>
        <DialogContent className="bg-black border-2 border-red-600 text-white rounded-2xl gap-6 w-[88vw] max-w-sm">
          <DialogHeader><DialogTitle className="font-display text-2xl uppercase">Change Password</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            {otpStep === 1 && <div className="flex justify-center"><ShieldCheck className="w-16 h-16 text-red-600 animate-pulse" /></div>}
            {otpStep === 2 && <Input placeholder="000000" maxLength={6} className="bg-black border-red-600 text-center tracking-[1em] text-2xl" value={securityData.otp} onChange={e => setSecurityData({ ...securityData, otp: e.target.value })} />}
            {otpStep === 3 && (
              <div className="space-y-4">
                <Input type="password" placeholder="New Password" value={securityData.newPassword} onChange={e => setSecurityData({ ...securityData, newPassword: e.target.value })} className="bg-black border-red-600" />
                <Input type="password" placeholder="Confirm Password" value={securityData.confirmPassword || ''} onChange={e => setSecurityData({ ...securityData, confirmPassword: e.target.value })} className="bg-black border-red-600" />
              </div>
            )}
          </div>
          <DialogFooter className="!flex !flex-row !justify-between sm:!justify-between gap-3">
            <Button variant="ghost" className="border border-[#FF0000] bg-transparent hover:bg-[#FF0000] hover:text-white text-white" onClick={() => setPassDialogOpen(false)}>Cancel</Button>
            {otpStep === 1 && <Button variant="flame" onClick={handleSendPasswordOTP} disabled={isSecurityLoading}>Send Code</Button>}
            {otpStep === 2 && <Button variant="flame" onClick={handleVerifyPasswordOTP} disabled={isSecurityLoading}>Verify Code</Button>}
            {otpStep === 3 && <Button variant="flame" onClick={handleResetPassword} disabled={isSecurityLoading}>Update Password</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!isAdmin && <Footer />}
    </div>
  );
};

export default Profile;
