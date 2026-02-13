import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Target, Users, Flame, Swords, Crown, Briefcase, Award, Building2 } from "lucide-react";
import { FlameParticles } from "@/components/ui/FlameParticles";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

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
  { value: "2020", label: "Founded" },
  { value: "300+", label: "Members" },
  { value: "40+", label: "Events Hosted" },
  { value: "10+", label: "Championships Won" },
];

const About = () => {
  const titleAnim = useScrollAnimation();
  const originAnim = useScrollAnimation();
  const directorAnim = useScrollAnimation();
  const valuesAnim = useScrollAnimation();
  const missionAnim = useScrollAnimation();
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
                Our Story
              </span>
              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 whitespace-nowrap">
                ABOUT <span className="flame-text">KLU ESPORTS</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
                The premier gaming wing of KL University Student Activity Center.
              </p>
            </div>
          </div>
        </section>

        {/* Origin Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="container mx-auto px-4 z-10 relative">
            <div
              ref={originAnim.elementRef}
              className={`grid lg:grid-cols-2 gap-16 items-center mb-8 scroll-fade-up ${originAnim.isVisible ? 'scroll-visible' : ''}`}
            >

              {/* Left Side: Text Content */}
              <div>
                <div className="mb-8">
                  <span className="font-display text-primary uppercase tracking-widest text-sm mb-4 block">
                    Our Beginning
                  </span>
                  <h2 className="font-display font-bold text-3xl md:text-4xl mb-8 leading-tight relative inline-block after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-16 after:h-1.5 after:bg-gradient-to-r after:from-[#FF0000] after:to-transparent">
                    THE <span className="flame-text">ORIGIN</span>
                  </h2>
                </div>

                {/* Updated: Border wraps all paragraphs now */}
                <div className="space-y-6 font-body text-lg leading-relaxed border-l-4 border-[#FF0000] pl-6 py-4 bg-gradient-to-r from-red-600/10 to-transparent rounded-r-lg">
                  <p className="text-xl text-white font-medium">
                    The <span className="text-primary font-bold">KLU ESPORTS CLUB</span> operates proudly under the dynamic banner of the <span className="text-white">KL University Student Activity Center (KL SAC), at KL University</span>.
                  </p>
                  <p className="text-muted-foreground/90">
                    Under the visionary guidance of our Director of SAC, <a href="https://www.linkedin.com/in/psaivijay/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">Pisini Sai Vijay Sir</a>, the club has evolved from a small gathering into a powerhouse. He staunchly encourages all forms of competitive gaming, bridging the gap between <span className="text-white">Mobile Esports</span> and <span className="text-white">PC Gaming</span> to ensure every gamer finds their stage.
                  </p>
                  <p className="text-muted-foreground/90">
                    What started in 2020 has grown into a movement where champions are forged. With the support of KL SAC, we host major tournaments, live streams, and championship series that attract competitors from across the nation.
                  </p>
                </div>
              </div>

              {/* Right Side: Logo & Stats */}
              <div className="flex flex-col gap-8">
                <div className="relative flex justify-center items-center">
                  <div className="relative group w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-600/20 rounded-full blur-[40px] opacity-60 transition-opacity duration-700" />
                    <div className="absolute inset-0 scale-[1.08]">
                      <div className="w-full h-full border-2 border-dashed border-[#FF0000] rounded-full animate-[spin_15s_linear_infinite]" />
                    </div>

                    <div className="relative z-10 p-0 bg-black/40 backdrop-blur-xl rounded-full border-2 border-[#FF0000] shadow-2xl transition-colors duration-500 w-full h-full flex items-center justify-center overflow-hidden">
                      <img
                        src="https://res.cloudinary.com/dus3luhur/image/upload/v1770969671/486415839_1833976170708272_11642_v8y9cr.jpg"
                        alt="KLU Esports Origin Logo"
                        className="w-full h-full object-cover rounded-full drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="glass-dark rounded-xl p-4 text-center border-2 border-[#FF0000] hover:border-[#FF0000] transition-all duration-300 hover:ember-glow group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="font-display font-bold text-2xl md:text-3xl text-white mb-1 relative z-10 group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                      <div className="text-muted-foreground font-body text-xs md:text-sm font-medium uppercase tracking-wider relative z-10">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Director Section */}
        <section className="py-16 bg-black/40 border-y border-white/5 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div
              ref={directorAnim.elementRef}
              className={`scroll-fade-up ${directorAnim.isVisible ? 'scroll-visible' : ''}`}
            >
              {/* Centered Header */}
              <div className="text-center mb-16">
                <span className="font-display text-primary uppercase tracking-widest text-sm mb-4 block">
                  Visionary Leader
                </span>
                <h2 className="font-display font-bold text-3xl md:text-4xl relative inline-block after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-16 after:h-1.5 after:bg-gradient-to-r after:from-primary after:to-transparent">
                  KL SAC <span className="flame-text">DIRECTOR</span>
                </h2>
              </div>

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-12 items-start">

                {/* Left Side: Director Image */}
                <div className="relative">
                  <div className="max-h-[522px] rounded-2xl overflow-hidden border-2 border-[#FF0000] relative group shadow-2xl shadow-primary/10 max-w-sm mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60" />
                    <img
                      src="https://res.cloudinary.com/dus3luhur/image/upload/v1770965211/Sai-Vijay-Sir_jqhnxu.jpg"
                      alt="Sai Vijay Pisini - Director SAC"
                      className="w-full h-full object-cover object-center"
                    />

                    {/* Updated: Badge Text */}
                    <div className="absolute bottom-4 left-4 z-20">
                      <div className="bg-primary px-4 py-1 rounded text-white font-bold font-display text-sm inline-block mb-2 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        DIRECTOR OF KL SAC
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                </div>

                {/* Right Side: Director Info */}
                <div className="flex flex-col gap-4 h-full">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl text-white font-semibold">SAI VIJAY PISINI</h3>
                      <a
                        href="https://www.linkedin.com/in/psaivijay/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] group/link"
                        title="Connect on LinkedIn"
                      >
                        <img src="/Linkedin.svg" alt="LinkedIn" className="w-5 h-5 transition-transform group-hover/link:scale-110" />
                      </a>
                    </div>
                    <p className="text-primary/90 font-medium text-sm leading-tight">
                      Director-SAC @ KL University | CEO - Smart Village Revolution | Founder Leadership Foundation
                    </p>
                  </div>

                  <div className="space-y-3 font-body text-muted-foreground">
                    <p className="leading-relaxed text-sm">
                      With a passion for student development and a vision for innovation, Sai Vijay Pisini Sir has been the driving force behind the Student Activity Center. Since taking charge in 2018, he has transformed SAC into a vibrant hub for talent, including the rapid expansion of KLU Esports.
                    </p>

                    <div className="grid gap-3 mt-4">
                      {/* KL University */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border-2 border-[#FF0000] hover:border-[#FF0000] hover:ember-glow transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                          <img
                            src="/PSVS/kluniversity_logo.jpeg"
                            alt="KL University"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm">Director-SAC, CEO-Smart Village Revolution</h4>
                          <p className="text-xs text-primary font-medium">KL University</p>
                          <p className="text-xs text-muted-foreground">Feb 2018 - Present • Guntur, Andhra Pradesh</p>
                        </div>
                      </div>

                      {/* Leadership Foundation */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border-2 border-[#FF0000] hover:border-[#FF0000] hover:ember-glow transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                          <img
                            src="/PSVS/leadershipfoundation_logo.jpeg"
                            alt="Leadership Foundation"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm">Founder & CEO</h4>
                          <p className="text-xs text-primary font-medium">Leadership Foundation</p>
                          <p className="text-xs text-muted-foreground">Jun 2013 - Jun 2022 • Andhra Pradesh</p>
                        </div>
                      </div>

                      {/* Aditya Institute */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border-2 border-[#FF0000] hover:border-[#FF0000] hover:ember-glow transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                          <img
                            src="/PSVS/aitamofficial_logo.jpeg"
                            alt="Aditya Institute of Technology and Management"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm">Head - Student Activity Center</h4>
                          <p className="text-xs text-primary font-medium">Aditya Institute of Technology and Management</p>
                          <p className="text-xs text-muted-foreground">Feb 2011 - Feb 2018 • Tekkali, Andhra Pradesh</p>
                        </div>
                      </div>

                      {/* KIET */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border-2 border-[#FF0000] hover:border-[#FF0000] hover:ember-glow transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                          <img
                            src="/PSVS/KIET.jpeg"
                            alt="KIET"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm">Incharge - Student Activities</h4>
                          <p className="text-xs text-primary font-medium">Kakinada Institute of Engineering and Technology</p>
                          <p className="text-xs text-muted-foreground">Aug 2008 - Jan 2011 • Kakinada, Andhra Pradesh</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div
              ref={valuesAnim.elementRef}
              className={`scroll-fade-up ${valuesAnim.isVisible ? 'scroll-visible' : ''}`}
            >
              <div className="text-center mb-12">
                <span className="font-display text-primary uppercase tracking-widest text-sm mb-4 block">
                  What We Stand For
                </span>
                <h2 className="font-display font-bold text-3xl md:text-4xl relative inline-block after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-16 after:h-1.5 after:bg-gradient-to-r after:from-primary after:to-transparent">
                  OUR <span className="flame-text">VALUES</span>
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="glass-dark rounded-xl p-8 text-center border-2 border-[#FF0000] hover:border-[#FF0000] transition-all group hover:ember-glow"
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
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div
              ref={missionAnim.elementRef}
              className={`max-w-3xl mx-auto text-center scroll-fade-up ${missionAnim.isVisible ? 'scroll-visible' : ''}`}
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 ember-pulse">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-16 after:h-1.5 after:bg-gradient-to-r after:from-[#FF0000] after:to-transparent">
                OUR <span className="flame-text">MISSION</span>
              </h2>
              <p className="text-lg text-muted-foreground font-body leading-relaxed">
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