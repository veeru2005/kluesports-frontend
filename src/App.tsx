import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Team from "./pages/Team";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ScrollToTop } from "./components/ScrollToTop";
import SuperAdminDashboard from "./admin-pages/super-admin/Dashboard";
import FreeFireAdmin from "./admin-pages/freefire/FreeFireAdmin";
import BgmiAdmin from "./admin-pages/bgmi/BgmiAdmin";
import ValorantAdmin from "./admin-pages/valorant/ValorantAdmin";
import CallOfDutyAdmin from "./admin-pages/call-of-duty/CallOfDutyAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin Routes */}
            <Route path="/admin/super" element={<SuperAdminDashboard />} />
            <Route path="/admin/freefire" element={<FreeFireAdmin />} />
            <Route path="/admin/bgmi" element={<BgmiAdmin />} />
            <Route path="/admin/valorant" element={<ValorantAdmin />} />
            <Route path="/admin/call-of-duty" element={<CallOfDutyAdmin />} />

            {/* Redirect /admin to login (or handle intelligently) */}
            <Route path="/admin" element={<Navigate to="/login" replace />} />

            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
