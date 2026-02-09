import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const CTASection = () => {
  const navigate = useNavigate();
  const [isHoveringIgnite, setIsHoveringIgnite] = useState(false);
  const [isHoveringContact, setIsHoveringContact] = useState(false);
  const logoAnim = useScrollAnimation();
  const titleAnim = useScrollAnimation();
  const linksAnim = useScrollAnimation();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div
            ref={logoAnim.elementRef}
            className={`mb-8 flex justify-center scroll-scale ${logoAnim.isVisible ? 'scroll-visible' : ''}`}
          >
            <img
              src="/KLU-Esports-Circle-Logo.png"
              alt="KLU-Esports"
              className="w-20 h-20 rounded-full border border-primary/50 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]"
            />
          </div>

          <div
            ref={titleAnim.elementRef}
            className={`scroll-fade-up ${titleAnim.isVisible ? 'scroll-visible' : ''}`}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl mb-6">
              READY TO JOIN THE <br /> <span className="flame-text">KLU ESPORTS</span>?
            </h2>

            <p className="text-lg text-muted-foreground font-body mb-10 max-w-xl mx-auto">
              Step into the arena. Prove your worth. Become a legend among legends.
              The flames are waiting.
            </p>
          </div>

          <div
            ref={linksAnim.elementRef}
            className={`flex flex-col gap-6 items-center justify-center max-w-lg mx-auto w-[90%] md:w-full scroll-fade-up scroll-delay-200 ${linksAnim.isVisible ? 'scroll-visible' : ''}`}
          >
            <a
              href="https://www.instagram.com/klu__esports?igsh=MXF6OW0waXl6NnQ3Ng=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-4 px-6 py-4 md:px-8 md:py-6 bg-black/90 border-2 border-red-600 rounded-2xl hover:bg-black hover:border-red-500 transition-all group backdrop-blur-sm shadow-lg shadow-red-900/30 hover:shadow-red-600/40"
            >
              <img src="/instagram.svg" alt="Instagram" className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
              <span className="text-base md:text-lg font-display text-white tracking-widest uppercase group-hover:scale-110 transition-transform">Instagram</span>
            </a>

            <a
              href="https://discord.com/invite/pp9wnEjbt"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-4 px-6 py-4 md:px-8 md:py-6 bg-black/90 border-2 border-red-600 rounded-2xl hover:bg-black hover:border-red-500 transition-all group backdrop-blur-sm shadow-lg shadow-red-900/30 hover:shadow-red-600/40"
            >
              <img src="/discord.svg" alt="Discord" className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
              <span className="text-base md:text-lg font-display text-white tracking-widest uppercase group-hover:scale-110 transition-transform">Discord</span>
            </a>

            <a
              href="https://www.youtube.com/@esports.kluniversity"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-4 px-6 py-4 md:px-8 md:py-6 bg-black/90 border-2 border-red-600 rounded-2xl hover:bg-black hover:border-red-500 transition-all group backdrop-blur-sm shadow-lg shadow-red-900/30 hover:shadow-red-600/40"
            >
              <img src="/youtube.svg" alt="YouTube" className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
              <span className="text-base md:text-lg font-display text-white tracking-widest uppercase group-hover:scale-110 transition-transform">YouTube</span>
            </a>

            <a
              href="https://www.linkedin.com/company/kl-esports-club"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-4 px-6 py-4 md:px-8 md:py-6 bg-black/90 border-2 border-red-600 rounded-2xl hover:bg-black hover:border-red-500 transition-all group backdrop-blur-sm shadow-lg shadow-red-900/30 hover:shadow-red-600/40"
            >
              <img src="/Linkedin.svg" alt="LinkedIn" className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
              <span className="text-base md:text-lg font-display text-white tracking-widest uppercase group-hover:scale-110 transition-transform">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
