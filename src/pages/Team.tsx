import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { FlameParticles } from "@/components/ui/FlameParticles";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// SVG icons imported via public folder

const placeholderTeam = [
  { id: "2200032351", name: "S. Rohith Kumar", role: "President (2025-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770793344/PHOTO-2026-02-11-12-25-59_tz8rvp.jpg", social_links: { linkedin: "https://www.linkedin.com/in/singaraju-rohith-kumar-847262260?utm_source=share_via&utm_content=profile&utm_medium=member_android", instagram: "https://www.instagram.com/rohith_kumar_1?igsh=MWJhM255Nm8yNWhqMg==", email: "mailto:singarju.rohith@gmail.com" } },
  { id: "2100049002", name: "Jammi Neeraj", role: "Ex President (2022-2025)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770808915/1678283966113_cnyw2a.jpg", social_links: { linkedin: "https://www.linkedin.com/in/neeraj-jammi-028039213?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", instagram: "https://www.instagram.com/urstruly__neeraj?igsh=MTc2ZHp2amJmcm9uag==", email: "mailto:jammineeraj@gmail.com" } },
  { id: "2200080018", name: "N. Arya Satya Ananth", role: "Vice President (2022-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770808915/PHOTO-2026-02-11-16-48-56_moz7z6.jpg", social_links: { linkedin: "https://www.linkedin.com/in/arya-satya-ananth-8b6247255?utm_source=share_via&utm_content=profile&utm_medium=member_android", instagram: "https://www.instagram.com/arya_satya_ananth_?igsh=bGU2OTRzams4Mm8=32", email: "mailto:aaryasatya4@gmail.com" } },
  { id: "2200032965", name: "Yarlagadda Sri", role: "Mobile Lead (2025-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770793344/PHOTO-2026-02-10-18-04-19_on6pmk.jpg", social_links: { linkedin: "https://www.linkedin.com/in/yarlagadda-sri?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", instagram: "https://www.instagram.com/sri_yar_224?utm_source=qr&igsh=dGt1cWx4dmR2dWxr", email: "mailto:srichowdary224@gmail.com" } },
  { id: "2200070011", name: "K. Pramod Kumar", role: "Mobile Vice Lead (2024-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770810039/Screenshot_2025-06-17_112132_jjuzvw.png", social_links: { linkedin: "https://www.linkedin.com/in/k-pramod-kumar-556517285/", instagram: "https://www.instagram.com/pramod_p_s_p_k/", email: "mailto:2200070011me@gmail.com" } },
  { id: "2300030282", name: "K. Ram Dattu", role: "PC Lead (2025-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770809431/IMG_20260211_165435_e3ss9i.jpg", social_links: { linkedin: "https://www.linkedin.com/in/ram-dattu-kadiyala-807039301?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", instagram: "https://www.instagram.com/ram_dattu_29?igsh=ZnE4emVmNGNmM2J6", email: "mailto:ramdattu54@gmail.com" } },
  { id: "2300033292", name: "P. Santosh Reddy", role: "BGMI Lead (2025-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770809392/IMG_6344_omlmyx.jpg", social_links: { linkedin: "https://www.linkedin.com/in/p-sri-santosh-reddy-0023741b1/", instagram: "https://www.instagram.com/_santu.exe/?utm_source=ig_web_button_share_sheet", email: "mailto:santoshreed@gmail.com" } },
  { id: "2300031334", name: "M. Anji Reddy", role: "Free Fire Lead (2025-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770821751/IMG_20260211_202427_ujj0rw.jpg", social_links: { linkedin: "https://www.linkedin.com/in/anji-reddy-modugula-6689953ab?utm_source=share_via&utm_content=profile&utm_medium=member_ios", instagram: "https://www.instagram.com/_.bannu._10?igsh=NWJuMjhkd2txMjc5", email: "mailto:modugulaanjireddy000@gmail.com" } },
  { id: "2400031211", name: "B. Nayan", role: "Valorant Lead (2025-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770824448/1768636090408_iikhxw.jpg", social_links: { linkedin: "https://www.linkedin.com/in/nayan-balla-0b339534a/", instagram: "https://www.instagram.com/arya_satya_ananth_?igsh=bGU2OTRzams4Mm8=32", email: "mailto:ballasandhya1902@gmail.com" } },
  { id: "2400031114", name: "Deepak Kumar", role: "COD Lead (2025-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770823024/IMG_20260211_204600_az4gxp.jpg", social_links: { linkedin: "https://www.linkedin.com/in/deepak-kumar-707a07339?utm_source=share_via&utm_content=profile&utm_medium=member_android", instagram: "https://www.instagram.com/_deepakz.x?igsh=eTg2NWI3dTg2OHl1", email: "mailto:dky.deepak7361@gmail.com" } },
  { id: "2300033269", name: "E. Praveen Kumar", role: "Designing Lead (2025-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770823853/IMG_20260211_205944_fr1hzm.jpg", social_links: { linkedin: "https://in.linkedin.com/in/epuri-praveen-kumar-6a8655319", instagram: "https://www.instagram.com/mrperfect._irfan?igsh=MXZnNnYxZDFvajkwYQ==", email: "mailto:epuripraveenkumar2006@gmail.com" } },
  { id: "2400031095", name: "V. Pujitha", role: "PR Lead (2025-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770824449/IMG_20260211_210847_cuzd5y.jpg", social_links: { linkedin: "www.linkedin.com/in/pujitha-vempala-991202365", instagram: "https://www.instagram.com/puji_vempala/", email: "mailto:pujithavempala2007@gmail.com" } },
  { id: "2400040139", name: "P. Mounusha", role: "Social Media Lead (2025-Present)", avatar_url: "https://res.cloudinary.com/dus3luhur/image/upload/v1770824449/IMG_20260211_210808_eziz1n.jpg", social_links: { linkedin: "https://www.linkedin.com/in/mounusha-pasam-0b368636a?utm_source=share_via&utm_content=profile&utm_medium=member_android", instagram: "https://www.instagram.com/mouni_3207?igsh=YzQwdjB6MzI5YnVv", email: "mailto:pasammounusha@gmail.com" } },
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
              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 whitespace-nowrap">
                OUR <span className="flame-text">TEAM</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
                The warriors who lead the charge with unwavering dedication.
              </p>
            </div>
          </div>
        </section>

        {/* Team Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div
              ref={gridAnim.elementRef}
              className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mx-auto scroll-fade-up ${gridAnim.isVisible ? 'scroll-visible' : ''}`}
            >
              {isLoading
                ? [...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="glass-dark rounded-xl aspect-square animate-pulse"
                  />
                ))
                : displayTeam.map((member, index) => (
                  <div
                    key={member.id}
                    className="glass-dark rounded-xl overflow-hidden border border-red-600 hover:border-red-500 transition-all group hover:ember-glow flex flex-col h-full"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Avatar/Image area - Square aspect ratio */}
                    <div className="aspect-square relative overflow-hidden">
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

                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors mb-1">
                          {member.name}
                        </h3>
                        <p className="text-primary font-display text-[10px] sm:text-xs uppercase tracking-wider mb-2">
                          {member.role}
                        </p>
                        <p className="text-muted-foreground font-body text-sm mb-1 line-clamp-1">
                          ID: {member.id}
                        </p>
                      </div>

                      {/* Social Links */}
                      {member.social_links && (
                        <div className="flex gap-2 pt-2">
                          {(member.social_links as any).linkedin && (
                            <a
                              href={(member.social_links as any).linkedin}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-red-600/50 hover:border-red-500 group/link"
                            >
                              <img src="/Linkedin.svg" alt="LinkedIn" className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/link:scale-110" />
                            </a>
                          )}
                          {(member.social_links as any).instagram && (
                            <a
                              href={(member.social_links as any).instagram}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-red-600/50 hover:border-red-500 group/link"
                            >
                              <img src="/instagram.svg" alt="Instagram" className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/link:scale-110" />
                            </a>
                          )}
                          {(member.social_links as any).email && (
                            <a
                              href={(member.social_links as any).email}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-red-600/50 hover:border-red-500 group/link"
                            >
                              <img src="/gmail.svg" alt="Email" className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/link:scale-110" />
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
    </div >
  );
};

export default Team;
