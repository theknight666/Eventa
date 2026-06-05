import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { CATEGORY_META } from "../data/meta";

const ease = [0.22, 1, 0.36, 1];

export default function CategoryGrid({ categories = [], active, onSelect }) {
  const list = categories.filter((c) => CATEGORY_META[c.id]).slice(0, 18);

  return (
    <section id="categories" className="mx-auto max-w-5xl px-6 py-24" data-testid="categories-section">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="label-eyebrow text-muted-foreground">Browse by interest</p>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mt-3">
            Explore Categories
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {list.map((cat, i) => {
          const meta = CATEGORY_META[cat.id];
          const Icon = Icons[meta.icon] || Icons.Tag;
          const isActive = active === cat.id;
          return (
            <motion.button
              key={cat.id}
              data-testid={`category-card-${cat.id}`}
              onClick={() => onSelect?.(isActive ? null : cat.id)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease, delay: (i % 6) * 0.05 }}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-2xl p-5 text-left border transition-colors ${
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:border-foreground/30"
              }`}
            >
              <div
                className={`h-11 w-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center mb-8 shadow-lg`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <div className="font-semibold leading-tight">{cat.label}</div>
              <div className={`text-xs mt-1 ${isActive ? "text-background/70" : "text-muted-foreground"}`}>
                {cat.count} events
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
