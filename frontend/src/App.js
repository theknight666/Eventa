import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { SavedProvider } from "@/context/SavedContext";
import { OrganizerProvider } from "@/context/OrganizerContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Critical Components (Eager Load)
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalBackground from "@/components/GlobalBackground";

// Lazy Loaded Pages
const Home = lazy(() => import("@/pages/Home"));
const EventDetail = lazy(() => import("@/pages/EventDetail"));
const Organizer = lazy(() => import("@/pages/Organizer"));
const SavedEvents = lazy(() => import("@/pages/SavedEvents"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const About = lazy(() => import("@/pages/About"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const Partnerships = lazy(() => import("@/pages/Partnerships"));
const VIPScanner = lazy(() => import("@/pages/VIPScanner"));

function App() {
  return (
    <GoogleOAuthProvider clientId="729384923230-5fd80u66uajlodone0h656hh76nq7f34.apps.googleusercontent.com">
      <HelmetProvider>
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
                      <Suspense fallback={<Preloader />}>
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
                      </Suspense>
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
      </HelmetProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
