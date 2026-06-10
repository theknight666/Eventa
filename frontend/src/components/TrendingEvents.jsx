import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { getEvents } from "../lib/api";
import EventCard from "./EventCard";
import { GridSkeleton } from "./Skeletons";

export default function TrendingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const scroller = React.useRef(null);

  useEffect(() => {
    getEvents({ trending: true, sort: "popular", limit: 15 })
      .then((d) => setEvents(d.events))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir) => {
    scroller.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-24" data-testid="trending-section">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="label-eyebrow text-muted-foreground flex items-center gap-2">
            <Flame size={14} className="text-orange-500" /> Hot right now
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mt-3">
            Trending Events
          </h2>
        </div>
        <div className="hidden sm:flex gap-2">
          <button data-testid="trending-prev" onClick={() => scroll(-1)} className="h-11 w-11 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform">
            <ChevronLeft size={18} />
          </button>
          <button data-testid="trending-next" onClick={() => scroll(1)} className="h-11 w-11 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={3} />
      ) : (
        <div ref={scroller} className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
          {events.map((ev, i) => (
            <div key={ev.id} className="snap-start shrink-0 w-[80vw] sm:w-[300px]">
              <EventCard event={ev} index={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
