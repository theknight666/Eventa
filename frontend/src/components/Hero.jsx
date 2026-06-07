import React, { useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Search, MapPin, Sparkles, ScanLine, Ticket as TicketIcon } from "lucide-react";
import Counter from "./Counter";
import { useRef } from "react";

const HERO_VIDEO =
  "https://assets.codepen.io/3364143/7btrrd.mp4";

const ease = [0.22, 1, 0.36, 1];

function Ticket3D() {
  const ref = useRef(null);
  const [flipped, setFlipped] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateYBase = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative w-full max-w-[360px] aspect-[1/1.5] perspective-[1200px]" style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setFlipped(!flipped)}
        style={{
          rotateX,
          rotateY: rotateYBase,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative cursor-pointer group"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="w-full h-full relative"
        >
          {/* Front of Ticket */}
          <div 
            className="absolute inset-0 rounded-[2.5rem] border border-border/50 bg-gradient-to-br from-foreground/5 to-transparent backdrop-blur-2xl p-8 flex flex-col justify-between overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)]" 
            style={{ 
              backfaceVisibility: "hidden",
              WebkitMaskImage: "radial-gradient(circle 14px at 0% 80%, transparent 14px, black 14.5px), radial-gradient(circle 14px at 100% 80%, transparent 14px, black 14.5px)",
              WebkitMaskComposite: "source-in",
              maskImage: "radial-gradient(circle 14px at 0% 80%, transparent 14px, black 14.5px), radial-gradient(circle 14px at 100% 80%, transparent 14px, black 14.5px)",
              maskComposite: "intersect"
            }}
          >
             <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl -mr-12 -mt-12 transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
             <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl -ml-12 -mb-12 transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
             
             <div className="relative z-10">
               <div className="flex justify-between items-start mb-8">
                 <div className="h-10 w-10 rounded-full bg-foreground/5 flex items-center justify-center backdrop-blur-md border border-border/50">
                   <TicketIcon size={18} className="text-foreground" />
                 </div>
                 <span className="px-3 py-1.5 bg-foreground/5 rounded-full text-[0.65rem] font-extrabold uppercase tracking-widest text-foreground backdrop-blur-md border border-border/50">Admit One</span>
               </div>
               <div className="font-display font-extrabold text-4xl text-foreground leading-[1.1] tracking-tight">
                 Eventa<br/>All-Access
               </div>
               <div className="mt-3 text-muted-foreground text-xs font-semibold uppercase tracking-widest">Valid for 2026 Season</div>
             </div>

             <div className="relative z-10">
                <div className="w-full h-[1px] my-6 relative flex items-center justify-between">
                  <div className="absolute left-0 right-0 border-t-2 border-dashed border-border" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[0.65rem] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">Ticket Holder</div>
                    <div className="font-display font-semibold text-lg text-foreground">VIP Guest</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.65rem] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">Price</div>
                    <div className="font-display font-bold text-lg text-emerald-500">Priceless</div>
                  </div>
                </div>
             </div>
          </div>
          
          {/* Back of Ticket */}
          <div 
            className="absolute inset-0 rounded-[2.5rem] border border-border/50 bg-gradient-to-br from-foreground/5 to-transparent backdrop-blur-2xl p-8 flex flex-col justify-center items-center overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)]" 
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)",
              WebkitMaskImage: "radial-gradient(circle 14px at 0% 80%, transparent 14px, black 14.5px), radial-gradient(circle 14px at 100% 80%, transparent 14px, black 14.5px)",
              WebkitMaskComposite: "source-in",
              maskImage: "radial-gradient(circle 14px at 0% 80%, transparent 14px, black 14.5px), radial-gradient(circle 14px at 100% 80%, transparent 14px, black 14.5px)",
              maskComposite: "intersect"
            }}
          >
             <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl -mr-12 -mt-12 transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
             <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl -ml-12 -mb-12 transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
             
             <div className="relative z-10 w-full max-w-[200px] aspect-square bg-white rounded-2xl p-4 flex items-center justify-center shadow-inner">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EVENTA-VIP-PASS-2026&margin=0" 
                  alt="VIP QR Code" 
                  className="w-full h-full object-contain mix-blend-multiply"
                />
             </div>
             <div className="relative z-10 mt-8 text-center space-y-2">
               <div className="font-display text-foreground font-extrabold tracking-widest text-lg">SCAN FOR MAGIC</div>
               <div className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">eventa.in/vip</div>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Hero({ stats, onSearch }) {
  const [q, setQ] = useState("");
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 140]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.12]);
  const overlayOpacity = useTransform(scrollY, [0, 500], [0.3, 0.85]);

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
      <motion.div style={{ y, scale }} className="absolute inset-0 overflow-hidden pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="h-full w-full object-cover opacity-100"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
      </motion.div>
      <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40 pointer-events-none" />
      <div className="absolute inset-0 aurora opacity-50" />

      <div className="relative mx-auto max-w-7xl w-full px-6 pt-32 pb-20 lg:pt-40 lg:pb-32 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16 lg:gap-8">
        
        {/* Left Column: Text & CTA */}
        <div className="flex-1 max-w-2xl w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 mb-7"
          >
            <Sparkles size={14} className="text-foreground" />
            <span className="label-eyebrow text-foreground/80">AI-powered event discovery · India</span>
          </motion.div>

          <h1 className="font-display font-extrabold tracking-tight text-balance text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] leading-[1] max-w-2xl">
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
            className="mt-6 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
          >
            One intelligent home for every conference, summit, festival and meetup
            worth your time — across 8+ cities and 20+ industries.
          </motion.p>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.7 }}
            className="mt-10 max-w-xl w-full"
            data-testid="hero-search-form"
          >
            <div className="glass rounded-2xl p-2 flex items-center gap-2 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3 flex-1 px-4">
                <Search size={20} className="text-muted-foreground shrink-0" />
                <input
                  data-testid="hero-search-input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search events, cities, speakers…"
                  className="w-full bg-transparent py-3.5 outline-none placeholder:text-muted-foreground text-base"
                />
              </div>
              <button
                type="submit"
                data-testid="hero-search-submit"
                className="rounded-xl bg-foreground text-background px-7 py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <MapPin size={16} /> Explore
              </button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden glass max-w-xl"
            data-testid="hero-counters"
          >
            {counters.map((c) => (
              <div key={c.label} className="px-5 py-6">
                <div className="font-display text-3xl font-extrabold tracking-tight">
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

        {/* Right Column: 3D Ticket */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.3 }}
          className="flex-1 w-full flex justify-center lg:justify-end"
        >
          <Ticket3D />
        </motion.div>

      </div>
    </section>
  );
}
