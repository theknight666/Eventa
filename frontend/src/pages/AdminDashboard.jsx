import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import SEO from "../components/SEO";
import {
  adminLogin,
  getAdminPendingEvents,
  getAdminAllEvents,
  adminApproveEvent,
  adminRejectEvent,
  adminDeleteEvent,
  getAdminPendingOrganizers,
  getAdminAllOrganizers,
  getAdminVerifiedOrganizers,
  adminVerifyOrganizer,
  adminRejectOrganizerVerification,
  adminDeleteOrganizer,
  adminDownloadRegistrationsCSV,
  adminFeatureEvent,
  adminUnfeatureEvent
} from "../lib/api";

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("events");
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [pendingOrganizers, setPendingOrganizers] = useState([]);
  const [allOrganizers, setAllOrganizers] = useState([]);
  const [verifiedOrganizers, setVerifiedOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    setToken(null);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "events") {
        const events = await getAdminPendingEvents();
        setPendingEvents(events);
      } else if (tab === "organizers") {
        const orgs = await getAdminPendingOrganizers();
        setPendingOrganizers(orgs);
      } else if (tab === "all-events") {
        const evts = await getAdminAllEvents();
        setAllEvents(evts);
      } else if (tab === "all-organizers") {
        const orgs = await getAdminAllOrganizers();
        setAllOrganizers(orgs);
      } else if (tab === "verified-organizers") {
        const orgs = await getAdminVerifiedOrganizers();
        setVerifiedOrganizers(orgs);
      }
    } catch (e) {
      if (e.response?.status === 401) {
        logout();
      } else {
        toast.error("Failed to load admin data");
      }
    } finally {
      setLoading(false);
    }
  }, [tab, logout]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await adminLogin({ password });
      if (res.token) {
        localStorage.setItem("adminToken", res.token);
        setToken(res.token);
        toast.success("Logged in as Admin");
      }
    } catch {
      toast.error("Invalid admin password");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <form onSubmit={login} className="w-full max-w-sm p-8 bg-card border border-border rounded-3xl shadow-2xl flex flex-col items-center">
          <h2 className="text-2xl font-bold font-display mb-6">Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-foreground mb-4"
            placeholder="Enter Admin Password"
          />
          <button type="submit" className="w-full bg-foreground text-background py-3 rounded-xl font-bold hover:opacity-90">
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <SEO title="Admin Dashboard" noindex={true} />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage events and verify organizers.</p>
        </div>
        <button onClick={logout} className="text-sm font-medium text-destructive hover:underline">
          Logout
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="flex gap-2 border-b border-border pb-1 overflow-x-auto w-full sm:w-auto overflow-y-hidden">
          <TabButton active={tab === "events"} onClick={() => setTab("events")}>Pending Events</TabButton>
          <TabButton active={tab === "organizers"} onClick={() => setTab("organizers")}>Pending Verification</TabButton>
          <TabButton active={tab === "verified-organizers"} onClick={() => setTab("verified-organizers")}>Verified Organizers</TabButton>
          <TabButton active={tab === "all-events"} onClick={() => setTab("all-events")}>All Events</TabButton>
          <TabButton active={tab === "all-organizers"} onClick={() => setTab("all-organizers")}>All Organizers</TabButton>
        </div>
        <div className="w-full sm:w-72 shrink-0 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, name, ID, email..."
            className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div>
          {tab === "events" && (
            <PendingEventsList 
              items={pendingEvents.filter(ev => ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) || ev.id?.toLowerCase().includes(searchQuery.toLowerCase()))} 
              refresh={loadData} 
            />
          )}
          {tab === "organizers" && (
            <PendingOrganizersList 
              items={pendingOrganizers.filter(org => org.name?.toLowerCase().includes(searchQuery.toLowerCase()) || org.email?.toLowerCase().includes(searchQuery.toLowerCase()))} 
              refresh={loadData} 
            />
          )}
          {tab === "all-events" && (
            <AllEventsList 
              items={allEvents.filter(ev => ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) || ev.id?.toLowerCase().includes(searchQuery.toLowerCase()))} 
              refresh={loadData} 
            />
          )}
          {tab === "all-organizers" && (
            <AllOrganizersList 
              items={allOrganizers.filter(org => org.name?.toLowerCase().includes(searchQuery.toLowerCase()) || org.email?.toLowerCase().includes(searchQuery.toLowerCase()))} 
              refresh={loadData} 
            />
          )}
          {tab === "verified-organizers" && (
            <AllOrganizersList 
              items={verifiedOrganizers.filter(org => org.name?.toLowerCase().includes(searchQuery.toLowerCase()) || org.email?.toLowerCase().includes(searchQuery.toLowerCase()))} 
              refresh={loadData} 
            />
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium whitespace-nowrap transition-colors rounded-t-xl ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function PendingEventsList({ items, refresh }) {
  if (!items.length) return <EmptyState text="No pending events to review." />;
  return (
    <div className="grid gap-4">
      {items.map((ev) => (
        <div key={ev.id} className="p-5 border border-border bg-card rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg">{ev.title}</h3>
            <p className="text-sm text-muted-foreground">
              {ev.date} • {ev.city} • By {ev.organizer?.name || "Organizer"}
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={async () => { await adminApproveEvent(ev.id); toast.success("Approved"); refresh(); }}
              className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              Approve
            </button>
            <button
              onClick={async () => { await adminRejectEvent(ev.id); toast.success("Rejected"); refresh(); }}
              className="flex-1 md:flex-none border border-destructive text-destructive px-4 py-2 rounded-xl text-sm font-medium"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingOrganizersList({ items, refresh }) {
  if (!items.length) return <EmptyState text="No pending verification requests." />;
  return (
    <div className="grid gap-4">
      {items.map((org) => (
        <div key={org.slug} className="p-5 border border-border bg-card rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg">{org.name}</h3>
            <p className="text-sm text-muted-foreground">{org.email}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={async () => { await adminVerifyOrganizer(org.slug); toast.success("Verified"); refresh(); }}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              Verify Organizer
            </button>
            <button
              onClick={async () => { await adminRejectOrganizerVerification(org.slug); toast.success("Rejected"); refresh(); }}
              className="flex-1 md:flex-none border border-destructive text-destructive px-4 py-2 rounded-xl text-sm font-medium"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AllEventsList({ items, refresh }) {
  if (!items.length) return <EmptyState text="No events found." />;
  return (
    <div className="grid gap-4">
      {items.map((ev) => (
        <div key={ev.id} className="p-4 border border-border bg-card rounded-2xl flex justify-between items-center gap-4">
          <div className="truncate pr-4">
            <div className="font-medium truncate">{ev.title}</div>
            <div className="text-xs text-muted-foreground">ID: {ev.id} • Status: {ev.approval_status || "approved"}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  await adminDownloadRegistrationsCSV(ev.id);
                  toast.success("CSV Downloaded");
                } catch (e) {
                  toast.error("Download failed");
                }
              }}
              className="text-foreground text-sm px-3 py-1 rounded-lg hover:bg-foreground/10 border border-border whitespace-nowrap"
            >
              CSV
            </button>
            {ev.featured ? (
              <button
                onClick={async () => { await adminUnfeatureEvent(ev.id); toast.success("Unfeatured"); refresh(); }}
                className="text-amber-500 text-sm px-3 py-1 rounded-lg hover:bg-amber-500/10 whitespace-nowrap border border-amber-500/30"
              >
                Unfeature
              </button>
            ) : (
              <button
                onClick={async () => { await adminFeatureEvent(ev.id); toast.success("Featured"); refresh(); }}
                className="text-blue-500 text-sm px-3 py-1 rounded-lg hover:bg-blue-500/10 whitespace-nowrap border border-blue-500/30"
              >
                Feature
              </button>
            )}
            <button
              onClick={async () => { 
                if(window.confirm("Delete this event forever?")) {
                  await adminDeleteEvent(ev.id); toast.success("Deleted"); refresh();
                }
              }}
              className="text-destructive text-sm px-3 py-1 rounded-lg hover:bg-destructive/10 whitespace-nowrap"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AllOrganizersList({ items, refresh }) {
  if (!items.length) return <EmptyState text="No organizers found." />;
  return (
    <div className="grid gap-4">
      {items.map((org) => (
        <div key={org.slug} className="p-4 border border-border bg-card rounded-2xl flex justify-between items-center gap-4">
          <div className="truncate pr-4">
            <div className="font-medium truncate">{org.name} {org.verified && "✅"}</div>
            <div className="text-xs text-muted-foreground">
              Slug: {org.slug} • Email: {org.email}
              {org.verification_status === "pending" && " • Status: Pending Verification"}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {org.verified && (
              <button
                onClick={async () => {
                  if(window.confirm("Revoke verification badge for this organizer?")) {
                    await adminRejectOrganizerVerification(org.slug); toast.success("Revoked"); refresh();
                  }
                }}
                className="text-amber-600 text-sm px-3 py-1 rounded-lg hover:bg-amber-600/10 whitespace-nowrap"
              >
                Revoke Tick
              </button>
            )}
            {org.verification_status === "pending" && (
              <button
                onClick={async () => {
                  if(window.confirm("Deny verification request?")) {
                    await adminRejectOrganizerVerification(org.slug); toast.success("Denied"); refresh();
                  }
                }}
                className="text-amber-600 text-sm px-3 py-1 rounded-lg hover:bg-amber-600/10 whitespace-nowrap"
              >
                Deny Request
              </button>
            )}
            <button
              onClick={async () => { 
                if(window.confirm("Delete this organizer and ALL their events forever?")) {
                  await adminDeleteOrganizer(org.slug); toast.success("Deleted"); refresh();
                }
              }}
              className="text-destructive text-sm px-3 py-1 rounded-lg hover:bg-destructive/10 whitespace-nowrap"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-card">
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
