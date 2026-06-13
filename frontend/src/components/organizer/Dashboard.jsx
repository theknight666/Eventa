import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus, Eye, Users, IndianRupee, CalendarDays, Pencil, Trash2, LogOut,
  BadgeCheck, ShieldCheck, MapPin, ExternalLink, Clock, AlertCircle, CheckCircle2, XCircle, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import {
  getDashboard, getOrganizerEvents, deleteOrganizerEvent, requestVerification, getCategories,
} from "@/lib/api";
import { useOrganizer } from "@/context/OrganizerContext";
import { formatINR, formatDate } from "@/data/meta";
import AnalyticsCharts from "./AnalyticsCharts";
import EventForm from "./EventForm";

const ease = [0.22, 1, 0.36, 1];

function StatCard({ icon: Icon, label, value, prefix = "", i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease, delay: i * 0.06 }}
      className="rounded-3xl border border-border bg-card p-6"
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-4">
        <Icon size={18} />
      </div>
      <div className="font-display text-3xl font-extrabold tracking-tight">
        {prefix}{formatINR(value)}
      </div>
      <div className="label-eyebrow text-muted-foreground mt-1.5">{label}</div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { organizer, logout, update } = useOrganizer();
  const slug = organizer.slug;
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const refresh = useCallback(() => {
    getDashboard(slug).then((d) => {
      setData(d);
      update({ verification_status: d.organizer.verification_status, verified: d.organizer.verified });
    }).catch((err) => {
      if (err.response?.status === 404) {
        logout();
        toast.error("Organizer account no longer exists.");
      }
    });
    getOrganizerEvents(slug).then(setEvents);
  }, [slug, update, logout]);

  useEffect(() => {
    refresh();
    getCategories().then(setCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const onDelete = async (ev) => {
    if (!window.confirm(`Delete "${ev.title}"? This cannot be undone.`)) return;
    await deleteOrganizerEvent(slug, ev.id);
    toast.success("Event deleted");
    refresh();
  };

  const onRequestVerify = async () => {
    await requestVerification(slug);
    update({ verification_status: "pending" });
    toast.success("Verification requested — our team will review within 24-48h");
    refresh();
  };

  const handleUpgradeClick = () => {
    if (events.length === 0) {
      toast.error("Create an event first!", { description: "You need at least one published event to feature it." });
      setEditing(null);
      setFormOpen(true);
    } else {
      document.getElementById("organizer-events-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.info("Select an event", { description: "Click the sparkle icon next to the event you want to promote." });
    }
  };

  const stats = data?.stats || {};
  const vstatus = organizer.verification_status;

  return (
    <div className="pt-28 pb-24 mx-auto max-w-5xl px-6" data-testid="organizer-dashboard">
      <SEO title="Organizer Dashboard" noindex={true} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
        <div>
          <p className="label-eyebrow text-muted-foreground">Organizer Portal</p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mt-2 flex items-center gap-3">
            {organizer.name}
            {organizer.verified && <BadgeCheck className="text-blue-500" size={28} />}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-testid="create-event-btn"
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="rounded-xl bg-foreground text-background px-5 py-3 font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={18} /> Create Event
          </button>
          <button
            data-testid="org-logout-btn"
            onClick={logout}
            className="h-11 w-11 rounded-xl border border-border flex items-center justify-center hover:border-foreground/40 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CalendarDays} label="Total Events" value={stats.total_events || 0} i={0} />
        <StatCard icon={Eye} label="Total Views" value={stats.total_views || 0} i={1} />
        <StatCard icon={Users} label="Registrations" value={stats.total_registrations || 0} i={2} />
        <StatCard icon={IndianRupee} label="Revenue" value={stats.revenue || 0} prefix="₹" i={3} />
      </div>

      {/* Verification */}
      {!organizer.verified ? (
        <div className="rounded-3xl border border-border bg-card p-6 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-testid="verification-card">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="font-semibold">Get verified</div>
              <p className="text-sm text-muted-foreground mt-0.5 max-w-md">
                Verified organizers earn a trust badge, higher ranking and featured eligibility.
              </p>
            </div>
          </div>
          {vstatus === "pending" ? (
            <span className="rounded-full bg-amber-500/15 text-amber-500 px-4 py-2 text-sm font-semibold flex items-center gap-2" data-testid="verification-pending">
              <Clock size={15} /> Under review
            </span>
          ) : (
            <button data-testid="request-verification-btn" onClick={onRequestVerify} className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:border-foreground/40 transition-colors shrink-0">
              Request verification
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-blue-500/30 bg-blue-500/5 p-6 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-testid="verified-success-card">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
              <BadgeCheck size={24} />
            </div>
            <div>
              <div className="font-semibold text-blue-700 dark:text-blue-400">Official Organizer Status</div>
              <p className="text-sm text-muted-foreground mt-0.5 max-w-md">
                You are a verified organizer! Your events now stand out with the official trust badge and receive priority placement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Promotion Up-sell */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-testid="premium-upsell-card">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
            <BadgeCheck size={24} />
          </div>
          <div>
            <div className="font-semibold text-amber-600 dark:text-amber-400">Make Your Event Featured</div>
            <p className="text-sm text-muted-foreground mt-0.5 max-w-md">
              Want to sell out faster? Premium featured events are pinned to the top of the homepage and receive up to 5x more views.
            </p>
          </div>
        </div>
        <button 
          onClick={handleUpgradeClick}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 shadow-md shadow-orange-500/20"
        >
          Upgrade Event
        </button>
      </div>

      {/* Analytics */}
      <div className="mb-12">
        <h2 className="font-display text-2xl font-bold tracking-tight mb-5">Analytics</h2>
        {data ? <AnalyticsCharts data={data.timeseries} /> : <div className="h-52 rounded-3xl skeleton" />}
      </div>

      {/* My Events */}
      <div className="mb-12">
        <h2 className="font-display text-2xl font-bold tracking-tight mb-5">Your Events</h2>
        {events.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-14 text-center" data-testid="no-events">
            <p className="font-display text-xl font-bold">No events yet</p>
            <p className="text-muted-foreground mt-2">Create your first event — it goes live in discovery instantly.</p>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="mt-6 rounded-xl bg-foreground text-background px-6 py-3 font-semibold text-sm inline-flex items-center gap-2">
              <Plus size={16} /> Create Event
            </button>
          </div>
        ) : (
          <div id="organizer-events-list" className="rounded-3xl border border-border bg-card divide-y divide-border overflow-hidden" data-testid="organizer-events-list">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center gap-4 p-4 sm:p-5" data-testid={`org-event-${ev.id}`}>
                <img src={ev.cover_image} alt={ev.title} className="h-16 w-24 rounded-xl object-cover hidden sm:block" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate flex items-center gap-2">
                    {ev.title}
                    {ev.approval_status === "pending" && (
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-500/15 text-amber-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertCircle size={10} /> Pending Approval
                      </span>
                    )}
                    {ev.approval_status === "approved" && (
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500/15 text-green-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 size={10} /> Approved
                      </span>
                    )}
                    {ev.approval_status === "rejected" && (
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-red-500/15 text-red-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <XCircle size={10} /> Rejected
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> {formatDate(ev.start_iso)}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {ev.city}</span>
                    <span className="flex items-center gap-1"><Eye size={12} /> {formatINR(ev.views)} views</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {formatINR(ev.attendees_count)} regs</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {ev.featured ? (
                    <div className="h-9 w-9 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 flex items-center justify-center" title="Premium Featured Event">
                      <Sparkles size={15} />
                    </div>
                  ) : (
                    <button 
                      onClick={() => toast.info("Requesting promotion...", { description: `Our sales team will contact you about featuring "${ev.title}".` })} 
                      className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-amber-500 hover:text-amber-500 transition-colors" 
                      title="Make Your Event Featured"
                    >
                      <Sparkles size={15} />
                    </button>
                  )}
                  <Link href={`/event/${ev.slug || ev.id}`} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-foreground/40" data-testid={`org-view-${ev.id}`}>
                    <ExternalLink size={15} />
                  </Link>
                  <button onClick={() => { setEditing(ev); setFormOpen(true); }} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-foreground/40" data-testid={`org-edit-${ev.id}`}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => onDelete(ev)} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors" data-testid={`org-delete-${ev.id}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registrations / leads */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-5">Recent Registrations & Leads</h2>
        {data && data.recent_registrations.length > 0 ? (
          <div className="rounded-3xl border border-border bg-card overflow-hidden" data-testid="registrations-table">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="px-5 py-3 font-medium label-eyebrow">Name</th>
                  <th className="px-5 py-3 font-medium label-eyebrow hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 font-medium label-eyebrow">Event</th>
                  <th className="px-5 py-3 font-medium label-eyebrow hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recent_registrations.map((r) => (
                  <tr key={r.id} data-testid={`lead-${r.id}`}>
                    <td className="px-5 py-3 font-medium">{r.name}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{r.email}</td>
                    <td className="px-5 py-3 text-muted-foreground truncate max-w-[200px]">{r.event}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground" data-testid="no-leads">
            Registrations will appear here as people sign up for your events.
          </div>
        )}
      </div>

      <EventForm
        open={formOpen}
        onOpenChange={setFormOpen}
        slug={slug}
        categories={categories}
        initial={editing}
        onSaved={refresh}
      />
    </div>
  );
}
