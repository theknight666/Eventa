import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { FALLBACK_IMG } from "../data/meta";

const ease = [0.22, 1, 0.36, 1];

export default function FeaturedCities({ cities = [], active, onSelect }) {
  return (
    <section id="cities" className="mx-auto max-w-5xl px-6 py-24" data-testid="cities-section">
      <div className="mb-10">
        <p className="label-eyebrow text-muted-foreground">Where it's happening</p>
        <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mt-3">
          Featured Cities
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
        {cities.map((city, i) => {
          const big = i === 0 || i === 3;
          const isActive = active === city.name;
          return (
            <motion.button
              key={city.name}
              data-testid={`city-card-${city.name.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => onSelect?.(isActive ? null : city.name)}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease, delay: (i % 4) * 0.06 }}
              className={`group relative overflow-hidden rounded-3xl ${
                big ? "md:col-span-2" : ""
              } ${isActive ? "ring-2 ring-foreground" : ""}`}
            >
              <img
                src={city.image}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                alt={city.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-left text-white">
                <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">
                  <MapPin size={12} /> {city.state}
                </div>
                <div className="font-display text-2xl font-extrabold tracking-tight">
                  {city.name}
                </div>
                <div className="text-sm text-white/80">{city.count} events</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
