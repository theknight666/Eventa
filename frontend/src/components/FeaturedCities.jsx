import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { FALLBACK_IMG } from "@/data/meta";

const ease = [0.22, 1, 0.36, 1];

function CityCard({ city, isActive, onSelect, delay, className = "" }) {
  const ref = useRef(null);

  // 3D Tilt Effect Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Dynamic shadow maps (casts shadow away from mouse)
  const shadowX = useTransform(mouseXSpring, [-0.5, 0.5], ["30px", "-30px"]);
  const shadowY = useTransform(mouseYSpring, [-0.5, 0.5], ["30px", "-30px"]);
  const dynamicBoxShadow = useMotionTemplate`${shadowX} ${shadowY} 50px -10px var(--3d-shadow-color)`;

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
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }} 
      className="group w-full h-full"
    >
      <motion.button
        data-testid={`city-card-${city.name.replace(/\s+/g, "-").toLowerCase()}`}
        onClick={() => onSelect?.(isActive ? null : city.name)}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease, delay }}
        whileTap={{ scale: 0.95 }}
        style={{
          rotateX,
          rotateY,
          boxShadow: dynamicBoxShadow,
          transformStyle: "preserve-3d",
        }}
        className={`relative overflow-hidden bg-black transition-colors duration-300 rounded-3xl w-full h-full cursor-pointer
                    ${isActive ? "ring-2 ring-white/50 z-30" : "ring-1 ring-white/10 z-10"} 
                    ${className}`}
      >
        {/* Deep background layer */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ transform: "translateZ(-30px)" }}
        >
          <img
            src={city.image}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            alt={city.name}
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out z-0
                      ${isActive ? "scale-105" : "scale-110 group-hover:scale-[1.15]"}`}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/100" />
        </div>

        {/* Glow effect on active */}
        {isActive && (
          <div className="absolute inset-0 z-0 bg-white/10 blur-xl transition-opacity duration-500" style={{ transform: "translateZ(10px)" }} />
        )}

        {/* Popped text layer */}
        <div 
          className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-left text-white z-20 flex flex-col justify-end h-full"
          style={{ transform: "translateZ(50px)" }}
        >
          <div className="translate-y-2 group-hover:-translate-y-1 transition-transform duration-500 ease-out">
            <div className="flex items-center gap-1.5 text-white/80 text-[0.65rem] sm:text-xs uppercase tracking-widest font-semibold mb-1">
              <MapPin size={12} className="shrink-0 text-rose-400" />
              <span className="truncate">{city.state}</span>
            </div>
            <div className="font-display font-extrabold tracking-tight leading-none truncate text-2xl sm:text-3xl drop-shadow-lg">
              {city.name}
            </div>

            <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 transform translate-y-2 group-hover:translate-y-0">
              <div className="h-[1px] w-4 bg-rose-400/80"></div>
              <div className="text-xs font-medium text-white/90 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
                {city.count} events
              </div>
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  );
}

export default function FeaturedCities({ cities = [], active, onSelect }) {
  // Sort by count descending and only keep cities with at least 1 event
  const validCities = [...cities]
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // Take up to 10 cities for the Bento Grid layout
  const bentoCities = validCities.slice(0, 10);

  // Layout config for up to 10 items in a 4-col CSS Grid
  const bentoClasses = [
    "col-span-1 sm:col-span-2 md:col-span-2 row-span-2 min-h-[300px] md:h-full md:min-h-0",  // 1: Large primary
    "col-span-1 sm:col-span-1 md:col-span-1 row-span-2 min-h-[300px] md:h-full md:min-h-0",  // 2: Tall vertical
    "col-span-1 sm:col-span-1 md:col-span-1 row-span-1 min-h-[220px] md:h-full md:min-h-0",  // 3: Small square
    "col-span-1 sm:col-span-1 md:col-span-1 row-span-1 min-h-[220px] md:h-full md:min-h-0",  // 4: Small square
    "col-span-1 sm:col-span-2 md:col-span-2 row-span-1 min-h-[220px] md:h-full md:min-h-0",  // 5: Wide horizontal
    "col-span-1 sm:col-span-1 md:col-span-1 row-span-1 min-h-[220px] md:h-full md:min-h-0",  // 6: Small square
    "col-span-1 sm:col-span-1 md:col-span-1 row-span-1 min-h-[220px] md:h-full md:min-h-0",  // 7: Small square
    "col-span-1 sm:col-span-2 md:col-span-2 row-span-1 min-h-[220px] md:h-full md:min-h-0",  // 8: Wide horizontal
    "col-span-1 sm:col-span-1 md:col-span-1 row-span-1 min-h-[220px] md:h-full md:min-h-0",  // 9: Small square
    "col-span-1 sm:col-span-1 md:col-span-1 row-span-1 min-h-[220px] md:h-full md:min-h-0",  // 10: Small square
  ];

  return (
    <section id="cities" className="relative mx-auto w-full px-4 sm:px-6 py-24 sm:py-32 overflow-hidden" data-testid="cities-section">
      {/* Background aesthetic enhancements */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <div className="mb-16 text-center max-w-2xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 mb-5 backdrop-blur-md shadow-xl"
        >
          <Sparkles className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          <span className="text-xs font-bold tracking-widest uppercase text-foreground/90">Where it's happening</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
        >
          Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400 drop-shadow-sm">Cities</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-sm sm:text-base mt-5 max-w-md"
        >
          Explore emerging hotspots and trending tech hubs. Find out where your next big opportunity awaits across India.
        </motion.p>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 md:auto-rows-[220px]">
          {bentoCities.map((city, i) => (
            <div key={city.name} className={bentoClasses[i] || "col-span-1 row-span-1"}>
              <CityCard
                city={city}
                isActive={active === city.name}
                onSelect={onSelect}
                delay={0.1 + i * 0.05}
              />
            </div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
            <span className="h-px w-12 bg-border"></span>
            More cities and global hubs coming soon
            <span className="h-px w-12 bg-border"></span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
