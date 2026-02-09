import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight, Clock } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mockEvents } from "@/lib/mock-data";
import { format } from "date-fns";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const EventsPreview = () => {
  const navigate = useNavigate();
  const titleAnim = useScrollAnimation();

  const { data: events, isLoading } = useQuery({
    queryKey: ["home-upcoming-events"],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events`);
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();

        // Filter future events and sort by date
        const upcoming = data
          .filter((e: any) => new Date(e.event_date) > new Date())
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || a.created_at || a.event_date).getTime();
            const dateB = new Date(b.createdAt || b.created_at || b.event_date).getTime();
            return dateB - dateA;
          });

        return upcoming.slice(0, 3);
      } catch (error) {
        console.error("Error fetching homepage events:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const displayEvents = events || [];

  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div
          ref={titleAnim.elementRef}
          className={`text-center mb-16 scroll-fade-up ${titleAnim.isVisible ? 'scroll-visible' : ''}`}
        >
          <span className="font-display text-primary uppercase tracking-widest text-base mb-4 block">
            Upcoming Battles
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl mx-auto mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-16 after:h-1.5 after:bg-gradient-to-r after:from-primary after:to-transparent">
            NEXT <span className="flame-text">EVENTS</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader />
            </div>
          ) : displayEvents.length > 0 ? (
            displayEvents.map((event) => {
              return (
                <div
                  key={event.id || event._id}
                  className="glass-dark rounded-xl overflow-hidden border border-red-600/50 md:border-red-600 transition-all group w-[95%] md:w-full mx-auto"
                >
                  {/* Event header with gradient */}
                  <div className="h-2 bg-flame-gradient" />

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary border border-primary text-white text-[10px] font-bold font-display uppercase tracking-wider shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-white" />
                        {format(new Date(event.event_date), "MMM dd, yyyy")}
                      </div>
                      {event.game && (
                        <span className="px-3 py-1 rounded-full bg-primary border border-primary text-white text-[10px] font-bold font-display uppercase tracking-wider shadow-sm">
                          {event.game}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-base mb-6 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-muted-foreground text-xs font-display border border-primary hover:border-primary transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {event.location || "TBA"}
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-muted-foreground text-xs font-display border border-primary hover:border-primary transition-colors">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>
                          {format(new Date(event.event_date), "h:mm a")}
                          {event.end_time && ` - ${format(new Date(event.end_time), "h:mm a")}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full md:col-span-2 lg:col-span-3 py-16 px-6 sm:px-12 text-center glass-dark rounded-3xl border-2 border-red-600 mx-auto w-[90%] sm:w-full max-w-3xl relative overflow-hidden my-8">
              <div className="absolute inset-0 bg-red-600/5 blur-3xl" />
              <div className="relative z-10">
                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-4" />
                <h3 className="text-white font-display text-xl sm:text-2xl uppercase tracking-widest mb-3">No Upcoming Events</h3>
                <p className="text-muted-foreground font-body text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                  The battlefield is quiet for now. Stay tuned for upcoming tournaments and matches!
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="flame-outline"
            size="lg"
            onClick={() => navigate("/events")}
            className="group text-base px-8 py-5"
          >
            View All Events
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>


      </div>
    </section>
  );
};
