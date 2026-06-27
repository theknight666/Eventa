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
import Script from "next/script";
import type { AppProps } from "next/app";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

import "@/index.css";
import "@/App.css";

import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import Preloader from "@/components/Preloader";
import GlobalBackground from "@/components/GlobalBackground";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={manrope.className}>
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
                  </Head>
                  <GlobalBackground />
                  <Preloader />
                  <SmoothScroll>
                    <Navbar />
                    <div className="flex-1">
                      <Component {...pageProps} />
                    </div>
                    <Footer />
                  </SmoothScroll>
                  
                  <Toaster position="bottom-right" theme="system" />
                  <SpeedInsights />
                </ErrorBoundary>
              </OrganizerProvider>
            </SavedProvider>
          </UserProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
    </div>
  );
}
