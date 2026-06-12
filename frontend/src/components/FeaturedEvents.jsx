import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Calendar, MapPin, ArrowRight } from "lucide-react";
import { getEvents } from "../lib/api";
import { formatDate, FALLBACK_IMG } from "../data/meta";

export default function FeaturedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

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
        className="relative rounded-[2.5rem] overflow-hidden bg-zinc-950 text-white shadow-[0_0_80px_rgba(245,158,11,0.15)] border border-amber-500/30"
      >
        {/* Premium Background Effects */}
        <motion.div 
          animate={{
            x: [0, -120, 60, 0],
            y: [0, 120, -60, 0],
            scale: [1, 1.3, 0.9, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-amber-600/50 blur-[100px] rounded-full pointer-events-none" 
        />
        <motion.div 
          animate={{
            x: [0, 120, -60, 0],
            y: [0, -120, 60, 0],
            scale: [1, 1.4, 0.8, 1],
            opacity: [0.5, 0.9, 0.5]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-orange-600/50 blur-[100px] rounded-full pointer-events-none" 
        />
        <motion.div 
          animate={{
            x: [0, -80, 120, 0],
            y: [0, -80, 120, 0],
            scale: [0.8, 1.6, 1, 0.8],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-700/40 blur-[120px] rounded-full pointer-events-none" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none" />

        <div className="relative p-8 md:p-14">
          <div className="flex items-center gap-4 mb-10">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)]"
            >
              <Sparkles className="text-white" size={28} />
            </motion.div>
            <div>
              <h2 className="font-display text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">
                Premium Featured
              </h2>
              <p className="text-amber-500/80 text-sm font-semibold tracking-wide uppercase mt-1">Exclusive top-tier experiences</p>
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
                <Link
                  to={`/event/${ev.id}`}
                  className="group block relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-colors shadow-2xl"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img
                      src={ev.cover_image}
                      onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                      alt={ev.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                    
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="flex items-center gap-3 text-xs font-medium text-amber-300 mb-2">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(ev.start_iso)}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {ev.city}</span>
                      </div>
                      <h3 className="font-display text-2xl font-bold leading-tight line-clamp-2 text-white group-hover:text-amber-400 transition-colors">
                        {ev.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between border-t border-white/5">
                    <span className="text-sm font-medium text-zinc-400 line-clamp-1 flex-1 pr-4">
                      By {ev.organizer?.name || "Organizer"}
                    </span>
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-orange-500 group-hover:text-white transition-all shadow-lg group-hover:shadow-amber-500/50">
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
