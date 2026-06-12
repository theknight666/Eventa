import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { SavedProvider } from "@/context/SavedContext";
import { OrganizerProvider } from "@/context/OrganizerContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import EventDetail from "@/pages/EventDetail";
import Organizer from "@/pages/Organizer";
import SavedEvents from "@/pages/SavedEvents";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalBackground from "@/components/GlobalBackground";

import About from "@/pages/About";
import ContactUs from "@/pages/ContactUs";
import Partnerships from "@/pages/Partnerships";
import VIPScanner from "@/pages/VIPScanner";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <GoogleOAuthProvider clientId="729384923230-5fd80u66uajlodone0h656hh76nq7f34.apps.googleusercontent.com">
      <ThemeProvider>
        <UserProvider>
          <SavedProvider>
            <OrganizerProvider>
              <BrowserRouter>
                <ErrorBoundary>
                  <GlobalBackground />
                  <SmoothScroll>
                  <Preloader />
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/event/:id" element={<EventDetail />} />
                    <Route path="/organizer" element={<Organizer />} />
                    <Route path="/saved" element={<SavedEvents />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/partnerships" element={<Partnerships />} />
                    <Route path="/vip" element={<VIPScanner />} />
                  </Routes>
                  <Footer />
                </SmoothScroll>
                <Toaster position="bottom-right" theme="system" />
                <SpeedInsights />
                </ErrorBoundary>
              </BrowserRouter>
            </OrganizerProvider>
          </SavedProvider>
        </UserProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
