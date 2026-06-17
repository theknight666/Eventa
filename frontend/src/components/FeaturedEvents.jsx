import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Calendar, MapPin, ArrowRight } from "lucide-react";
import { getEvents } from "@/lib/api";
import { formatDate, FALLBACK_IMG } from "@/data/meta";

export default function FeaturedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  const stars = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }));
  }, []);

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
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[2.5rem] overflow-hidden bg-amber-50/80 dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-[0_40px_120px_-20px_rgba(245,158,11,0.4),inset_0_2px_10px_rgba(255,255,255,0.7),0_0_0_1px_rgba(245,158,11,0.2)] dark:shadow-[0_40px_120px_-20px_rgba(245,158,11,0.5),inset_0_2px_5px_rgba(255,255,255,0.1),0_0_0_1px_rgba(245,158,11,0.3)] backdrop-blur-3xl transform-gpu"
      >
        {/* Premium Background Effects */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-amber-400/40 dark:bg-amber-600/50 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-orange-400/40 dark:bg-orange-600/50 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/30 dark:bg-amber-700/40 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-30 mix-blend-overlay pointer-events-none" />

        {/* Galaxy Starfield */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
              className="absolute rounded-full bg-amber-200 shadow-[0_0_6px_rgba(253,230,138,0.6)]"
              style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
            />
          ))}
        </div>

        <div className="relative p-8 md:p-14">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.6)]">
              <Sparkles className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" size={28} />
            </div>
            <div>
              <h2 className="font-display text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 dark:from-amber-200 dark:via-amber-400 dark:to-orange-500">
                Premium Featured
              </h2>
              <p className="text-amber-700/80 dark:text-amber-500/80 text-sm font-semibold tracking-wide uppercase mt-1">Exclusive top-tier experiences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.slice(0, 3).map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.02, rotateY: 2, rotateX: -2 }}
                className="transform-gpu"
              >
                <Link href={`/event/${ev.slug || ev.id}`}
                  className="group block relative rounded-3xl overflow-hidden border border-amber-500/20 bg-white/60 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors shadow-xl dark:shadow-2xl backdrop-blur-md"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img
                      src={ev.cover_image}
                      onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                      alt={ev.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                    
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="flex items-center gap-3 text-xs font-medium text-amber-300 mb-2 drop-shadow-md">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(ev.start_iso)}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {ev.city}</span>
                      </div>
                      <h3 className="font-display text-2xl font-bold leading-tight line-clamp-2 text-white group-hover:text-amber-300 transition-colors drop-shadow-md">
                        {ev.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between border-t border-amber-500/10 dark:border-white/5">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 line-clamp-1 flex-1 pr-4">
                      By {(() => {
                        const name = ev.organizer?.name || "Organizer";
                        const generic = ["external organizer", "external organiser", "event organizer", "townscript organizer", "meetup organizer", "luma host", "eventbrite organizer"];
                        if (generic.includes(name.toLowerCase())) {
                          const url = ev.ticket_url || ev.event_url || ev.source_url;
                          if (url) {
                            try {
                              const host = new URL(url).hostname.replace("www.", "").split(".")[0];
                              return host.charAt(0).toUpperCase() + host.slice(1);
                            } catch(e) {}
                          }
                        }
                        return name;
                      })()}
                    </span>
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 dark:bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-orange-500 group-hover:text-white text-amber-600 dark:text-white transition-all shadow-md group-hover:shadow-amber-500/50">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
