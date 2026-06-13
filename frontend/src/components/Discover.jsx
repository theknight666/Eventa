import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { getEvents } from "@/lib/api";
import EventCard from "./EventCard";
import { GridSkeleton } from "./Skeletons";

const ITEMS_PER_PAGE = 12;

const DATE_OPTS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];
const TYPE_OPTS = [
  { id: "online", label: "Online" },
  { id: "offline", label: "Offline" },
  { id: "hybrid", label: "Hybrid" },
];
const PRICE_OPTS = [
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
];

function FilterGroup({ title, options, value, onChange, testid }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label-eyebrow text-muted-foreground">{title}</label>
      <div className="relative">
        <select
          data-testid={`filter-${testid}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
          className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-all hover:border-foreground/40 focus:border-foreground/40"
        >
          <option value="">Any</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  // Build visible page numbers with ellipsis
  const pages = useMemo(() => {
    if (totalPages <= 1) return [];
    const items = [];
    const delta = 1; // pages shown around current

    items.push(1);

    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    if (rangeStart > 2) items.push("…l");
    for (let i = rangeStart; i <= rangeEnd; i++) items.push(i);
    if (rangeEnd < totalPages - 1) items.push("…r");

    if (totalPages > 1) items.push(totalPages);

    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="flex items-center justify-center gap-1.5 mt-12"
      aria-label="Pagination"
      data-testid="pagination"
    >
      {/* Previous */}
      <button
        data-testid="page-prev"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center
                   text-muted-foreground transition-all hover:border-foreground/40 hover:text-foreground
                   disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page numbers */}
      {pages.map((p) =>
        typeof p === "string" ? (
          <span key={p} className="w-10 text-center text-muted-foreground text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            data-testid={`page-${p}`}
            onClick={() => onPageChange(p)}
            className={`h-10 min-w-10 px-1 rounded-xl text-sm font-semibold border transition-all ${
              p === currentPage
                ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/10"
                : "bg-card text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        data-testid="page-next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center
                   text-muted-foreground transition-all hover:border-foreground/40 hover:text-foreground
                   disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </motion.nav>
  );
}

export default function Discover({ filters, setFilters, categories = [], cities = [] }) {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    getEvents({ ...params, limit: 60 })
      .then((d) => {
        setEvents(d.events);
        setTotal(d.total);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(events.length / ITEMS_PER_PAGE));
  const paginatedEvents = events.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Smooth scroll to top of discover section
    const section = document.getElementById("discover");
    if (section) {
      const y = section.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const set = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const activeCount = Object.entries(filters).filter(([k, v]) => Boolean(v) && k !== "sort").length;
  const clearAll = () =>
    setFilters({ q: "", category: null, city: null, event_type: null, pricing: null, size: null, date_filter: null, sort: "date" });

  const chips = categories;

  return (
    <section id="discover" className="mx-auto max-w-5xl px-4 sm:px-6 py-24 scroll-mt-24" data-testid="discover-section">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="label-eyebrow text-muted-foreground">Find your next event</p>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mt-3">
            {filters.city 
              ? (filters.category ? `${categories.find(c => c.id === filters.category)?.label || filters.category} Events in ${filters.city}` : `Events in ${filters.city}`)
              : (filters.category ? `${categories.find(c => c.id === filters.category)?.label || filters.category} Events` : "Discover Events")}
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
          <div className="flex items-center gap-2 flex-1 lg:w-72 glass rounded-xl px-3 py-2.5">
            <Search size={16} className="text-muted-foreground" />
            <input
              data-testid="discover-search-input"
              value={filters.q}
              onChange={(e) => set("q", e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent outline-none text-sm"
            />
            {filters.q && (
              <button data-testid="discover-search-clear" onClick={() => set("q", "")}>
                <X size={15} className="text-muted-foreground" />
              </button>
            )}
          </div>
          <select
            data-testid="discover-sort"
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value)}
            className="glass rounded-xl px-3 py-2.5 text-sm outline-none bg-transparent"
          >
            <option value="date">Soonest</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Top Rated</option>
          </select>
          <button
            data-testid="toggle-filters"
            onClick={() => setShowFilters((s) => !s)}
            className="relative h-11 px-4 rounded-xl glass flex items-center gap-2 text-sm font-medium"
          >
            <SlidersHorizontal size={16} /> Filters
            {activeCount > 0 && (
              <span className="h-5 min-w-5 px-1 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 pb-2 mb-6">
        <button
          data-testid="chip-all"
          onClick={() => set("category", null)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-all ${
            !filters.category ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:border-foreground/40"
          }`}
        >
          All
        </button>
        {chips.map((c) => (
          <button
            key={c.id}
            data-testid={`chip-${c.id}`}
            onClick={() => set("category", filters.category === c.id ? null : c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-all ${
              filters.category === c.id ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:border-foreground/40"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden mb-8"
        >
          <div className="rounded-2xl border border-border bg-card p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FilterGroup title="Date" options={DATE_OPTS} value={filters.date_filter} onChange={(v) => set("date_filter", v)} testid="date" />
            <FilterGroup title="Format" options={TYPE_OPTS} value={filters.event_type} onChange={(v) => set("event_type", v)} testid="type" />
            <FilterGroup title="Pricing" options={PRICE_OPTS} value={filters.pricing} onChange={(v) => set("pricing", v)} testid="pricing" />
            <FilterGroup title="City" options={cities.map(c => ({ id: c.name, label: c.name }))} value={filters.city} onChange={(v) => set("city", v)} testid="city" />
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground" data-testid="results-count">
          {loading ? "Searching…" : `${total} event${total === 1 ? "" : "s"} found`}
        </p>
        <div className="flex items-center gap-4">
          {!loading && totalPages > 1 && (
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
          )}
          {activeCount > 0 && (
            <button data-testid="clear-filters" onClick={clearAll} className="text-sm font-medium underline underline-offset-4 hover:opacity-70">
              Clear all
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-16 text-center" data-testid="empty-state">
          <p className="font-display text-2xl font-bold">No events match your filters</p>
          <p className="text-muted-foreground mt-2">Try clearing some filters to see more.</p>
          <button onClick={clearAll} className="mt-6 rounded-xl bg-foreground text-background px-6 py-3 font-semibold text-sm">
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-testid="events-grid"
            >
              {paginatedEvents.map((ev, i) => (
                <EventCard key={ev.id} event={ev} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}



