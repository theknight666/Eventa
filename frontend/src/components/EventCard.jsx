import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Bookmark, MapPin, Calendar, Share2, BadgeCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { useSaved } from "@/context/SavedContext";
import { useUser } from "@/context/UserContext";
import { CATEGORY_META, formatDate, formatINR, FALLBACK_IMG } from "@/data/meta";
import Image from "next/image";

const ease = [0.22, 1, 0.36, 1];

const TICKET_STYLES = {
  available: "bg-emerald-500/15 text-emerald-500",
  few_left: "bg-amber-500/15 text-amber-500",
  sold_out: "bg-rose-500/15 text-rose-500",
};
const TICKET_LABEL = { available: "Tickets available", few_left: "Few left", sold_out: "Sold out" };

const EventCard = React.memo(({ event, index = 0 }) => {
  const { isSaved, toggle } = useSaved();
  const { user } = useUser();
  const router = useRouter();
  const saved = isSaved(event.id);
  const meta = CATEGORY_META[event.category] || { gradient: "from-slate-500 to-slate-700" };

  const onSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`?login=true`);
      return;
    }
    toggle(event.id);
    toast(saved ? "Removed from saved" : "Saved to your list", {
      description: event.title,
    });
  };

  const onShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/event/${event.id}`;
    try {
      if (navigator.share) await navigator.share({ title: event.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied", { description: "Share it with your network" });
      }
    } catch {
      /* dismissed */
    }
  };

  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
  const isExpired = new Date(event.start_iso) < startOfToday;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease, delay: (index % 3) * 0.07 }}
      data-testid={`event-card-${event.id}`}
      className={isExpired ? "opacity-75 grayscale-[0.3]" : ""}
    >
      <Link href={`/event/${event.slug || event.id}`} className="group block rounded-3xl border border-border bg-card overflow-hidden hover:border-foreground/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={event.cover_image?.startsWith("/") ? FALLBACK_IMG : (event.cover_image || FALLBACK_IMG)}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            alt={event.title}
            fill
            quality={60}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {isExpired && (
              <span className="rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-sm">
                Expired
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white bg-gradient-to-r ${meta.gradient}`}>
              {event.category}
            </span>
            {event.featured && !isExpired && (
              <span className="rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider glass text-white">
                Featured
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex gap-2 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              data-testid={`event-card-save-${event.id}`}
              onClick={onSave}
              aria-label="Save event"
              className={`h-9 w-9 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform ${saved ? "text-foreground" : "text-white"}`}
            >
              <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
            </button>
            <button
              data-testid={`event-card-share-${event.id}`}
              onClick={onShare}
              aria-label="Share event"
              className="h-9 w-9 rounded-full glass flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              <Share2 size={16} />
            </button>
          </div>

        </div>

        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[0.75rem] font-medium text-primary">
            <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(event.start_iso)}</span>
            {event.ticket_status !== "available" && (
              <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider ${TICKET_STYLES[event.ticket_status]}`}>
                {TICKET_LABEL[event.ticket_status]}
              </span>
            )}
          </div>

          <h3 className="font-display text-base font-bold leading-snug tracking-tight line-clamp-2 min-h-[2.8rem]">
            {event.title}
          </h3>

          <div className="flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
            <MapPin size={13} className="shrink-0" />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {event.area ? `${event.area}, ${event.city}` : event.city}
            </span>
          </div>

          <div className="mt-1 pt-3 border-t border-border flex items-center justify-between">
            <div>
              {event.pricing === "free" ? (
                <span className="font-bold text-emerald-500 text-sm">Free</span>
              ) : (
                <span className="font-bold text-sm">₹{formatINR(event.price)}</span>
              )}
            </div>

            {(event.attendees_count > 0 || event.rating > 0) && (
              <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground font-medium">
                {event.attendees_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {formatINR(event.attendees_count)}
                  </span>
                )}
                {event.attendees_count > 0 && event.rating > 0 && <span>·</span>}
                {event.rating > 0 && (
                  <span className="flex items-center gap-1 text-amber-500">
                    ★ {event.rating}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default EventCard;
