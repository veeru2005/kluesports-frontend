import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mockEvents } from "@/lib/mock-data";
import { format } from "date-fns";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const EventsPreview = () => {
  const navigate = useNavigate();
  const titleAnim = useScrollAnimation();
  const event1Anim = useScrollAnimation();
  const event2Anim = useScrollAnimation();
  const event3Anim = useScrollAnimation();

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
          .sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

        return upcoming.slice(0, 3);
      } catch (error) {
        console.error("Error fetching homepage events:", error);
        return [];
      }
    },
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
          <h2 className="font-display font-bold text-5xl md:text-6xl section-title mx-auto">
            NEXT <span className="flame-text">EVENTS</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="glass-dark rounded-xl h-64 animate-pulse"
              />
            ))
          ) : displayEvents.length > 0 ? (
            displayEvents.map((event, index) => {
              const eventAnims = [event1Anim, event2Anim, event3Anim];
              const eventAnim = eventAnims[index] || { elementRef: null, isVisible: false };
              return (
                <div
                  key={event.id}
                  ref={eventAnim.elementRef}
                  className={`glass-dark rounded-xl overflow-hidden border border-red-600 hover:border-red-500 transition-all group hover:ember-glow scroll-scale scroll-delay-${index * 100} ${eventAnim.isVisible ? 'scroll-visible' : ''}`}
                >
                  {/* Event header with gradient */}
                  <div className="h-2 bg-flame-gradient" />

                  <div className="p-6">
                    {/* Date badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-base font-display mb-4">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.event_date), "MMM dd, yyyy")}
                    </div>

                    <h3 className="font-display font-bold text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-lg mb-6 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-primary" />
                        {event.location || "TBA"}
                      </div>
                      {event.max_participants && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-primary" />
                          {event.max_participants} slots
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full md:col-span-2 lg:col-span-3 w-full glass-dark border-2 border-red-600 rounded-xl p-12 text-center my-8">
              <Calendar className="w-16 h-16 text-primary mx-auto mb-4"/>
              <h3 className="text-xl font-bold text-white font-display mb-2">No Upcoming Events</h3>
              <p className="text-white/60 font-body">
                The battlefield is quiet for now. Stay tuned for upcoming tournaments and matches!
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="flame-outline"
            size="lg"
            onClick={() => navigate("/events")}
            className="group text-lg px-8 py-6"
          >
            View All Events
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
