import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const sponsors = [
  { name: "Dream Aspires", logo: "https://res.cloudinary.com/dus3luhur/image/upload/v1770983444/dream-aspires_vqfiz7.png" },
  { name: "Arena of Mysteries", logo: "https://res.cloudinary.com/dus3luhur/image/upload/v1770980313/Arena-of-Mysteries_gyjuk0.jpg" },
  { name: "PlayX", logo: "https://res.cloudinary.com/dus3luhur/image/upload/v1770980143/playx_wcdcbl.jpg" },
];



export const AboutPreview = () => {
  const navigate = useNavigate();
  const leftContent = useScrollAnimation();

  const sponsorsAnim = useScrollAnimation();

  return (
    <section className="pt-8 pb-14 md:pt-16 md:pb-20 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col gap-8 md:gap-12">
          {/* Top Content */}
          <div
            ref={leftContent.elementRef}
            className="max-w-4xl mx-auto text-center"
          >
            <div className={`scroll-fade-up ${leftContent.isVisible ? 'scroll-visible' : ''} scroll-delay-100`}>
              <h1 className="font-display font-bold text-4xl md:text-7xl mb-12 relative inline-block after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-primary after:to-transparent">
                GEAR <span className="flame-text">UP</span>
              </h1>
            </div>

            <div className={`space-y-6 mb-10 scroll-fade-up ${leftContent.isVisible ? 'scroll-visible' : ''} scroll-delay-200`}>
              <p className="text-muted-foreground font-body text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
                KLU ESPORTS isn't just a gaming club—it's a movement. who believe that gaming is more than entertainment, it's a
                proving ground for the fearless. Here, every match is a battle, every
                victory a legend in the making.
              </p>
            </div>

            <div className={`scroll-fade-up ${leftContent.isVisible ? 'scroll-visible' : ''} scroll-delay-300`}>
              <Button
                variant="flame-outline"
                onClick={() => navigate("/about")}
                className="group text-base px-5 py-2 h-auto mx-auto mb-4"
              >
                More About Us
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Bottom Features - Side by side */}
          {/* Sponsors Section */}
          <div ref={sponsorsAnim.elementRef} className="space-y-8 text-center pt-2">
            <div className={`scroll-fade-up ${sponsorsAnim.isVisible ? 'scroll-visible' : ''} scroll-delay-100`}>
              <h2 className="font-display font-bold text-3xl md:text-6xl mb-8 relative inline-block after:content-[''] after:absolute after:-bottom-4 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-primary after:to-transparent">
                OUR <span className="flame-text">SPONSORS</span>
              </h2>
            </div>
            <div className={`grid grid-cols-2 md:flex md:flex-wrap justify-center items-center gap-6 md:gap-24 max-w-7xl mx-auto px-4 md:px-0`}>
              {sponsors.map((sponsor, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center gap-4 group w-full md:w-auto scroll-fade-up ${sponsorsAnim.isVisible ? 'scroll-visible' : ''
                    } scroll-delay-${(index + 1) * 100}`}
                >
                  <div className="relative w-24 h-24 md:w-36 md:h-36 flex items-center justify-center rounded-full overflow-hidden transition-all duration-500 border-2 border-[#FF0000] group-hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] bg-white">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                  </div>
                  <div className="bg-[#FF0000] px-3 md:px-6 py-2 rounded-lg shadow-lg w-full max-w-[140px] md:max-w-[220px] text-center">
                    <span className="text-white font-display font-bold text-[10px] md:text-sm uppercase tracking-tight md:tracking-wider block">
                      {sponsor.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
