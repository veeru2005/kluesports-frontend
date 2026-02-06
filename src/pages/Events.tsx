import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { mockEvents } from "@/lib/mock-data";
import { Calendar, MapPin, Users, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FlameParticles } from "@/components/ui/FlameParticles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const placeholderEvents = [
  {
    id: "1",
    title: "Grand Championship Finals 2024",
    description: "The ultimate showdown where the best of the best compete for the crown. Watch as top-tier players clash in an epic battle for supremacy.",
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Main Arena - Online",
    max_participants: 64,
    image_url: null,
    game: "Valorant"
  },
  {
    id: "2",
    title: "Weekly Warzone Wednesday",
    description: "Jump into the action every Wednesday with our signature battle royale event. Squad up and fight for victory!",
    event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Discord Server",
    max_participants: 100,
    image_url: null,
    game: "BGMI"
  },
  {
    id: "3",
    title: "Pro League Qualifiers",
    description: "Your chance to prove yourself and qualify for the KLU-Esports Pro League. Top performers earn their spot among the elite.",
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Competitive Arena",
    max_participants: 32,
    image_url: null,
    game: "Free Fire"
  },
  {
    id: "4",
    title: "Rookie Rumble",
    description: "New to competitive gaming? This beginner-friendly tournament is the perfect place to start your journey.",
    event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Training Grounds",
    max_participants: 50,
    image_url: null,
    game: "Valorant"
  },
  {
    id: "5",
    title: "Midnight Mayhem",
    description: "Late night gaming at its finest. Join us for an intense after-hours gaming session with exclusive rewards.",
    event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Night Arena",
    max_participants: 80,
    image_url: null,
    game: "Free Fire"
  },
  {
    id: "6",
    title: "Community Game Night",
    description: "A casual gathering for all members. Play your favorite games, meet new friends, and have fun!",
    event_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Community Hub",
    max_participants: 200,
    image_url: null,
    game: "BGMI"
  },
];

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EventCardProps {
  event: any;
  index: number;
  isPast?: boolean;
}

const EventCard = ({ event, index, isPast }: EventCardProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <div
        className="glass-dark rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all group hover:ember-glow flex flex-col h-full cursor-pointer relative w-[90%] mx-auto"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="aspect-[4/5] w-full bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden flex items-center justify-center border-b border-border/50">
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-6 bg-black/20 w-full h-full flex flex-col items-center justify-center">
              <div className="text-primary/20 font-display font-bold text-3xl uppercase tracking-tighter">
                KLU <span className="flame-text opacity-40">ESPORTS</span>
              </div>
            </div>
          )}

          {/* Badge Overlays */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-10 flex justify-between items-start pointer-events-none">
            <div className="flex gap-2">
            </div>
            {event.game && (
              <span className={`px-2 py-0.5 rounded-full backdrop-blur-md border text-[8px] sm:text-[9px] font-display uppercase tracking-wider ${isPast ? "bg-black/60 border-white/20 text-white/70" : "bg-black/60 border-primary/30 text-primary"}`}>
                {event.game}
              </span>
            )}
          </div>

          {/* Hover Details Overlay (Only for Upcoming) */}
          {!isPast && (
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-primary/90 text-white px-2 sm:px-3 py-1 rounded text-[8px] sm:text-[10px] font-display uppercase tracking-widest shadow-lg shadow-primary/20">
                View Details
              </span>
            </div>
          )}

          {/* Title Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 sm:p-4">
            <p className="text-white font-display text-sm sm:text-lg uppercase tracking-wider line-clamp-1">{event.title}</p>
          </div>
        </div>
      </div>
    </DialogTrigger>
    <DialogContent className="glass-dark border-2 border-primary w-[85vw] max-w-[500px] text-white px-8 pb-8 pt-6 overflow-hidden max-h-[90vh] flex flex-col rounded-3xl shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] [&>button]:hidden">
      <div className="overflow-y-auto custom-scrollbar flex flex-col gap-8">

        {/* Top Header Section */}
        <div className="flex items-center justify-between w-full">
          <div>
            {isPast && (
              <span className="bg-red-600/90 border border-red-500 text-white px-2 py-1 rounded-md text-[10px] font-bold font-display tracking-wider uppercase shadow-lg">
                Completed
              </span>
            )}
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
          <p className="text-white/60 text-sm leading-relaxed text-left font-body">
            {event.description}
          </p>
        </div>


        {/* Details List - Vertical Stack */}
        <div className="flex flex-col gap-5 text-sm text-white/90 bg-black/50 p-6 rounded-2xl border border-primary/50 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.2)]">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-sm">{format(new Date(event.event_date), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-sm">
              {format(new Date(event.event_date), "h:mm a")} - {format(new Date(new Date(event.event_date).getTime() + 2 * 60 * 60 * 1000), "h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-sm truncate">{event.location || "TBA"}</span>
          </div>
          <div className="flex items-center gap-4">
            <Users className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display tracking-wide uppercase text-sm">Limited Slots</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {!isPast ? (
            <Button variant="flame" className="w-full h-11 text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
              Register Now
            </Button>
          ) : (
            <DialogClose asChild>
              <button className="w-full h-12 rounded-full border-2 border-red-600 bg-transparent hover:bg-red-600 hover:text-white text-white font-display text-sm transition-all uppercase tracking-widest shadow-sm hover:shadow-lg flex items-center justify-center outline-none">
                Close
              </button>
            </DialogClose>
          )}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const Events = () => {
  const titleAnim = useScrollAnimation();
  const upcomingHeaderAnim = useScrollAnimation();
  const upcomingGridAnim = useScrollAnimation();
  const conductedHeaderAnim = useScrollAnimation();
  const conductedGridAnim = useScrollAnimation();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  const displayEvents = events?.length ? events : [];

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
              <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl mb-3">
                <span className="text">EVENTS</span>
              </h1>
              <p className="text-1xl text-muted-foreground font-body max-w-2xl mx-auto">
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
              <h2 className="font-display font-bold text-2xl md:text-4xl uppercase tracking-widest whitespace-nowrap px-4 text-center">
                UPCOMING <span className="flame-text">EVENTS</span>
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            <Tabs defaultValue="all" className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="glass-dark border border-border p-1 flex flex-wrap justify-center gap-1 sm:gap-0 h-auto">
                  <TabsTrigger value="all" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">All</TabsTrigger>
                  <TabsTrigger value="Free Fire" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">Free Fire</TabsTrigger>
                  <TabsTrigger value="BGMI" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">BGMI</TabsTrigger>
                  <TabsTrigger value="Valorant" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">Valorant</TabsTrigger>
                </TabsList>
              </div>

              {["all", "Free Fire", "BGMI", "Valorant"].map((tab) => {
                const now = new Date();
                const upcoming = displayEvents
                  .filter((e) => (tab === "all" || e.game === tab) && new Date(e.event_date) >= now)
                  .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

                return (
                  <TabsContent key={tab} value={tab} className="outline-none">
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="glass-dark rounded-xl h-[400px] animate-pulse" />
                        ))}
                      </div>
                    ) : upcoming.length > 0 ? (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      >
                        {upcoming.map((event, index) => (
                          <EventCard key={event.id || event._id} event={event} index={index} />
                        ))}
                      </div>
                    ) : (
                      <div className="col-span-full py-20 text-center glass-dark rounded-xl border-2 border-red-600">
                        <Calendar className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-white font-display text-2xl uppercase tracking-widest mb-2">No Upcoming Battles</h3>
                        <p className="text-muted-foreground font-body max-w-md mx-auto">
                          No {tab === "all" ? "" : tab} events currently scheduled. Check back soon for new tournaments!
                        </p>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </section>

        {/* Conducted Events Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div
              ref={conductedHeaderAnim.elementRef}
              className={`flex items-center justify-center gap-4 mb-12 scroll-fade-up ${conductedHeaderAnim.isVisible ? 'scroll-visible' : ''}`}
            >
              <div className="h-[1px] flex-1 bg-gradient-to-l from-white/20 to-transparent" />
              <h2 className="font-display font-bold text-2xl md:text-3xl uppercase tracking-widest whitespace-nowrap px-4 text-white text-center">
                <span className="flame-text">EVENTS</span> CONDUCTED
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            </div>

            <Tabs defaultValue="all" className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="glass-dark border border-white/5 p-1 flex flex-wrap justify-center gap-1 sm:gap-0 h-auto">
                  <TabsTrigger value="all" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">Completed</TabsTrigger>
                  <TabsTrigger value="Free Fire" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">Free Fire</TabsTrigger>
                  <TabsTrigger value="BGMI" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">BGMI</TabsTrigger>
                  <TabsTrigger value="Valorant" className="font-display px-3 sm:px-6 text-sm sm:text-base uppercase tracking-tighter">Valorant</TabsTrigger>
                </TabsList>
              </div>

              {["all", "Free Fire", "BGMI", "Valorant"].map((tab) => {
                const now = new Date();
                const past = displayEvents
                  .filter((e) => (tab === "all" || e.game === tab) && new Date(e.event_date) < now)
                  .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

                return (
                  <TabsContent key={tab} value={tab} className="outline-none">
                    {past.length > 0 ? (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      >
                        {past.map((event, index) => (
                          <EventCard key={event.id || event._id} event={event} index={index} isPast />
                        ))}
                      </div>
                    ) : (
                      <div className="col-span-full py-16 text-center glass-dark rounded-xl border border-white/5">
                        <p className="text-muted-foreground font-display uppercase tracking-widest opacity-50">No completed {tab === "all" ? "" : tab} events found</p>
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
