import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { FlameParticles } from "@/components/ui/FlameParticles";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

import { Linkedin, Instagram, Mail } from "lucide-react";

const placeholderTeam = [
  { id: "1", name: "Phoenix", role: "Team Captain", bio: "Professional FPS player with 10+ years of competitive experience.", avatar_url: null, social_links: { linkedin: "#", instagram: "#", email: "mailto:phoenix@kluesports.com" } },
  { id: "2", name: "Shadow", role: "Strategist", bio: "Master tactician and former esports coach for top-tier teams.", avatar_url: null, social_links: { linkedin: "#", instagram: "#", email: "mailto:shadow@kluesports.com" } },
  { id: "3", name: "Blaze", role: "Content Lead", bio: "Streaming sensation with 1M+ followers across platforms.", avatar_url: null, social_links: { linkedin: "#", instagram: "#", email: "mailto:blaze@kluesports.com" } },
  { id: "4", name: "Viper", role: "Community Manager", bio: "Building communities and fostering competitive spirit since 2015.", avatar_url: null, social_links: { linkedin: "#", instagram: "#", email: "mailto:viper@kluesports.com" } },
  { id: "5", name: "Storm", role: "Pro Player", bio: "Multiple championship winner in FPS and Battle Royale games.", avatar_url: null, social_links: { linkedin: "#", instagram: "#", email: "mailto:storm@kluesports.com" } },
  { id: "6", name: "Ember", role: "Events Coordinator", bio: "Organizing epic gaming events and tournaments worldwide.", avatar_url: null, social_links: { linkedin: "#", instagram: "#", email: "mailto:ember@kluesports.com" } },
];

const Team = () => {
  const titleAnim = useScrollAnimation();
  const gridAnim = useScrollAnimation();

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500));
      return placeholderTeam;
    },
  });

  const displayTeam = teamMembers?.length ? teamMembers : placeholderTeam;

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
                Meet The Legends
              </span>
              <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl mb-3">
                OUR <span className="flame-text">TEAM</span>
              </h1>
              <p className="text-1xl text-muted-foreground font-body max-w-2xl mx-auto">
                The warriors who lead the charge with unique skills and unwavering dedication.
              </p>
            </div>
          </div>
        </section>

        {/* Team Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div
              ref={gridAnim.elementRef}
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-sm sm:max-w-none mx-auto scroll-fade-up ${gridAnim.isVisible ? 'scroll-visible' : ''}`}
            >
              {isLoading
                ? [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="glass-dark rounded-xl aspect-square animate-pulse"
                  />
                ))
                : displayTeam.map((member, index) => (
                  <div
                    key={member.id}
                    className="glass-dark rounded-xl overflow-hidden border border-red-600 hover:border-red-500 transition-all group hover:ember-glow"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Avatar/Image area - Square aspect ratio */}
                    <div className="aspect-[4/3] relative overflow-hidden">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center text-3xl font-display font-bold text-primary">
                            {member.name.charAt(0)}
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-card to-transparent" />
                    </div>

                    {/* Separator line */}
                    <div className="w-full h-[1px] bg-red-600/50"></div>

                    <div className="p-4">
                      <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
                        {member.name}
                      </h3>
                      <p className="text-primary font-display text-xs uppercase tracking-wider mb-2">
                        {member.role}
                      </p>
                      <p className="text-muted-foreground font-body text-sm mb-3 line-clamp-1">
                        {member.bio}
                      </p>

                      {/* Social Links */}
                      {member.social_links && (
                        <div className="flex gap-2">
                          {(member.social_links as any).linkedin && (
                            <a
                              href={(member.social_links as any).linkedin}
                              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {(member.social_links as any).instagram && (
                            <a
                              href={(member.social_links as any).instagram}
                              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                          {(member.social_links as any).email && (
                            <a
                              href={(member.social_links as any).email}
                              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Team;
