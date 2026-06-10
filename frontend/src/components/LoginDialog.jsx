import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useGoogleLogin } from "@react-oauth/google";
import { attendeeLogin, attendeeRegister, attendeeForgotPassword, attendeeResetPassword, updateAttendeePreferences } from "../lib/api";
import { useUser } from "../context/UserContext";

const inputCls =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50 transition-colors";

const INTERESTS = [
  { id: "startup", label: "Startup" },
  { id: "technology", label: "Technology" },
  { id: "ai", label: "AI & Automation" },
  { id: "finance", label: "Finance" },
  { id: "marketing", label: "Marketing" },
  { id: "music", label: "Music" },
  { id: "networking", label: "Networking" },
  { id: "business", label: "Business" },
  { id: "design", label: "Design" },
  { id: "education", label: "Education" },
  { id: "gaming", label: "Gaming" },
  { id: "art", label: "Art" },
  { id: "food", label: "Food" },
  { id: "sports", label: "Sports" },
  { id: "realestate", label: "Real Estate" },
  { id: "ecommerce", label: "E-Commerce" },
];

const CITIES = [
  "Bengaluru", "Mumbai", "New Delhi", "Pune", "Hyderabad", "Chennai",
  "Ahmedabad", "Kolkata", "Gurugram", "Noida", "Surat", "Indore", "Goa"
];

export default function LoginDialog({ open, onOpenChange }) {
  const [mode, setMode] = useState("login"); // "login", "register", "forgot-password", "reset-password", "onboarding"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Onboarding state
  const [prefCity, setPrefCity] = useState("Bengaluru");
  const [prefInterests, setPrefInterests] = useState([]);
  const [tempUser, setTempUser] = useState(null);

  const { user, login } = useUser();

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.mode) {
        setMode(e.detail.mode);
      }
    };
    window.addEventListener("open-login", handler);
    return () => window.removeEventListener("open-login", handler);
  }, []);

  useEffect(() => {
    if (open && mode !== "onboarding") {
      setMode("login");
      setUsername("");
      setEmail("");
      setPassword("");
    }
  }, [open, mode]);

  const toggleInterest = (id) => {
    setPrefInterests(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    const targetUser = user || tempUser;
    if (!targetUser) return;
    
    setLoading(true);
    try {
      const res = await updateAttendeePreferences(targetUser.email, {
        city: prefCity,
        interests: prefInterests
      });
      // Update local user state
      const updatedUser = { ...targetUser, preferences: res.preferences };
      login(updatedUser);
      toast.success("Preferences saved! Your AI picks are ready.");
      onOpenChange(false);
      setMode("login");
    } catch (err) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (mode === "forgot-password") {
      if (!email) {
        toast.error("Please enter your email");
        return;
      }
      setLoading(true);
      try {
        const res = await attendeeForgotPassword({ email });
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
        await attendeeResetPassword({ email, token: resetToken, new_password: password });
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
      let attendee;
      if (mode === "register") {
        attendee = await attendeeRegister({ name: username, email, password });
        setTempUser(attendee);
        setMode("onboarding");
      } else {
        attendee = await attendeeLogin({ email, password });
        login(attendee);
        toast.success(`Welcome back, ${attendee.name}!`);
        onOpenChange(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const name = userInfo.name || userInfo.given_name || "Attendee";
        const email = userInfo.email || "";

        const attendee = await attendeeLogin({ name, email });
        
        // If it's a new account (just created via google fallback), we could trigger onboarding
        // Let's check if they have preferences set. If they are totally empty, maybe they are new.
        if (!attendee.preferences || attendee.preferences.interests.length === 0) {
          setTempUser(attendee);
          setMode("onboarding");
        } else {
          login(attendee);
          toast.success(`Welcome back, ${attendee.name}!`);
          onOpenChange(false);
        }
      } catch (err) {
        console.error(err);
        toast.error("Login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("Google Login Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Don't let user click out of onboarding easily
      if (!val && mode === "onboarding" && tempUser) {
        // Fallback login if they close it
        login(tempUser);
        setMode("login");
      }
      onOpenChange(val);
    }}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-center">
            {mode === "login" ? "Welcome back" 
            : mode === "onboarding" ? "Personalize Your AI"
            : mode === "forgot-password" ? "Reset password" 
            : mode === "reset-password" ? "Set New Password" 
            : "Create an account"}
          </DialogTitle>
          {mode === "onboarding" && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Select your preferences to instantly get highly personalized event recommendations.
            </p>
          )}
        </DialogHeader>
        
        {mode === "onboarding" ? (
          <form onSubmit={handleOnboardingSubmit} className="space-y-6 mt-4">
            <div>
              <label className="label-eyebrow text-muted-foreground mb-2 block">Primary City</label>
              <select 
                className={inputCls}
                value={prefCity}
                onChange={(e) => setPrefCity(e.target.value)}
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="label-eyebrow text-muted-foreground mb-2 block">Topics of Interest</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(it => {
                  const on = prefInterests.includes(it.id);
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => toggleInterest(it.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${on
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground/40"
                        }`}
                    >
                      {it.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full rounded-xl bg-foreground text-background py-3 font-semibold hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {loading ? "Saving..." : "Start Discovering"}
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleCustomLogin} className="space-y-4 mt-4" data-testid="login-form">
              {mode === "register" && (
                <div>
                  <label className="label-eyebrow text-muted-foreground mb-1.5 block">Username</label>
                  <input 
                    data-testid="login-username" 
                    className={inputCls} 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Your username" 
                  />
                </div>
              )}
              {(mode === "register" || mode === "forgot-password" || mode === "login") && (
                <div>
                  <label className="label-eyebrow text-muted-foreground mb-1.5 block">
                    {mode === "login" ? "Email or Username" : "Email"}
                  </label>
                  <input 
                    data-testid="login-email" 
                    type={mode === "login" ? "text" : "email"}
                    className={inputCls} 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder={mode === "login" ? "you@example.com or username" : "you@example.com"} 
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
                    data-testid="login-password" 
                    type="password" 
                    className={inputCls} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                  />
                </div>
              )}
              <button 
                data-testid="login-submit" 
                type="submit" 
                disabled={loading} 
                className="w-full rounded-xl bg-foreground text-background py-3 font-semibold hover:scale-[1.02] transition-transform disabled:opacity-60"
              >
                {loading 
                  ? (mode === "login" ? "Signing in…" : mode === "forgot-password" ? "Sending…" : mode === "reset-password" ? "Saving..." : "Registering…") 
                  : (mode === "login" ? "Sign In" : mode === "forgot-password" ? "Send Recovery Link" : mode === "reset-password" ? "Reset Password" : "Register Now")}
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
              {mode === "login" ? (
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              onClick={() => googleLogin()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 font-semibold hover:bg-muted/50 transition-colors disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
