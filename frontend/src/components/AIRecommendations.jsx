import React, { useEffect, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { getRecommendations, updateAttendeePreferences } from "@/lib/api";
import { useSaved } from "@/context/SavedContext";
import { useUser } from "@/context/UserContext";
import EventCard from "./EventCard";
import { GridSkeleton } from "./Skeletons";

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

export default function AIRecommendations() {
  const { saved } = useSaved();
  const { user, login } = useUser();
  const [selected, setSelected] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with user preferences on mount
  useEffect(() => {
    if (user?.preferences?.interests) {
      setSelected(user.preferences.interests);
    }
  }, [user]);

  const fetchRecs = (interests) => {
    if (!user) return;
    setLoading(true);
    getRecommendations({ 
      interests, 
      city: user.preferences?.city,
      saved_ids: saved, 
      limit: 6 
    })
      .then((d) => setEvents(d.events))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      fetchRecs(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, saved]);

  const toggle = async (id) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    
    setSelected(next);
    
    // Instantly update backend so their profile stays in sync
    if (user) {
      try {
        const res = await updateAttendeePreferences(user.email, {
          city: user.preferences?.city || "Bengaluru",
          interests: next
        });
        login({ ...user, preferences: res.preferences });
      } catch (err) {
        console.error("Failed to sync preferences", err);
      }
    }
    fetchRecs(next);
  };

  if (!user) {
    return (
      <section id="ai-picks" className="relative py-24" data-testid="ai-recommendations-section">
        <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="rounded-[2rem] border border-border glass p-10 sm:p-14 text-center flex flex-col items-center">
            <Wand2 className="text-muted-foreground animate-float mb-6" size={48} />
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Unlock AI Recommendations
            </h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Sign in to let our AI analyze your interests and rank the best matching events tailored specifically to your taste.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-login"))}
              className="px-6 py-3 bg-foreground text-background font-semibold rounded-full hover:bg-foreground/90 transition-colors"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (user && (!user.preferences?.city || !user.preferences?.interests?.length)) {
    return (
      <section id="ai-picks" className="relative py-24" data-testid="ai-recommendations-section">
        <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="rounded-[2rem] border border-border glass p-10 sm:p-14 text-center flex flex-col items-center">
            <Sparkles className="text-rose-400 animate-float mb-6" size={48} />
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Personalize Your Feed
            </h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Tell us what excites you to activate your custom AI recommendations engine.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-login", { detail: { mode: "onboarding" } }))}
              className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/25"
            >
              Configure Preferences
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="ai-picks" className="relative py-24" data-testid="ai-recommendations-section">
      <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="rounded-[2rem] border border-border glass p-7 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <p className="label-eyebrow text-muted-foreground flex items-center gap-2">
                <Sparkles size={14} /> AI Recommendations
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mt-3">
                AI Picks for You
              </h2>
              <p className="mt-3 text-muted-foreground max-w-lg">
                Pick what excites you — our engine ranks the best matching events
                across India in real time.
              </p>
            </div>
            <Wand2 className="hidden sm:block text-muted-foreground animate-float" size={40} />
          </div>

          <div className="flex flex-wrap gap-2 mb-9">
            {INTERESTS.map((it) => {
              const on = selected.includes(it.id);
              return (
                <button
                  key={it.id}
                  data-testid={`interest-chip-${it.id}`}
                  onClick={() => toggle(it.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition-all ${on
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/40"
                    }`}
                >
                  {it.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <GridSkeleton count={3} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="ai-recommendations-grid">
              {events.map((ev, i) => (
                <EventCard key={ev.id} event={ev} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
