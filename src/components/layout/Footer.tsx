import { Link } from "react-router-dom";
import { Instagram, Youtube, MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-primary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src="/KLU-Esports-Circle-Logo.png"
                alt="KLU-Esports"
                className="w-8 h-8 rounded-full border border-primary/50 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]"
              />
              <span className="font-display font-bold text-xl flame-text">
                KLU-Esports
              </span>
            </Link>
            <p className="text-muted-foreground font-body text-lg leading-relaxed max-w-md">
              Where legends are forged in the flames of competition. Join the most elite gaming community and rise to glory.
            </p>
            <div className="flex gap-4 mt-6">

              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-primary uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {["Home", "About", "Team", "Events", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase() === "home" ? "" : link.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary transition-all font-body text-lg inline-block hover:scale-110"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-primary uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-2 text-muted-foreground font-body text-lg">
              <li>contact@klu-esports.gg</li>
              <li>Discord: KLU-Esports#0001</li>
              <li>Streaming 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground font-body text-center md:text-left">
            © {new Date().getFullYear()} KLU-Esports Club. All rights reserved.
          </p>
          <p className="text-muted-foreground font-body text-center md:text-right flex items-center gap-2 justify-center md:justify-end">
            Designed and Developed by
            <a
              href="https://www.linkedin.com/in/veerendra-chowdary-sunkavalli-513b58309/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary transition-colors flex items-center gap-1.5 group"
            >
              <img src="/Linkedin.svg" alt="LinkedIn" className="w-4 h-4" />
              <span className="group-hover:text-red-600 transition-colors">S.Veerendra Chowdary</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
