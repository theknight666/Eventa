import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSaved } from "@/context/SavedContext";
import SEO from "@/components/SEO";
import { useUser } from "@/context/UserContext";
import { getBulkEvents } from "@/lib/api";
import EventCard from "@/components/EventCard";
import { Bookmark, ArrowLeft } from "lucide-react";
import { GridSkeleton } from "@/components/Skeletons";

export default function SavedEvents() {
  const router = useRouter();
  const { user } = useUser();
  const { saved } = useSaved();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user) {
      setLoading(false);
      return;
    }

    if (saved.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getBulkEvents({ ids: saved })
      .then((data) => {
        setEvents(data.events || []);
      })
      .catch((err) => {
        console.error("Failed to fetch saved events", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, saved]);

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-[100svh] pt-24 pb-24">
      <SEO title="Saved Events" noindex={true} />
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Discover
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-foreground text-background flex items-center justify-center">
              <Bookmark size={24} />
            </div>
            <div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight">Saved Events</h1>
              <p className="text-muted-foreground mt-1">
                Your personal collection of events to attend.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <GridSkeleton count={3} />
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-16 text-center">
            <Bookmark size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-display text-2xl font-bold">No saved events yet</p>
            <p className="text-muted-foreground mt-2">
              Go discover some amazing events and save them for later!
            </p>
            <Link href="/" className="mt-6 inline-flex rounded-xl bg-foreground text-background px-6 py-3 font-semibold text-sm hover:opacity-90 transition-opacity">
              Discover Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev, i) => (
              <EventCard key={ev.id} event={ev} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
