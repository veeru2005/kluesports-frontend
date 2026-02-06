import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { useAuth } from "@/contexts/AuthContext";

// Lazy load below-the-fold components for better performance
const AboutPreview = lazy(() => import("@/components/home/AboutPreview").then(m => ({ default: m.AboutPreview })));
const EventsPreview = lazy(() => import("@/components/home/EventsPreview").then(m => ({ default: m.EventsPreview })));
const CTASection = lazy(() => import("@/components/home/CTASection").then(m => ({ default: m.CTASection })));
const Footer = lazy(() => import("@/components/layout/Footer").then(m => ({ default: m.Footer })));

// Simple loading placeholder
const SectionLoader = () => (
  <div className="w-full py-24 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && role) {
      // Redirect admins to their respective dashboards
      if (role === "super_admin") {
        navigate("/admin/super");
      } else if (role === "admin_freefire") {
        navigate("/admin/freefire");
      } else if (role === "admin_bgmi") {
        navigate("/admin/bgmi");
      } else if (role === "admin_valorant") {
        navigate("/admin/valorant");
      } else if (role === "admin_call_of_duty") {
        navigate("/admin/call-of-duty");
      }
    }
  }, [user, role, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <Suspense fallback={<SectionLoader />}>
          <AboutPreview />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <EventsPreview />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <CTASection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
