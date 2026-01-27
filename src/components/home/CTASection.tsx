import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const CTASection = () => {
  const navigate = useNavigate();
  const [isHoveringIgnite, setIsHoveringIgnite] = useState(false);
  const [isHoveringContact, setIsHoveringContact] = useState(false);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <img
              src="/KLU-Esports-Circle-Logo.png"
              alt="KLU-Esports"
              className="w-20 h-20 rounded-full border border-primary/50 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]"
            />
          </div>

          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
            READY TO JOIN THE <br /> <span className="flame-text">KLU-Esports</span>?
          </h2>

          <p className="text-xl text-muted-foreground font-body mb-10 max-w-xl mx-auto">
            Step into the arena. Prove your worth. Become a legend among legends.
            The flames are waiting.
          </p>

          <div className="flex flex-col gap-6 items-center justify-center max-w-lg mx-auto w-[90%] md:w-full">
            <a
              href="https://www.instagram.com/klu__esports/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-4 px-6 py-4 md:px-8 md:py-6 bg-black/60 border border-red-900/50 rounded-2xl hover:bg-black/80 hover:border-red-600 transition-all group backdrop-blur-sm shadow-lg hover:shadow-red-900/20"
            >
              <img src="/instagram.svg" alt="Instagram" className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
              <span className="text-lg md:text-xl font-display text-white group-hover:text-red-500 transition-colors tracking-widest uppercase">Instagram</span>
            </a>

            <a
              href="https://discord.com/invite/pp9wnEjbt"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-4 px-6 py-4 md:px-8 md:py-6 bg-black/60 border border-red-900/50 rounded-2xl hover:bg-black/80 hover:border-red-600 transition-all group backdrop-blur-sm shadow-lg hover:shadow-red-900/20"
            >
              <img src="/discord.svg" alt="Discord" className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
              <span className="text-lg md:text-xl font-display text-white group-hover:text-red-500 transition-colors tracking-widest uppercase">Discord</span>
            </a>

            <a
              href="https://www.youtube.com/@esports.kluniversity"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-4 px-6 py-4 md:px-8 md:py-6 bg-black/60 border border-red-900/50 rounded-2xl hover:bg-black/80 hover:border-red-600 transition-all group backdrop-blur-sm shadow-lg hover:shadow-red-900/20"
            >
              <img src="/youtube.svg" alt="YouTube" className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
              <span className="text-lg md:text-xl font-display text-white group-hover:text-red-500 transition-colors tracking-widest uppercase">YouTube</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
