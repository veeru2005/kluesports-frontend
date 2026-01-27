import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Target, Users, Trophy, Flame, Swords, Crown } from "lucide-react";
import { FlameParticles } from "@/components/ui/FlameParticles";

const values = [
  {
    icon: Flame,
    title: "Passion",
    description: "Gaming isn't just a hobby—it's our calling. We burn bright with dedication.",
  },
  {
    icon: Swords,
    title: "Competition",
    description: "We thrive in the heat of battle. Every match is an opportunity to prove ourselves.",
  },
  {
    icon: Crown,
    title: "Excellence",
    description: "Mediocrity is not in our vocabulary. We strive for greatness in everything.",
  },
  {
    icon: Users,
    title: "Brotherhood",
    description: "We fight together, win together, and grow together as one unstoppable force.",
  },
];

const stats = [
  { value: "2019", label: "Founded" },
  { value: "10K+", label: "Members" },
  { value: "500+", label: "Events Hosted" },
  { value: "50+", label: "Championships Won" },
];

const About = () => {
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
                Our Story
              </span>
              <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl mb-6">
                ABOUT <span className="flame-text">KLU-Esports</span>
              </h1>
              <p className="text-xl text-muted-foreground font-body max-w-2xl mx-auto">
                From a small group of passionate gamers to one of the most recognized
                gaming communities in the world. This is our journey.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display font-bold text-4xl mb-6 section-title">
                  THE <span className="flame-text">ORIGIN</span>
                </h2>
                <div className="space-y-4 text-muted-foreground font-body text-lg leading-relaxed">
                  <p>
                    KLU-Esports was born in 2019 from a simple belief: gaming communities
                    should be more than just casual gatherings. They should be forges
                    where champions are made.
                  </p>
                  <p>
                    What started as five friends competing in local tournaments has
                    grown into a global movement of over 10,000 dedicated players,
                    content creators, and esports professionals.
                  </p>
                  <p>
                    Today, we host weekly tournaments, live streaming events, and
                    championship series that attract competitors from around the world.
                    Our members have gone on to compete professionally and represent
                    some of the biggest names in esports.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="glass-dark rounded-xl p-8 text-center border border-border hover:border-primary/40 transition-all hover:ember-glow"
                  >
                    <div className="font-display font-bold text-4xl text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground font-body text-lg">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="font-display text-primary uppercase tracking-widest text-sm mb-4 block">
                What We Stand For
              </span>
              <h2 className="font-display font-bold text-4xl md:text-5xl section-title mx-auto">
                OUR <span className="flame-text">VALUES</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="glass-dark rounded-xl p-8 text-center border border-border hover:border-primary/40 transition-all group hover:ember-glow"
                >
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground font-body">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 ember-pulse">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
                OUR <span className="flame-text">MISSION</span>
              </h2>
              <p className="text-xl text-muted-foreground font-body leading-relaxed">
                To create the ultimate proving ground for gamers. A place where skill
                is tested, legends are born, and the flames of competition burn
                eternal. We exist to elevate gaming from a pastime to a passion, and
                to forge the champions of tomorrow.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
