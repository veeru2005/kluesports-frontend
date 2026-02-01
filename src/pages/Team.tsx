import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { FlameParticles } from "@/components/ui/FlameParticles";

import { Twitter, Instagram, Youtube } from "lucide-react";

const placeholderTeam = [
  {
    id: "1",
    name: "Phoenix",
    role: "Team Captain",
    bio: "Professional FPS player with 10+ years of competitive experience.",
    avatar_url: null,
    social_links: { twitter: "#", instagram: "#" },
  },
  {
    id: "2",
    name: "Shadow",
    role: "Strategist",
    bio: "Master tactician and former esports coach for top-tier teams.",
    avatar_url: null,
    social_links: { twitter: "#", youtube: "#" },
  },
  {
    id: "3",
    name: "Blaze",
    role: "Content Lead",
    bio: "Streaming sensation with 1M+ followers across platforms.",
    avatar_url: null,
    social_links: { instagram: "#", youtube: "#" },
  },
  {
    id: "4",
    name: "Viper",
    role: "Community Manager",
    bio: "Building communities and fostering competitive spirit since 2015.",
    avatar_url: null,
    social_links: { twitter: "#" },
  },
  {
    id: "5",
    name: "Storm",
    role: "Pro Player",
    bio: "Multiple championship winner in FPS and Battle Royale games.",
    avatar_url: null,
    social_links: { twitter: "#", instagram: "#", youtube: "#" },
  },
  {
    id: "6",
    name: "Ember",
    role: "Events Coordinator",
    bio: "Organizing epic gaming events and tournaments worldwide.",
    avatar_url: null,
    social_links: { twitter: "#" },
  },
];

const Team = () => {
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
            <div className="max-w-4xl mx-auto text-center">
              <span className="font-display text-primary uppercase tracking-widest text-sm mb-4 block">
                Meet The Legends
              </span>
              <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl mb-6">
                OUR <span className="flame-text">TEAM</span>
              </h1>
              <p className="text-xl text-muted-foreground font-body max-w-2xl mx-auto">
                The warriors who lead the charge. Each member brings unique skills and
                unwavering dedication to the KLU-Esports legacy.
              </p>
            </div>
          </div>
        </section>

        {/* Team Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading
                ? [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="glass-dark rounded-xl h-80 animate-pulse"
                  />
                ))
                : displayTeam.map((member, index) => (
                  <div
                    key={member.id}
                    className="glass-dark rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all group hover:ember-glow"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Avatar/Image area */}
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/30 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center text-4xl font-display font-bold text-primary">
                          {member.name.charAt(0)}
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
                    </div>

                    <div className="p-6">
                      <h3 className="font-display font-bold text-2xl text-foreground group-hover:text-primary transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-primary font-display text-sm uppercase tracking-wider mb-3">
                        {member.role}
                      </p>
                      <p className="text-muted-foreground font-body mb-4">
                        {member.bio}
                      </p>

                      {/* Social Links */}
                      {member.social_links && (
                        <div className="flex gap-3">
                          {(member.social_links as any).twitter && (
                            <a
                              href={(member.social_links as any).twitter}
                              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                              <Twitter className="w-4 h-4" />
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
                          {(member.social_links as any).youtube && (
                            <a
                              href={(member.social_links as any).youtube}
                              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                              <Youtube className="w-4 h-4" />
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
