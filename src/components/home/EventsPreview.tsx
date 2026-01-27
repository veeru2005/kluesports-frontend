import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mockEvents } from "@/lib/mock-data";
import { format } from "date-fns";

export const EventsPreview = () => {
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500));
      return mockEvents.slice(0, 3);
    },
  });

  const placeholderEvents = [
    {
      id: "1",
      title: "Championship Finals",
      description: "The ultimate showdown between top contenders",
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Online Arena",
      max_participants: 64,
    },
    {
      id: "2",
      title: "Weekly Warzone",
      description: "Battle royale mayhem every weekend",
      event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Discord Server",
      max_participants: 100,
    },
    {
      id: "3",
      title: "Pro League Qualifiers",
      description: "Your chance to join the elite ranks",
      event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Main Stage",
      max_participants: 32,
    },
  ];

  const displayEvents = events?.length ? events : placeholderEvents;

  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="font-display text-primary uppercase tracking-widest text-base mb-4 block">
            Upcoming Battles
          </span>
          <h2 className="font-display font-bold text-5xl md:text-6xl section-title mx-auto">
            NEXT <span className="flame-text">EVENTS</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="glass-dark rounded-xl h-64 animate-pulse"
              />
            ))
            : displayEvents.map((event, index) => (
              <div
                key={event.id}
                className="glass-dark rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all group hover:ember-glow"
                style={{ animationDelay: `${index * 0.1}s` }}
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
            ))}
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
