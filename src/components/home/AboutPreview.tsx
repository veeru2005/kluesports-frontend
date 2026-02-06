import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: Target,
    title: "Competitive Excellence",
    description: "Push your limits in high-stakes tournaments with the best players worldwide.",
  },
  {
    icon: Zap,
    title: "Live Events",
    description: "Experience the thrill of real-time gaming events, streams, and epic showdowns.",
  },
  {
    icon: Shield,
    title: "Elite Community",
    description: "Join a brotherhood of dedicated gamers who share your passion for victory.",
  },
];

export const AboutPreview = () => {
  const navigate = useNavigate();
  const leftContent = useScrollAnimation();
  const feature1 = useScrollAnimation();
  const feature2 = useScrollAnimation();
  const feature3 = useScrollAnimation();

  return (
    <section className="py-8 md:py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div
            ref={leftContent.elementRef}
            className={`text-center md:text-left scroll-fade-left ${leftContent.isVisible ? 'scroll-visible' : ''}`}
          >
            <span className="font-display text-red-500 uppercase tracking-widest text-lg mb-0 block">
              Who We Are
            </span>
            <h1 className="font-display font-bold text-5xl md:text-7xl mb-8 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:w-[60px] after:h-[3px] after:bg-gradient-to-r after:from-[hsl(0,85%,50%)] after:to-transparent after:left-1/2 after:-translate-x-1/2 md:after:left-0 md:after:translate-x-0">
              BORN TO <span className="flame-text">DOMINATE</span>
            </h1>
            <p className="text-muted-foreground font-body text-xl md:text-2xl leading-relaxed mb-6 md:mb-10">
              KLU-Esports isn't just a gaming club—it's a movement. Founded by elite
              players who believe that gaming is more than entertainment, it's a
              proving ground for the fearless. Here, every match is a battle, every
              victory a legend in the making.
            </p>
            <Button
              variant="flame-outline"
              size="default"
              onClick={() => navigate("/about")}
              className="group text-lg px-6 py-3 h-auto mx-auto md:mx-0"
            >
              Learn More About Us
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Features */}
          <div className="space-y-6">
            {[feature1, feature2, feature3].map((featureAnim, index) => {
              const feature = features[index];
              return (
                <div
                  key={index}
                  ref={featureAnim.elementRef}
                  className={`glass-dark rounded-xl p-6 border border-red-600 hover:border-red-500 transition-all group hover:ember-glow mx-2 md:mx-0 scroll-fade-right scroll-delay-${(index + 1) * 100} ${featureAnim.isVisible ? 'scroll-visible' : ''}`}
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-2xl text-foreground mb-3">
                        {feature.title}
                      </h2>
                      <p className="text-muted-foreground font-body text-xl">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
