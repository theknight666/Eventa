import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  ArrowLeft, Bookmark, Share2, MapPin, Calendar, Clock, Users, BadgeCheck,
  Sparkles, Ticket, CalendarPlus, Star, Wifi, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getEvent, getRelated, summarizeEvent, trackView } from "@/lib/api";
import { useSaved } from "@/context/SavedContext";
import { useUser } from "@/context/UserContext";
import { CATEGORY_META, formatINR, formatDateLong, FALLBACK_IMG } from "@/data/meta";
import EventCard from "@/components/EventCard";

import RegisterDialog from "@/components/RegisterDialog";
import { GridSkeleton } from "@/components/Skeletons";
import SEO from "@/components/SEO";

const ease = [0.22, 1, 0.36, 1];

export default function EventDetail({ event: initialEvent, related: initialRelated }) {
  const router = useRouter();
  const { isSaved, toggle } = useSaved();
  const { user } = useUser();
  const [event, setEvent] = useState(initialEvent);
  const [related, setRelated] = useState(initialRelated || []);
  const [summary, setSummary] = useState(initialEvent?.ai_summary || "");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    if (!initialEvent) {
      router.push("/");
    } else {
      setEvent(initialEvent);
      setRelated(initialRelated || []);
      setSummary(initialEvent.ai_summary || "");
      trackView(initialEvent.id);
    }
  }, [initialEvent, router]);

  const genSummary = async () => {
    setSummaryLoading(true);
    try {
      const d = await summarizeEvent(event.id);
      setSummary(d.summary);
    } catch {
      toast.error("Could not generate AI summary right now");
    } finally {
      setSummaryLoading(false);
    }
  };

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: event.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied to clipboard");
      }
    } catch { /* dismissed */ }
  };

  const addToCalendar = () => {
    const start = new Date(event.start_iso);
    const end = new Date(start.getTime() + 6 * 3600 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.address)}`;
    window.open(url, "_blank");
  };

  if (!event) {
    return (
      <div className="pt-32 mx-auto max-w-5xl px-6">
        <div className="aspect-[21/9] rounded-3xl skeleton" />
        <div className="mt-8 h-10 w-2/3 rounded skeleton" />
      </div>
    );
  }

  const saved = isSaved(event.id);
  const meta = CATEGORY_META[event.category] || { gradient: "from-slate-500 to-slate-700" };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "image": event.cover_image || FALLBACK_IMG,
    "startDate": event.start_iso,
    "endDate": new Date(new Date(event.start_iso).getTime() + 6 * 3600 * 1000).toISOString(),
    "eventAttendanceMode": event.event_type === "online" ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": event.event_type === "online" ? {
      "@type": "VirtualLocation",
      "url": typeof window !== "undefined" ? window.location.href : ""
    } : {
      "@type": "Place",
      "name": event.venue,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.city,
        "addressRegion": event.state,
        "addressCountry": "IN"
      }
    },
    "offers": {
      "@type": "Offer",
      "price": event.price || "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": typeof window !== "undefined" ? window.location.href : ""
    },
    "organizer": {
      "@type": "Organization",
      "name": event.organizer_name || "Eventa"
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://eventa.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Events",
        "item": "https://eventa.in/"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": event.title,
        "item": typeof window !== "undefined" ? window.location.href : ""
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "When is this event?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `This event starts on ${new Date(event.start_iso).toLocaleString()}.`
        }
      },
      {
        "@type": "Question",
        "name": "Where is it held?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `It is held at ${event.venue}, ${event.city}.`
        }
      },
      {
        "@type": "Question",
        "name": "How much does it cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The pricing for this event is: ${event.pricing}.`
        }
      }
    ]
  };

  return (
    <div className="pb-28">
      <SEO 
        title={event.title} 
        description={event.description.substring(0, 160)}
        url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://eventa.in'}/event/${event.slug || event.id}`}
        image={event.cover_image}
        type="article"
        keywords={`${event.title}, ${event.city} events, ${event.industry} events, startup events, ${event.category}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([jsonLd, breadcrumbJsonLd, faqJsonLd])
          }}
        />
      </SEO>

      {/* Hero banner */}
      <div className="relative min-h-[60vh] lg:min-h-[70vh] w-full overflow-hidden flex flex-col">
        <img
          src={event.cover_image}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-black/40" />

        <div className="relative flex-1 w-full mx-auto max-w-5xl px-6 flex flex-col py-24">
          <div className="mb-12 lg:mb-20">
            <button
              data-testid="back-btn"
              onClick={() => router.push(-1)}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white hover:scale-105 transition-transform"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mt-auto"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white bg-gradient-to-r ${meta.gradient}`}>
                {event.industry}
              </span>
              <span className="rounded-full px-3 py-1 text-[0.65rem] font-semibold glass text-white capitalize flex items-center gap-1.5">
                {event.event_type === "online" ? <Wifi size={12} /> : <MapPin size={12} />}
                {event.event_type}
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl text-balance">
              {event.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-white/85">
              <span className="flex items-center gap-2"><Calendar size={16} /> {formatDateLong(event.start_iso)}</span>
              <span className="flex items-center gap-2"><Clock size={16} /> {event.time}</span>
              <span className="flex items-center gap-2"><MapPin size={16} /> {event.area ? `${event.area}, ` : ""}{event.city}, {event.state}</span>
              <span className="flex items-center gap-2"><Star size={16} /> {event.rating}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 mt-12 grid lg:grid-cols-3 gap-10">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-12 order-last lg:order-first">

          {/* Overview */}
          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight mb-4">About this event</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{event.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {event.tags.map((t) => (
                <span key={t} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          </section>

          {/* Speakers */}
          {event.speakers?.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight mb-6">Speakers</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {event.speakers.map((s, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4" data-testid={`speaker-${i}`}>
                    <img
                      src={s.image}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      alt={s.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {s.title}{s.company ? ` · ${s.company}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Schedule timeline */}
          {event.schedule?.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight mb-6">Schedule</h2>
              <div className="relative pl-6">
                <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
                {event.schedule.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="relative pb-7"
                    data-testid={`schedule-item-${i}`}
                  >
                    <div className="absolute -left-[22px] top-1.5 h-3.5 w-3.5 rounded-full bg-foreground ring-4 ring-background" />
                    <div className="text-sm font-semibold text-muted-foreground">{s.time}</div>
                    <div className="font-medium mt-0.5">{s.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{s.desc}</div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Venue */}
          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight mb-4">Venue</h2>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="font-semibold text-lg">{event.venue}</div>
              <div className="text-muted-foreground mt-1">{event.address}</div>
              <a
                data-testid="map-link"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
              >
                <MapPin size={15} /> Open in Google Maps
              </a>
            </div>
          </section>
        </div>

        {/* Sidebar ticket card */}
        <div className="lg:col-span-1 order-first lg:order-last">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-3xl border border-border bg-card p-6" data-testid="ticket-card">
              <div className="flex items-baseline justify-between">
                <span className="label-eyebrow text-muted-foreground">Price</span>
                <span className="font-display text-3xl font-extrabold">
                  {event.pricing === "free" ? "Free" : `₹${formatINR(event.price)}`}
                </span>
              </div>
              <button
                data-testid="register-btn"
                onClick={() => setRegisterOpen(true)}
                className="mt-5 w-full rounded-2xl bg-foreground text-background py-3.5 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Ticket size={18} /> Register Now
              </button>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  data-testid="detail-save-btn"
                  onClick={() => { 
                    if (!user) {
                      router.push(`?login=true`);
                      return;
                    }
                    toggle(event.id); 
                    toast(saved ? "Removed from saved" : "Saved"); 
                  }}
                  className="rounded-2xl border border-border py-3 text-sm font-medium flex items-center justify-center gap-2 hover:border-foreground/40 transition-colors"
                >
                  <Bookmark size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
                </button>
                <button
                  data-testid="detail-share-btn"
                  onClick={onShare}
                  className="rounded-2xl border border-border py-3 text-sm font-medium flex items-center justify-center gap-2 hover:border-foreground/40 transition-colors"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
              <button
                data-testid="add-calendar-btn"
                onClick={addToCalendar}
                className="mt-3 w-full rounded-2xl border border-border py-3 text-sm font-medium flex items-center justify-center gap-2 hover:border-foreground/40 transition-colors"
              >
                <CalendarPlus size={16} /> Add to Calendar
              </button>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <p className="label-eyebrow text-muted-foreground mb-3">Organizer</p>
              <div className="flex items-center gap-2">
                <div className="font-semibold">
                  {(() => {
                    let name = event.organizer.name;
                    if (["External Organizer", "Event Organizer", "Townscript Organizer", "Meetup Organizer"].includes(name)) {
                      const sourceUrl = event.ticket_url || event.event_url || event.source_url;
                      if (sourceUrl) {
                        try {
                          const hostname = new URL(sourceUrl).hostname.replace("www.", "");
                          name = "Hosted on " + hostname;
                        } catch (e) {
                          name = "Event Organizer";
                        }
                      } else {
                        name = "Event Organizer";
                      }
                    }
                    return name;
                  })()}
                </div>
                {event.organizer.verified && <BadgeCheck size={17} className="text-blue-500" />}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground"><Users size={13} /> Attending</div>
                  <div className="font-bold mt-1">{formatINR(event.attendees_count)}</div>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground"><Star size={13} /> Rating</div>
                  <div className="font-bold mt-1">{event.rating} / 5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="mx-auto max-w-5xl px-6 mt-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight mb-8">Related Events</h2>
        {related.length === 0 ? (
          <GridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="related-grid">
            {related.map((ev, i) => (
              <EventCard key={ev.id} event={ev} index={i} />
            ))}
          </div>
        )}
      </section>

      <RegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        event={event}
        onRegistered={() => setEvent((e) => (e ? { ...e, attendees_count: e.attendees_count + 1 } : e))}
      />
    </div>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  try {
    const event = await getEvent(params.id);
    let related = [];
    try {
      related = await getRelated(params.id);
    } catch (e) {
      // Ignore related fetch failure
    }
    return {
      props: {
        event,
        related,
      },
      revalidate: 60, // ISR
    };
  } catch (err) {
    return { notFound: true };
  }
}
