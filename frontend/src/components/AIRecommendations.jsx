import React, { useEffect, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { getRecommendations } from "../lib/api";
import { useSaved } from "../context/SavedContext";
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
  { id: "healthcare", label: "Healthcare" },
];

export default function AIRecommendations() {
  const { saved } = useSaved();
  const [selected, setSelected] = useState(["technology", "ai"]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecs = (interests) => {
    setLoading(true);
    getRecommendations({ interests, saved_ids: saved, limit: 6 })
      .then((d) => setEvents(d.events))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecs(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    setSelected(next);
    fetchRecs(next);
  };

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
