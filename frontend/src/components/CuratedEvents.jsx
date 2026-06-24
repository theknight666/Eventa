import React, { useEffect, useState } from "react";
import { Gift, Banknote, ChevronLeft, ChevronRight } from "lucide-react";
import { getEvents } from "@/lib/api";
import EventCard from "./EventCard";
import { GridSkeleton } from "./Skeletons";

function EventCarousel({ title, subtitle, icon, events, loading }) {
  const scroller = React.useRef(null);
  
  const scroll = (dir) => {
    scroller.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div className="mb-16 last:mb-0">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="label-eyebrow text-muted-foreground flex items-center gap-2">
            {icon} {subtitle}
          </p>
          <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
            {title}
          </h3>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scroll(-1)} className="h-10 w-10 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll(1)} className="h-10 w-10 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={3} />
      ) : events.length === 0 ? (
        <div className="h-40 rounded-3xl border border-white/5 bg-white/5 flex items-center justify-center text-muted-foreground backdrop-blur-md">
          No events found in this category
        </div>
      ) : (
        <div ref={scroller} className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
          {events.map((ev, i) => (
            <div key={ev.id} className="snap-start shrink-0 w-[80vw] sm:w-[220px]">
              <EventCard event={ev} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CuratedEvents() {
  const [freeEvents, setFreeEvents] = useState([]);
  const [paidEvents, setPaidEvents] = useState([]);
  const [loadingFree, setLoadingFree] = useState(true);
  const [loadingPaid, setLoadingPaid] = useState(true);

  useEffect(() => {
    getEvents({ pricing: "free", sort: "date", limit: 12 })
      .then((d) => setFreeEvents(d.events))
      .finally(() => setLoadingFree(false));
      
    getEvents({ pricing: "paid", sort: "popular", limit: 12 })
      .then((d) => setPaidEvents(d.events))
      .finally(() => setLoadingPaid(false));
  }, []);

  return (
    <section className="relative mx-auto max-w-5xl px-4 sm:px-6 py-24 border-t border-border overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <EventCarousel 
        title="Top Free Events" 
        subtitle="Zero Cost, High Value"
        icon={<Gift size={14} className="text-emerald-400" />}
        events={freeEvents}
        loading={loadingFree}
      />
      
      <EventCarousel 
        title="Premium Experiences" 
        subtitle="Exclusive & Paid"
        icon={<Banknote size={14} className="text-indigo-400" />}
        events={paidEvents}
        loading={loadingPaid}
      />
    </section>
  );
}
