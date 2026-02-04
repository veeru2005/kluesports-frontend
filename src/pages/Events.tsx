import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { mockEvents } from "@/lib/mock-data";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
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

const Events = () => {
  const titleAnim = useScrollAnimation();
  const tabsAnim = useScrollAnimation();
  const gridAnim = useScrollAnimation();

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
                UPCOMING <span className="flame-text">EVENTS</span>
              </h1>
              <p className="text-1xl text-muted-foreground font-body max-w-2xl mx-auto">
                From weekly tournaments to championship finals, find your next battle below.
              </p>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="all" className="space-y-8">
              <div
                ref={tabsAnim.elementRef}
                className={`flex justify-center scroll-fade-up ${tabsAnim.isVisible ? 'scroll-visible' : ''}`}
              >
                <TabsList className="glass-dark border border-border p-1 flex flex-wrap justify-center gap-1 sm:gap-0 h-auto">
                  <TabsTrigger value="all" className="font-display px-3 sm:px-6 text-sm sm:text-base">All Events</TabsTrigger>
                  <TabsTrigger value="Free Fire" className="font-display px-3 sm:px-6 text-sm sm:text-base">Free Fire</TabsTrigger>
                  <TabsTrigger value="BGMI" className="font-display px-3 sm:px-6 text-sm sm:text-base">BGMI</TabsTrigger>
                  <TabsTrigger value="Valorant" className="font-display px-3 sm:px-6 text-sm sm:text-base">Valorant</TabsTrigger>
                </TabsList>
              </div>

              {["all", "Free Fire", "BGMI", "Valorant"].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <div
                    ref={gridAnim.elementRef}
                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-fade-up ${gridAnim.isVisible ? 'scroll-visible' : ''}`}
                  >
                    {isLoading
                      ? [...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="glass-dark rounded-xl h-[400px] animate-pulse"
                        />
                      ))
                      : displayEvents
                        .filter((e) => tab === "all" || e.game === tab)
                        .map((event, index) => (
                          <div
                            key={event.id}
                            className="glass-dark rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all group hover:ember-glow flex flex-col h-full"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            {/* Event Image Placeholder / Header */}
                            <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden flex items-center justify-center border-b border-border/50">
                              <div className="text-center p-6">
                                <div className="text-primary font-display font-bold text-4xl mb-2">
                                  {format(new Date(event.event_date), "dd")}
                                </div>
                                <div className="text-muted-foreground font-display text-xl uppercase tracking-widest">
                                  {format(new Date(event.event_date), "MMM yyyy")}
                                </div>
                                {event.game && (
                                  <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-primary/30 text-primary text-xs font-display uppercase">
                                      {event.game}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                              <h3 className="font-display font-bold text-2xl text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2">
                                {event.title}
                              </h3>
                              <p className="text-muted-foreground font-body mb-6 line-clamp-3">
                                {event.description}
                              </p>

                              <div className="mt-auto space-y-4">
                                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" />
                                    {format(new Date(event.event_date), "h:mm a")}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    {event.location || "TBA"}
                                  </div>
                                  {event.max_participants && (
                                    <div className="flex items-center gap-2">
                                      <Users className="w-4 h-4 text-primary" />
                                      {event.max_participants} slots
                                    </div>
                                  )}
                                </div>

                                <Button
                                  variant="flame"
                                  className="w-full h-12 text-lg mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                  Register Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    {!displayEvents.filter((e) => tab === "all" || e.game === tab).length && (
                      <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground text-lg">No events found for {tab}.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
