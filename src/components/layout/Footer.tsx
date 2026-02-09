import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Mail, Phone, ChevronRight } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-black/95 border-t-2 border-red-600 pt-16 pb-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-1/2 h-full bg-red-900/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between gap-8 mb-8">

          {/* Column 1: Brand & About */}
          <div className="space-y-6 lg:w-[26%]">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/KLU-Esports-Circle-Logo.png"
                alt="KLU-Esports"
                className="w-12 h-12 rounded-full border border-red-600/50 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              />
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl flame-text leading-none">
                  KLU ESPORTS
                </span>
                <span className="text-xs text-white font-medium uppercase leading-tight tracking-[0.04em]">
                  Gaming Community
                </span>
              </div>
            </Link>
            <p className="text-gray-400 font-body text-lg leading-relaxed pr-4 font-normal transition-colors duration-300 hover:text-white">
              Inspiring players to push their limits. We are the forge where casual gamers become legends of the arena. Join a thriving community dedicated to excellence, teamwork, and the passion for esports.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 group mt-2 transition-transform duration-300 hover:translate-x-2"
            >
              <span className="flame-text font-display font-bold text-lg tracking-wide">Learn more about us</span>
              <ArrowRight className="w-5 h-5 text-red-500 group-hover:translate-x-2 transition-transform duration-300 ease-out" />
            </Link>
          </div>

          {/* Column 2: Navigation */}
          <div className="lg:w-fit">
            <h4 className="font-display font-bold flame-text uppercase tracking-wider text-lg mb-6">
              Navigation
            </h4>
            <ul className="space-y-3">
              {["Home", "About", "Team", "Events", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase() === "home" ? "" : link.toLowerCase()}`}
                    className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-[linear-gradient(180deg,hsl(0,100%,70%)_0%,hsl(0,85%,50%)_50%,hsl(20,100%,50%)_100%)] hover:drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] transition-all duration-300 font-body text-base font-semibold flex items-center gap-1 group w-fit hover:translate-x-2"
                  >
                    {link}
                    <ArrowRight className="w-0 group-hover:w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Get in Touch */}
          <div className="lg:w-fit lg:pl-4">
            <h4 className="font-display font-bold flame-text uppercase tracking-wider text-lg mb-6">
              Get in Touch
            </h4>
            <ul className="space-y-5">
              <li className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-gray-400 text-base leading-relaxed font-semibold transition-colors duration-300 hover:text-white">
                  KL University,<br />
                  Green Fields, Vaddeswaram,<br />
                  Guntur, AP - 522502
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="w-5 h-5 text-red-600 shrink-0" />
                <span className="text-gray-400 text-base hover:text-white transition-colors font-semibold">
                  esports.kluniversity@gmail.com
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="w-5 h-5 text-red-600 shrink-0" />
                <span className="text-gray-400 text-base font-semibold transition-colors duration-300 hover:text-white">
                  +91 8317677542
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect With Us */}
          <div className="lg:w-[25%]">
            <h4 className="font-display font-bold flame-text uppercase tracking-wider text-lg mb-6">
              Connect With Us
            </h4>

            <p className="text-gray-400 text-base mb-6 font-semibold transition-colors duration-300 hover:text-white">
              Follow us on our social media platforms to stay updated on the latest tournaments, upcoming events, and exclusive community highlights. Don't miss out on the action!
            </p>

            {/* Social Icons Row */}
            <div className="flex gap-4">
              <a href="https://www.instagram.com/klu__esports/" target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-black border border-red-600 flex items-center justify-center hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] hover:border-red-500 hover:-translate-y-1 transition-all group">
                <img src="/instagram.svg" alt="IG" className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://discord.com/invite/pp9wnEjbt" target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-black border border-red-600 flex items-center justify-center hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] hover:border-red-500 hover:-translate-y-1 transition-all group">
                <img src="/discord.svg" alt="DC" className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://www.youtube.com/@esports.kluniversity" target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-black border border-red-600 flex items-center justify-center hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] hover:border-red-500 hover:-translate-y-1 transition-all group">
                <img src="/youtube.svg" alt="YT" className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://www.linkedin.com/company/klu-esports/" target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-black border border-red-600 flex items-center justify-center hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] hover:border-red-500 hover:-translate-y-1 transition-all group">
                <img src="/Linkedin.svg" alt="LI" className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
          <p className="text-gray-300 text-base text-center md:text-left font-medium">
            © {new Date().getFullYear()} KLU Esports Club. All rights reserved.
          </p>
          <p className="text-gray-300 text-base text-center md:text-right flex items-center gap-2 font-medium">
            Designed and Developed by
            <a
              href="https://www.linkedin.com/in/veerendra-chowdary-sunkavalli-513b58309/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors flex items-center gap-1.5 group"
            >
              <img src="/Linkedin.svg" alt="In" className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="flame-text font-medium">S. Veerendra Chowdary</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
