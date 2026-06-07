import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { organizerLogin, organizerRegister, organizerForgotPassword, organizerResetPassword } from "../../lib/api";
import { useOrganizer } from "../../context/OrganizerContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function OrganizerLogin() {
  const { login } = useOrganizer();
  const [mode, setMode] = useState("login"); // "login", "register", "forgot-password", "reset-password"
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (mode === "forgot-password") {
      if (!email) {
        toast.error("Please enter your organization email");
        return;
      }
      setLoading(true);
      try {
        const res = await organizerForgotPassword({ email });
        toast.success("Recovery link created (Simulated). Check screen.");
        setResetToken(res.token);
        setMode("reset-password");
        setPassword("");
      } catch (err) {
        toast.error("Failed to request recovery link");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === "reset-password") {
      if (!password) {
        toast.error("Please enter a new password");
        return;
      }
      setLoading(true);
      try {
        await organizerResetPassword({ email, token: resetToken, new_password: password });
        toast.success("Password updated! Please sign in.");
        setMode("login");
        setPassword("");
      } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to reset password");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || (mode === "register" && (!username || !email)) || (mode === "login" && !email)) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      let org;
      if (mode === "register") {
        org = await organizerRegister({ name: username, email, password });
        toast.success(`Account created! Welcome, ${org.name}`);
      } else {
        org = await organizerLogin({ email, password });
        toast.success(`Welcome back, ${org.name}!`);
      }
      login(org);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not enter portal");
    } finally {
      setLoading(false);
    }
  };

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
          {mode === "login"
            ? "Enter your organization credentials to manage events and view live analytics."
            : mode === "forgot-password"
              ? "Enter your registered email to reset your password."
              : mode === "reset-password"
                ? "Set a new password for your organization account."
                : "Create an organization account to start publishing events and tracking registrations."}
        </p>

        <div className="mt-8 flex flex-col gap-4" data-testid="organizer-login-form">
          <form onSubmit={handleCustomLogin} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="label-eyebrow text-muted-foreground mb-1.5 block">Organization Name / Username</label>
                <input
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50 transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Organization name"
                />
              </div>
            )}
            {(mode === "register" || mode === "forgot-password" || mode === "login") && (
              <div>
                <label className="label-eyebrow text-muted-foreground mb-1.5 block">
                  {mode === "login" ? "Email or Organization Name" : "Email"}
                </label>
                <input
                  type={mode === "login" ? "text" : "email"}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === "login" ? "org@example.com or name" : "org@example.com"}
                />
              </div>
            )}
            {mode !== "forgot-password" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label-eyebrow text-muted-foreground block">{mode === "reset-password" ? "New Password" : "Password"}</label>
                  {mode === "login" && (
                    <button type="button" onClick={() => setMode("forgot-password")} className="text-xs font-medium text-foreground hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-foreground text-background py-3 font-semibold hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {loading
                ? (mode === "login" ? "Entering portal…" : mode === "forgot-password" ? "Sending…" : mode === "reset-password" ? "Saving..." : "Creating account…")
                : (mode === "login" ? "Sign In" : mode === "forgot-password" ? "Send Recovery Link" : mode === "reset-password" ? "Reset Password" : "Register Organization")}
            </button>
          </form>

          <div className="mt-2 text-center text-sm">
            {mode === "login" ? (
              <p className="text-muted-foreground">
                Don't have an organizer account?{" "}
                <button type="button" onClick={() => setMode("register")} className="font-semibold text-foreground hover:underline">
                  Register now
                </button>
              </p>
            ) : mode === "reset-password" ? null : (
              <p className="text-muted-foreground">
                {mode === "forgot-password" ? "Remember your password? " : "Already have an account? "}
                <button type="button" onClick={() => setMode("login")} className="font-semibold text-foreground hover:underline">
                  Sign in
                </button>
              </p>
            )}
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            size="large"
            shape="pill"
            width="100%"
          />
        </div>
      </motion.div>
    </div>
  );
}
