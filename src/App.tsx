import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import PatientDashboard from "./pages/patient/Dashboard";
import Chatbot from "./pages/patient/Chatbot";
import SymptomChecker from "./pages/patient/SymptomChecker";
import Appointments from "./pages/patient/Appointments";
import Consultation from "./pages/patient/Consultation";
import Pharmacy from "./pages/patient/Pharmacy";
import HealthVitals from "./pages/patient/HealthVitals";
import DoctorDashboard from "./pages/doctor/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/chatbot" element={<Chatbot />} />
              <Route path="/patient/symptoms" element={<SymptomChecker />} />
              <Route path="/patient/appointments" element={<Appointments />} />
              <Route path="/patient/consultation" element={<Consultation />} />
              <Route path="/patient/pharmacy" element={<Pharmacy />} />
              <Route path="/patient/vitals" element={<HealthVitals />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
