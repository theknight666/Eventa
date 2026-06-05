import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { organizerLogin } from "../../lib/api";
import { useOrganizer } from "../../context/OrganizerContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function OrganizerLogin() {
  const { login } = useOrganizer();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const name = decoded.name || decoded.given_name || "Organizer";
      const email = decoded.email || "";
      
      const org = await organizerLogin({ name, email });
      login(org);
      toast.success(`Welcome, ${org.name}!`);
    } catch (err) {
      console.error(err);
      toast.error("Could not enter portal");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Login Failed");
  };

  return (
      <div className="min-h-[100svh] flex items-center justify-center px-6 pt-24 pb-16 relative">
      <div className="absolute inset-0 aurora opacity-50" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-[2rem] border border-border glass p-8 sm:p-10"
      >
        <div className="h-14 w-14 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6">
          <Building2 size={26} />
        </div>
        <p className="label-eyebrow text-muted-foreground flex items-center gap-2">
          <Sparkles size={13} /> Organizer Portal
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight mt-3">
          Publish your events
        </h1>
        <p className="text-muted-foreground mt-3">
          Enter your organization to manage events, track registrations and
          view live analytics. No password needed.
        </p>

        <div className="mt-8 flex flex-col gap-4" data-testid="organizer-login-form">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            size="large"
            shape="pill"
            width="100%"
          />
          {loading && <p className="text-sm text-center text-muted-foreground">Entering portal...</p>}
        </div>
      </motion.div>
    </div>
  );
}
