import React from "react";
import { motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { FALLBACK_IMG } from "../data/meta";
import Globe from "./Globe";

const ease = [0.22, 1, 0.36, 1];

/* Layout constants */
const GLOBE_D = 456;  // slightly larger globe for more impact
const CARDS_H = 380;  // original height for the side cards
const CARD_GAP = 8;   // gap between stacked cards
const OR = "1.5rem";  // outer corner radius
const IR = "4.5rem";  // inner corner radius (globe-hugging side)

/* Border-radius per slot.  Format: "TL  TR  BR  BL"
   The corner(s) that touch the globe get IR, the rest get OR. */
const HUG_L = [
  `${OR} ${OR} ${IR} ${OR}`,
  `${OR} ${IR} ${IR} ${OR}`,
  `${OR} ${IR} ${OR} ${OR}`,
];
const HUG_R = [
  `${OR} ${OR} ${OR} ${IR}`,
  `${IR} ${OR} ${OR} ${IR}`,
  `${IR} ${OR} ${OR} ${OR}`,
];

function CityCard({ city, isActive, onSelect, delay, style, className = "" }) {
  return (
    <motion.button
      data-testid={`city-card-${city.name.replace(/\s+/g, "-").toLowerCase()}`}
      onClick={() => onSelect?.(isActive ? null : city.name)}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden bg-black shadow-2xl transition-all duration-500
                  ${isActive ? "ring-2 ring-white/50 shadow-white/20 z-30" : "ring-1 ring-white/10 shadow-black/50 z-10 hover:z-20"} 
                  ${className}`}
      style={style}
    >
      {/* Glow effect on active */}
      {isActive && (
        <div className="absolute inset-0 z-0 bg-white/10 blur-xl transition-opacity duration-500" />
      )}
      
      <img
        src={city.image}
        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
        alt={city.name}
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out z-0
                   ${isActive ? "scale-105" : "scale-100 group-hover:scale-110"}`}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/100" />
      
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-left text-white z-20 flex flex-col justify-end h-full">
        <motion.div 
          className="translate-y-2 group-hover:-translate-y-1 transition-transform duration-500 ease-out"
        >
          <div className="flex items-center gap-1.5 text-white/80 text-[0.65rem] sm:text-xs uppercase tracking-widest font-semibold mb-1">
            <MapPin size={12} className="shrink-0 text-rose-400" />
            <span className="truncate">{city.state}</span>
          </div>
          <div className="font-display font-extrabold tracking-tight leading-none truncate text-lg sm:text-xl lg:text-2xl drop-shadow-lg">
            {city.name}
          </div>
          
          <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 transform translate-y-2 group-hover:translate-y-0">
            <div className="h-[1px] w-4 bg-rose-400/80"></div>
            <div className="text-xs font-medium text-white/90 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
              {city.count} events
            </div>
          </div>
        </motion.div>
      </div>
    </motion.button>
  );
}

export default function FeaturedCities({ cities = [], active, onSelect }) {
  const suratCity = cities.find(c => c.name.toLowerCase() === "surat");
  const varanasiCity = cities.find(c => c.name.toLowerCase() === "varanasi") || {
    name: "Varanasi",
    count: 0,
    image: "https://images.unsplash.com/photo-1561359313-0639aad073f0?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"
  };
  const indoreCity = cities.find(c => c.name.toLowerCase() === "indore") || {
    name: "Indore",
    count: 0,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"
  };
  
  const bottomCities = [varanasiCity, suratCity, indoreCity].filter(Boolean);
  
  const otherCities = cities.filter(c => 
    !["surat", "varanasi", "indore"].includes(c.name.toLowerCase())
  );

  const left = otherCities.slice(0, 3);
  const right = otherCities.slice(3, 6);
  const extra = otherCities.slice(6);

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
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-5 backdrop-blur-md shadow-xl"
        >
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold tracking-widest uppercase text-white/90">Where it's happening</span>
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
          Spin the globe to explore emerging hotspots and trending tech hubs. Find out where your next big opportunity awaits.
        </motion.p>
      </div>

      {/* ═══════════════════════════════════════════════════
          DESKTOP: [left col] [globe] [right col]
         ═══════════════════════════════════════════════════ */}
      <div className="hidden lg:block relative z-10 max-w-7xl mx-auto">
        
        {/* Extra cities arrayed thoughtfully at the top */}
        {extra.length > 0 && (
          <div className="-mb-4 relative z-30 flex justify-between gap-4 xl:gap-6 mx-auto max-w-6xl px-4">
            {extra.map((city, i) => (
              <CityCard
                key={city.name}
                city={city}
                isActive={active === city.name}
                onSelect={onSelect}
                delay={i * 0.05}
                className="h-[120px] flex-1 min-w-0"
                style={{ borderRadius: "1.2rem" }}
              />
            ))}
          </div>
        )}

        <div
          className="flex items-center justify-center gap-3 xl:gap-5 mx-auto max-w-6xl px-4"
          style={{ height: `${GLOBE_D}px` }}
        >
          {/* Left column ─ cards fill width */}
          <div
            className="flex-1 flex flex-col min-w-0 justify-between"
            style={{ gap: `${CARD_GAP}px`, height: `${CARDS_H}px` }}
          >
            {left.map((city, i) => (
              <CityCard
                key={city.name}
                city={city}
                isActive={active === city.name}
                onSelect={onSelect}
                delay={0.2 + i * 0.1}
                style={{
                  flex: 1,
                  width: "100%",
                  borderRadius: HUG_L[i],
                }}
              />
            ))}
          </div>

          {/* Globe ─ fixed center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -15 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 z-20 flex items-center justify-center relative group cursor-grab active:cursor-grabbing"
            style={{ width: `${GLOBE_D}px`, height: `${GLOBE_D}px` }}
          >
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl -z-10 mix-blend-screen transition-opacity duration-700 group-hover:opacity-100 opacity-60" />
            <Globe />
          </motion.div>

          {/* Right column ─ cards fill width */}
          <div
            className="flex-1 flex flex-col min-w-0 justify-between"
            style={{ gap: `${CARD_GAP}px`, height: `${CARDS_H}px` }}
          >
            {right.map((city, i) => (
              <CityCard
                key={city.name}
                city={city}
                isActive={active === city.name}
                onSelect={onSelect}
                delay={0.3 + i * 0.1}
                style={{
                  flex: 1,
                  width: "100%",
                  borderRadius: HUG_R[i],
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom row: Varanasi, Surat, Indore below the globe */}
        {bottomCities.length > 0 && (
          <div className="-mt-4 relative z-30 flex justify-center gap-4 xl:gap-6 mx-auto max-w-6xl px-4">
            {bottomCities.map((city, i) => {
              const isSurat = city.name.toLowerCase() === "surat";
              return (
                <CityCard
                  key={city.name}
                  city={city}
                  isActive={active === city.name}
                  onSelect={onSelect}
                  delay={0.4 + i * 0.1}
                  className={`h-[120px] flex-1 min-w-0 ${isSurat ? "shadow-rose-500/10 ring-rose-500/20 shadow-2xl ring-1 scale-105" : ""}`}
                  style={{ borderRadius: "1.2rem" }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE: globe on top, 2-col grid below
         ═══════════════════════════════════════════════════ */}
      <div className="lg:hidden relative z-10 px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="flex flex-col items-center mb-12 relative"
        >
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl -z-10" />
          <div className="w-[360px] h-[360px]">
            <Globe />
          </div>
        </motion.div>
        
        {/* Bottom cities directly below globe on mobile */}
        {bottomCities.length > 0 && (
          <div className="mb-4 -mt-6 relative z-30 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {bottomCities.map((city, i) => (
              <CityCard
                key={city.name}
                city={city}
                isActive={active === city.name}
                onSelect={onSelect}
                delay={0.1 + i * 0.05}
                className="w-full h-[180px]"
                style={{ borderRadius: "1.5rem" }}
              />
            ))}
          </div>
        )}

        {/* All cities grid on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-[200px]">
          {otherCities.map((city, i) => (
            <CityCard
              key={city.name}
              city={city}
              isActive={active === city.name}
              onSelect={onSelect}
              delay={i * 0.05}
              style={{ borderRadius: "1.5rem" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
