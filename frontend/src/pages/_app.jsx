import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { SavedProvider } from "@/context/SavedContext";
import { OrganizerProvider } from "@/context/OrganizerContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import Head from "next/head";

import "@/index.css";
import "@/App.css";

import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalBackground from "@/components/GlobalBackground";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function MyApp({ Component, pageProps }) {
  // Next.js uses server-side rendering, so we need to be careful with browser APIs
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <GoogleOAuthProvider clientId="729384923230-5fd80u66uajlodone0h656hh76nq7f34.apps.googleusercontent.com">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <UserProvider>
            <SavedProvider>
              <OrganizerProvider>
                <ErrorBoundary>
                  <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta name="theme-color" content="#000000" />
                    <link rel="icon" type="image/png" href="/favicon.png" />
                  </Head>
                  <GlobalBackground />
                  
                  {mounted ? (
                    <SmoothScroll>
                      <Navbar />
                      <Component {...pageProps} />
                      <Footer />
                    </SmoothScroll>
                  ) : (
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <div className="flex-1">
                        <Component {...pageProps} />
                      </div>
                      <Footer />
                    </div>
                  )}
                  
                  <Toaster position="bottom-right" theme="system" />
                  <SpeedInsights />
                </ErrorBoundary>
              </OrganizerProvider>
            </SavedProvider>
          </UserProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
