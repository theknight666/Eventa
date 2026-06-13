import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";
import { useSaved } from "@/context/SavedContext";
import { getAttendeeHistory, getBulkEvents } from "@/lib/api";
import EventCard from "@/components/EventCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, History, Bookmark, Settings, LogOut, ArrowLeft } from "lucide-react";
import { GridSkeleton } from "@/components/Skeletons";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useUser();
  const { saved } = useSaved();

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [savedEvents, setSavedEvents] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch History
    setHistoryLoading(true);
    getAttendeeHistory(user.email)
      .then((data) => {
        setHistory(data.history || []);
      })
      .catch((err) => {
        console.error("Failed to fetch history", err);
      })
      .finally(() => {
        setHistoryLoading(false);
      });

    // Fetch Saved Events
    if (saved.length === 0) {
      setSavedEvents([]);
    } else {
      setSavedLoading(true);
      getBulkEvents({ ids: saved })
        .then((data) => {
          setSavedEvents(data.events || []);
        })
        .catch((err) => {
          console.error("Failed to fetch saved events", err);
        })
        .finally(() => {
          setSavedLoading(false);
        });
    }
  }, [user, saved]);

  
  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
    toast.success("Logged out successfully");
  };

  return (
    <main className="min-h-[100svh] pt-24 pb-24 bg-background">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft size={16} /> Back to Discover
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-bold font-display uppercase">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-display text-4xl font-extrabold tracking-tight">
                  Welcome, {user.name.split(" ")[0]}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your account, view history, and saved events.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors bg-red-500/10 px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="mb-8 w-full md:w-auto overflow-x-auto justify-start border-b border-border bg-transparent p-0 rounded-none pb-px">
            <TabsTrigger
              value="account"
              className="data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none bg-transparent data-[state=active]:shadow-none px-6 py-3 font-semibold"
            >
              <User size={18} className="mr-2 inline-block" /> My Account
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none bg-transparent data-[state=active]:shadow-none px-6 py-3 font-semibold"
            >
              <History size={18} className="mr-2 inline-block" /> History
            </TabsTrigger>
            <TabsTrigger
              value="wishlist"
              className="data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none bg-transparent data-[state=active]:shadow-none px-6 py-3 font-semibold"
            >
              <Bookmark size={18} className="mr-2 inline-block" /> Wishlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-0 outline-none">
            <div className="rounded-3xl border border-border bg-card p-8 md:p-12 shadow-sm">
              <h2 className="text-2xl font-display font-bold mb-6">Account Details</h2>
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                  <div className="px-4 py-3 bg-muted/50 rounded-xl border border-border/50 text-foreground font-medium">
                    {user.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                  <div className="px-4 py-3 bg-muted/50 rounded-xl border border-border/50 text-foreground font-medium">
                    {user.email}
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Note: Your account is currently managed through Google Sign-In. Password and email changes must be made via your Google account.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0 outline-none">
            {historyLoading ? (
              <GridSkeleton count={3} />
            ) : history.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-16 text-center shadow-sm">
                <History size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="font-display text-2xl font-bold">No history yet</p>
                <p className="text-muted-foreground mt-2">
                  You haven't attended or registered for any events.
                </p>
                <Link href="/" className="mt-6 inline-flex rounded-xl bg-foreground text-background px-6 py-3 font-semibold text-sm hover:opacity-90 transition-opacity">
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item, i) => (
                  <div key={item.registration_id} className="relative">
                    <EventCard event={item.event} index={i} />
                    <div className="absolute top-4 right-4 bg-green-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                      Registered
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="mt-0 outline-none">
            {savedLoading ? (
              <GridSkeleton count={3} />
            ) : savedEvents.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-16 text-center shadow-sm">
                <Bookmark size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="font-display text-2xl font-bold">Your wishlist is empty</p>
                <p className="text-muted-foreground mt-2">
                  Find events you love and bookmark them to keep them here.
                </p>
                <Link href="/" className="mt-6 inline-flex rounded-xl bg-foreground text-background px-6 py-3 font-semibold text-sm hover:opacity-90 transition-opacity">
                  Discover Events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedEvents.map((ev, i) => (
                  <EventCard key={ev.id} event={ev} index={i} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
