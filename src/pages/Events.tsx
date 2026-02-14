import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { mockEvents } from "@/lib/mock-data";
import { Calendar, MapPin, Users, Clock, X, Gamepad2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FlameParticles } from "@/components/ui/FlameParticles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { EventImage } from "@/components/ui/EventImage";
import { User } from "@/contexts/AuthContext";

interface Event {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  max_participants: number;
  game: string;
  image_url?: string;
  end_time?: string;
  is_registration_open?: boolean;
  registrationCount?: number;
  createdAt?: string;
  created_at?: string;
}

interface UserRegistration {
  eventId: string;
  // add other fields if needed
}



import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EventCardProps {
  event: Event;
  index: number;
  isPast?: boolean;
  onRegister?: (event: Event) => void;
  isRegistered?: boolean;
  userRole?: string;
}

const EventCard = ({ event, index, isPast, onRegister, isRegistered, userRole }: EventCardProps) => (
  <Dialog>
    <div
      className="glass-dark rounded-xl overflow-hidden flame-card-style transition-all group flex flex-col h-full relative w-[90%] sm:w-full sm:max-w-[280px] mx-auto sm:mx-0"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image section - not clickable */}
      <div className="aspect-[3/4] w-full relative overflow-hidden flex items-center justify-center">
        {event.image_url ? (
          <EventImage src={event.image_url} alt={event.title} />
        ) : (
          <div className="text-center p-6 bg-black/20 w-full h-full flex flex-col items-center justify-center">
            <div className="text-primary/20 font-display font-bold text-3xl uppercase tracking-tighter">
              KLU <span className="flame-text opacity-40">ESPORTS</span>
            </div>
          </div>
        )}

        {/* Badge Overlays */}
        <div className="absolute top-4 left-0 right-0 z-10 flex justify-center items-start pointer-events-none">
          {event.game && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold font-display uppercase tracking-wider shadow-sm">
              {event.game}
            </span>
          )}
        </div>
      </div>

      {/* Slots Progress Bar & View Details Button */}
      <div className="pt-1 pb-2 px-3 bg-black/30 space-y-1.5">
        {/* Slots Progress Section */}
        {(() => {
          const filled = event.registrationCount || 0;
          const total = event.max_participants || 1;
          const percentFilled = (filled / total) * 100;
          const isFull = filled >= total;
          const isManuallyClosed = event.is_registration_open === false;
          const colorClass = percentFilled < 50 ? "bg-green-500" : percentFilled < 80 ? "bg-orange-500" : "bg-red-500";

          return (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-display uppercase tracking-wider">
                <span className="text-white font-bold">
                  {`${filled}/${total} slots filled`}
                </span>
                <span className="text-white font-bold">{Math.max(0, total - filled)} left</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isManuallyClosed ? 'bg-gray-500' : isFull ? 'bg-red-500' : colorClass} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(percentFilled, 100)}%` }}
                />
              </div>
            </div>
          );
        })()}

        <DialogTrigger asChild>
          <Button
            variant={event.is_registration_open === false ? "outline" : "flame"}
            className={`w-full h-auto min-h-[2.25rem] py-2 whitespace-normal leading-tight text-[10px] font-bold tracking-widest uppercase cursor-pointer ${event.is_registration_open === false
              ? "bg-neutral-800 text-gray-400 border-neutral-700 hover:bg-neutral-800 hover:text-gray-400 hover:border-neutral-700"
              : (event.max_participants && (event.registrationCount || 0) >= event.max_participants)
                ? "bg-red-900/50 text-red-200 border-red-900/50 hover:bg-red-900/50 shadow-none"
                : ""
              }`}
          >
            {event.is_registration_open === false
              ? "Registration Not Opened"
              : (event.max_participants && (event.registrationCount || 0) >= event.max_participants)
                ? "Registrations Closed"
                : "View Details & Register Now"}
          </Button>
        </DialogTrigger>
      </div>
    </div>
    <DialogContent className="glass-dark border-2 border-primary w-[92vw] max-w-[500px] text-white px-3 sm:px-8 pb-5 sm:pb-8 pt-4 sm:pt-6 max-h-[85vh] flex flex-col rounded-3xl shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] [&>button]:hidden">
      <div className="overflow-y-auto custom-scrollbar flex flex-col gap-4 sm:gap-6 pb-1">

        {/* Top Header Section */}
        <div className="flex items-center justify-between w-full">
          <div>
            {(() => {
              const slotsLeft = event.max_participants - (event.registrationCount || 0);
              const percentLeft = (slotsLeft / event.max_participants) * 100;
              const colorClass = percentLeft > 50 ? "bg-green-500" : percentLeft > 20 ? "bg-orange-500" : "bg-red-500";
              const isClosed = event.is_registration_open === false || slotsLeft <= 0;

              return (
                <span className={`border ${isClosed ? 'bg-gray-600 border-gray-600' : `${colorClass} border-transparent`} text-white px-2 py-1 rounded-md text-[10px] font-bold font-display tracking-wider uppercase shadow-lg`}>
                  {isClosed ? "REGISTRATION CLOSED" : `${slotsLeft} SLOTS LEFT`}
                </span>
              );
            })()}
          </div>

          <div>
            {event.game && (
              <span className="bg-primary/90 border border-primary text-white px-2 py-1 rounded-md text-[10px] font-bold font-display tracking-wider uppercase shadow-lg">
                {event.game}
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white font-display leading-tight text-left uppercase tracking-tight">
            {event.title}
          </h2>
          <p className="text-white/60 text-sm leading-relaxed text-left font-body whitespace-pre-line">
            {event.description}
          </p>
        </div>


        {/* Details List - Vertical Stack */}
        <div className="flex flex-col gap-4 sm:gap-5 text-sm text-white/90 bg-black/50 p-4 sm:p-6 rounded-2xl border-2 border-[#FF0000] shadow-[0_0_15px_-5px_rgba(255,0,0,0.3)]">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-xs sm:text-sm whitespace-nowrap">
              {format(new Date(event.event_date), "MMM dd, yyyy")}
              {event.end_time && format(new Date(event.end_time), "yyyy-MM-dd") !== format(new Date(event.event_date), "yyyy-MM-dd") && ` - ${format(new Date(event.end_time), "MMM dd, yyyy")}`}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-sm">
              {format(new Date(event.event_date), "h:mm a")}
              {event.end_time && ` - ${format(new Date(event.end_time), "h:mm a")}`}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-sm truncate">{event.location || "TBA"}</span>
          </div>
          <div className="flex items-center gap-4">
            <Users className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-sm">{event.max_participants ? `${event.max_participants} Slots` : "Unlimited Slots"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-8 pt-5 sm:pt-6">
          <DialogClose asChild>
            <Button
              variant="flame-outline"
              className="h-10 flex-1 text-xs sm:text-sm uppercase tracking-wide leading-tight whitespace-normal font-display hover:text-white"
            >
              Close
            </Button>
          </DialogClose>
          {!isPast && onRegister && (
            <DialogClose asChild>
              {isRegistered ? (
                <Button
                  className="h-10 flex-1 text-xs sm:text-sm uppercase tracking-wide leading-tight whitespace-normal font-display bg-green-600 text-white border border-green-600 hover:bg-green-600 cursor-not-allowed shadow-[0_0_15px_-5px_rgba(34,197,94,0.5)]"
                  disabled
                >
                  Registered
                </Button>
              ) : userRole && userRole !== 'user' ? (
                <Button
                  className="h-10 flex-1 text-xs sm:text-sm uppercase tracking-wide leading-tight whitespace-normal font-display bg-red-600/50 text-white border border-red-600/50 cursor-not-allowed"
                  disabled
                >
                  Admin Restricted
                </Button>
              ) : event.is_registration_open === false ? (
                <Button
                  className="h-10 flex-1 text-xs sm:text-sm uppercase tracking-wide leading-tight whitespace-normal font-display bg-gray-600 text-white border border-gray-600 cursor-not-allowed"
                  disabled
                >
                  Registration Not Opened
                </Button>
              ) : (event.max_participants && (event.registrationCount || 0) >= event.max_participants) ? (
                <Button
                  className="h-10 flex-1 text-xs sm:text-sm uppercase tracking-wide leading-tight whitespace-normal font-display bg-red-600 text-white border border-red-600 cursor-not-allowed shadow-[0_0_15px_-5px_rgba(220,38,38,0.5)]"
                  disabled
                >
                  Registrations Closed
                </Button>
              ) : (
                <Button
                  variant="flame"
                  className="h-10 flex-1 text-xs sm:text-sm uppercase tracking-wide leading-tight whitespace-normal font-display hover:text-white"
                  onClick={() => onRegister(event)}
                >
                  Register Now
                </Button>
              )}
            </DialogClose>
          )}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);



const PastEventCard = ({ event, index }: { event: Event, index: number }) => (
  <Dialog>
    <DialogTrigger asChild>
      <div
        className="glass-dark rounded-xl overflow-hidden flame-card-style transition-all group flex flex-col h-full cursor-pointer relative w-[90%] sm:w-full mx-auto sm:mx-0"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="aspect-[3/4] w-full relative overflow-hidden flex items-center justify-center border-b border-white/5">
          {event.image_url ? (
            <EventImage src={event.image_url} alt={event.title} />
          ) : (
            <div className="text-center p-6 bg-black/20 w-full h-full flex flex-col items-center justify-center">
              <div className="text-primary/20 font-display font-bold text-3xl uppercase tracking-tighter">
                KLU <span className="flame-text opacity-40">ESPORTS</span>
              </div>
            </div>
          )}

          {/* Badge Overlays */}
          <div className="absolute top-4 left-0 right-0 z-10 flex justify-center items-start pointer-events-none">
            {event.game && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold font-display uppercase tracking-wider shadow-sm">
                {event.game}
              </span>
            )}
          </div>

          {/* Title & Date Overlay */}

        </div>
      </div>
    </DialogTrigger>
    <DialogContent className="glass-dark border-2 border-primary w-[92vw] max-w-[500px] text-white px-3 sm:px-8 pb-5 sm:pb-8 pt-4 sm:pt-6 max-h-[85vh] flex flex-col rounded-3xl shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] [&>button]:hidden">
      <div className="overflow-y-auto custom-scrollbar flex flex-col gap-4 sm:gap-6 pb-1">

        {/* Top Header Section */}
        <div className="flex items-center justify-between w-full">
          <div>
            <span className="bg-primary/90 border border-primary text-white px-2 py-1 rounded-md text-[10px] font-bold font-display tracking-wider uppercase shadow-lg">
              Completed
            </span>
          </div>

          <div>
            {event.game && (
              <span className="bg-primary/90 border border-primary text-white px-2 py-1 rounded-md text-[10px] font-bold font-display tracking-wider uppercase shadow-lg">
                {event.game}
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white font-display leading-tight text-left uppercase tracking-tight">
            {event.title}
          </h2>
          <p className="text-white/60 text-sm leading-relaxed text-left font-body whitespace-pre-line">
            {event.description}
          </p>
        </div>


        {/* Details List - Vertical Stack */}
        <div className="flex flex-col gap-4 sm:gap-5 text-sm text-white/90 bg-black/50 p-4 sm:p-6 rounded-2xl border-2 border-[#FF0000] shadow-[0_0_15px_-5px_rgba(255,0,0,0.3)]">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-xs sm:text-sm whitespace-nowrap">
              {format(new Date(event.event_date), "MMM dd, yyyy")}
              {event.end_time && format(new Date(event.end_time), "yyyy-MM-dd") !== format(new Date(event.event_date), "yyyy-MM-dd") && ` - ${format(new Date(event.end_time), "MMM dd, yyyy")}`}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-sm">
              {format(new Date(event.event_date), "h:mm a")}
              {event.end_time && ` - ${format(new Date(event.end_time), "h:mm a")}`}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-sm truncate">{event.location || "TBA"}</span>
          </div>
          <div className="flex items-center gap-4">
            <Users className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-sm">{event.max_participants ? `${event.max_participants} Slots` : "Unlimited Slots"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-5 sm:pt-6 flex flex-row gap-4">
          <DialogClose asChild>
            <Button
              variant="flame-outline"
              className="h-10 text-xs uppercase tracking-[0.2em] font-display hover:text-white w-full"
            >
              Close
            </Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);



const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const titleAnim = useScrollAnimation();
  const upcomingHeaderAnim = useScrollAnimation();
  const upcomingGridAnim = useScrollAnimation();
  const conductedHeaderAnim = useScrollAnimation();
  const conductedGridAnim = useScrollAnimation();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const [eventsRes, summaryRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/registrations/all-summary`)
      ]);

      if (!eventsRes.ok) throw new Error('Failed to fetch events');
      const events = await eventsRes.json();
      let summaries = [];
      if (summaryRes.ok) {
        summaries = await summaryRes.json();
      }

      return events.map((event: Event) => {
        const eventId = event._id?.toString() || event._id;
        const summary = summaries.find((s: { _id: string; count: number }) => {
          const summaryId = s._id?.toString() || s._id;
          return summaryId === eventId;
        });
        return {
          ...event,
          registrationCount: summary ? summary.count : 0
        };
      });
    },
  });

  const { data: myRegistrations } = useQuery({
    queryKey: ["myRegistrations"],
    queryFn: async () => {
      const token = localStorage.getItem("inferno_token");
      if (!token) return [];

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/registrations/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return response.json();
      } catch (e) {
        return [];
      }
    },
    initialData: []
  });

  const registeredEventIds = new Set(myRegistrations?.map((r: { eventId: string }) => r.eventId) || []);

  const displayEvents = events?.length ? events : [];

  const handleRegister = (event: Event) => {
    const eventId = event._id || event.id;
    const params = new URLSearchParams({
      eventId,
      eventTitle: event.title,
      game: event.game
    });
    navigate(`/register?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-6 relative overflow-hidden">
          <FlameParticles />
          <div className="absolute inset-0 hero-gradient" />
          <div className="container mx-auto px-4 relative z-10">
            <div
              ref={titleAnim.elementRef}
              className={`max-w-4xl mx-auto text-center scroll-fade-up ${titleAnim.isVisible ? 'scroll-visible' : ''}`}
            >
              <span className="font-display text-primary uppercase tracking-widest text-sm mb-2 block">
                Join The Battle
              </span>
              <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-6xl mb-3 whitespace-nowrap uppercase">
                <span className="text">EVENTS</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
                From weekly tournaments to championship finals, find your next battle below.
              </p>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div
              ref={upcomingHeaderAnim.elementRef}
              className={`flex items-center justify-center gap-4 mb-12 scroll-fade-up ${upcomingHeaderAnim.isVisible ? 'scroll-visible' : ''}`}
            >
              <div className="h-[1px] flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
              <h2 className="font-display font-bold text-2xl md:text-4xl uppercase tracking-widest text-center relative inline-block after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-primary after:to-transparent">
                UPCOMING <span className="flame-text text-nowrap">EVENTS</span>
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            <Tabs defaultValue="all" className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="glass-dark border border-primary/20 p-1 flex flex-wrap justify-center gap-1 sm:gap-0 h-auto">
                  <TabsTrigger value="all" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">ALL</TabsTrigger>
                  <TabsTrigger value="Free Fire" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">Free Fire</TabsTrigger>
                  <TabsTrigger value="BGMI" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">BGMI</TabsTrigger>
                  <TabsTrigger value="Valorant" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">Valorant</TabsTrigger>
                  <TabsTrigger value="Call Of Duty" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">COD</TabsTrigger>
                </TabsList>
              </div>

              {["all", "Free Fire", "BGMI", "Valorant", "Call Of Duty"].map((tab) => {
                const now = new Date();
                const upcoming = displayEvents
                  .filter((e) => (tab === "all" || e.game === tab) && new Date(e.event_date) >= now)
                  .sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.created_at || a.event_date).getTime();
                    const dateB = new Date(b.createdAt || b.created_at || b.event_date).getTime();
                    return dateB - dateA;
                  });

                return (
                  <TabsContent key={tab} value={tab} className="outline-none">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader />
                      </div>
                    ) : upcoming.length > 0 ? (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                      >
                        {upcoming.map((event, index) => (
                          <EventCard
                            key={event.id || event._id}
                            event={event}
                            index={index}
                            onRegister={handleRegister}
                            isRegistered={registeredEventIds.has(event._id || event.id)}
                            userRole={user?.role}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="col-span-full py-16 px-6 sm:px-12 text-center glass-dark rounded-3xl border-2 border-[#FF0000] mx-auto w-[90%] sm:w-full max-w-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-600/5 blur-3xl" />
                        <div className="relative z-10">
                          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-4" />
                          <h3 className="text-white font-display text-xl sm:text-2xl uppercase tracking-widest mb-3">No Upcoming Battles</h3>
                          <p className="text-muted-foreground font-body text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                            No {tab === "all" ? "" : tab} events currently scheduled. Check back soon for new tournaments!
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </section>

        {/* Conducted Events Section */}
        <section className="pt-12 pb-24">
          <div className="container mx-auto px-4">
            <div
              ref={conductedHeaderAnim.elementRef}
              className={`flex items-center justify-center gap-4 mb-12 scroll-fade-up ${conductedHeaderAnim.isVisible ? 'scroll-visible' : ''}`}
            >
              <div className="h-[1px] flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
              <h2 className="font-display font-bold text-2xl md:text-4xl uppercase tracking-widest text-center relative inline-block after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-primary after:to-transparent">
                <span className="flame-text text-nowrap">EVENTS</span> CONDUCTED
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            <Tabs defaultValue="all" className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="glass-dark border border-primary/20 p-1 flex flex-wrap justify-center gap-1 sm:gap-0 h-auto">
                  <TabsTrigger value="all" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">ALL</TabsTrigger>
                  <TabsTrigger value="Free Fire" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">Free Fire</TabsTrigger>
                  <TabsTrigger value="BGMI" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">BGMI</TabsTrigger>
                  <TabsTrigger value="Valorant" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">Valorant</TabsTrigger>
                  <TabsTrigger value="Call Of Duty" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">COD</TabsTrigger>
                </TabsList>
              </div>

              {["all", "Free Fire", "BGMI", "Valorant", "Call Of Duty"].map((tab) => {
                const now = new Date();
                const past = displayEvents
                  .filter((e) => (tab === "all" || e.game === tab) && new Date(e.event_date) < now)
                  .sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.created_at || a.event_date).getTime();
                    const dateB = new Date(b.createdAt || b.created_at || b.event_date).getTime();
                    return dateB - dateA;
                  });

                return (
                  <TabsContent key={tab} value={tab} className="outline-none">
                    {past.length > 0 ? (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                      >
                        {past.map((event, index) => (
                          <PastEventCard key={event.id || event._id} event={event} index={index} />
                        ))}
                      </div>
                    ) : (
                      <div className="col-span-full py-16 px-6 sm:px-12 text-center glass-dark rounded-3xl border-2 border-[#FF0000] mx-auto w-[90%] sm:w-full max-w-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-600/5 blur-3xl" />
                        <div className="relative z-10">
                          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-4" />
                          <h3 className="text-white font-display text-xl sm:text-2xl uppercase tracking-widest mb-3">No Events Completed</h3>
                          <p className="text-muted-foreground font-body text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                            No {tab === "all" ? "" : tab} events have been completed. Stay tuned for results!
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
