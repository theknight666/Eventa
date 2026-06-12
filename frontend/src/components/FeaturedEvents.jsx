import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Calendar, MapPin, ArrowRight } from "lucide-react";
import { getEvents } from "../lib/api";
import { formatDate, FALLBACK_IMG } from "../data/meta";

export default function FeaturedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents({ featured: true })
      .then((data) => {
        setEvents(data.events || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || events.length === 0) return null;

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white shadow-2xl shadow-amber-500/10 border border-amber-500/20">
        {/* Premium Background Effects */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-amber-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
                Premium Featured
              </h2>
              <p className="text-amber-500/70 text-sm font-medium">Exclusive top-tier experiences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={`/event/${ev.id}`}
                  className="group block relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img
                      src={ev.cover_image}
                      onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                      alt={ev.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-xs text-amber-200/80 mb-1">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(ev.start_iso)}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {ev.city}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold leading-tight line-clamp-2 text-white group-hover:text-amber-400 transition-colors">
                        {ev.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-zinc-400 line-clamp-1 flex-1 pr-4">
                      By {ev.organizer?.name || "Organizer"}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
