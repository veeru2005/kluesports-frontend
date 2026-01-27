import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutPreview } from "@/components/home/AboutPreview";
import { EventsPreview } from "@/components/home/EventsPreview";
import { CTASection } from "@/components/home/CTASection";
import { useAuth } from "@/contexts/AuthContext";

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
        <AboutPreview />
        <EventsPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
