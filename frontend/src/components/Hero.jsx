import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, MapPin, Sparkles } from "lucide-react";
import Counter from "./Counter";

const HERO_IMG =
  "https://images.unsplash.com/photo-1558008258-3256797b43f3?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000";

const ease = [0.22, 1, 0.36, 1];

export default function Hero({ stats, onSearch }) {
  const [q, setQ] = useState("");
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 140]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.12]);
  const overlayOpacity = useTransform(scrollY, [0, 500], [0.62, 0.85]);

  const submit = (e) => {
    e.preventDefault();
    onSearch?.(q);
  };

  const counters = [
    { label: "Events This Week", value: stats?.events_this_week || 0 },
    { label: "Cities Covered", value: stats?.cities_covered || 0 },
    { label: "Registered Attendees", value: stats?.registered_attendees || 0 },
    { label: "Active Organizers", value: stats?.active_organizers || 0 },
  ];

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden" data-testid="hero">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={HERO_IMG} alt="" className="h-full w-full object-cover" />
      </motion.div>
      <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />
      <div className="absolute inset-0 aurora opacity-50" />

      <div className="relative mx-auto max-w-5xl w-full px-6 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 mb-7"
        >
          <Sparkles size={14} className="text-foreground" />
          <span className="label-eyebrow text-foreground/80">AI-powered event discovery · India</span>
        </motion.div>

        <h1 className="font-display font-extrabold tracking-tight text-balance text-5xl sm:text-6xl lg:text-7xl leading-[0.98] max-w-4xl">
          {"Discover India's Most".split(" ").map((w, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.25em]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.1 + i * 0.08 }}
            >
              {w}
            </motion.span>
          ))}
          <br />
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.5 }}
            className="inline-block bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent"
          >
            Important Events
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.6 }}
          className="mt-6 max-w-xl text-lg text-muted-foreground"
        >
          One intelligent home for every conference, summit, festival and meetup
          worth your time — across 8+ cities and 20+ industries.
        </motion.p>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.7 }}
          className="mt-9 max-w-2xl"
          data-testid="hero-search-form"
        >
          <div className="glass rounded-2xl p-2 flex items-center gap-2 shadow-xl shadow-black/10">
            <div className="flex items-center gap-3 flex-1 px-3">
              <Search size={20} className="text-muted-foreground shrink-0" />
              <input
                data-testid="hero-search-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events, cities, speakers, industries…"
                className="w-full bg-transparent py-3 outline-none placeholder:text-muted-foreground text-base"
              />
            </div>
            <button
              type="submit"
              data-testid="hero-search-submit"
              className="rounded-xl bg-foreground text-background px-6 py-3 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <MapPin size={16} /> Explore
            </button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden glass max-w-3xl"
          data-testid="hero-counters"
        >
          {counters.map((c) => (
            <div key={c.label} className="px-5 py-6 sm:py-7">
              <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                <Counter to={c.value} />
                {c.label === "Registered Attendees" && "+"}
              </div>
              <div className="mt-1.5 label-eyebrow text-muted-foreground text-[0.62rem]">
                {c.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
