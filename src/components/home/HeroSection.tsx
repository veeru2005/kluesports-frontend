import { ChevronDown } from "lucide-react";

export const HeroSection = () => {

  return (
    <section className="relative w-full mt-20 md:mt-0 md:min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Video Background */}
      <div className="relative w-full aspect-video md:absolute md:inset-0 md:aspect-auto z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/placeholder.svg"
        >
          <source src="https://res.cloudinary.com/dus3luhur/video/upload/v1769537336/intro-final-3_hjq6mc.mov" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Content Container (Empty/Hidden on mobile if needed, or overlay) */}
      <div className="absolute inset-0 container mx-auto px-4 z-20 flex flex-col items-center justify-center pointer-events-none">
        {/* All text removed */}
      </div>

      {/* Scroll indicator - Only show on desktop or if it makes sense. 
          If mobile is short, maybe hide it or keep it? 
          User didn't ask to remove, but 'black spaces top and bottom' implies tight fit.
      */}
      <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/60" />
      </div>
    </section>
  );
};
