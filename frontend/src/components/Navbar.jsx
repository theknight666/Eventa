import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Search, Building2, User, LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useSaved } from "@/context/SavedContext";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { getEvents } from "@/lib/api";
import LoginDialog from "./LoginDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LayoutDashboard, History, Settings } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { saved } = useSaved();
  const { user, logout } = useUser();
  const router = useRouter();

  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const handleLogoutConfirm = () => {
    logout();
    toast.success("You have successfully logged out.");
  };

  useEffect(() => {
    if (router.query.login === 'true') {
      setLoginOpen(true);
      const { login, ...rest } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    }
  }, [router.query, router.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener("open-login", handler);
    return () => window.removeEventListener("open-login", handler);
  }, []);

  // Search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await getEvents({ q: searchQuery, limit: 5 });
        setSearchResults(res.events || []);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (e, id) => {
    setMobileMenuOpen(false);
    if (router.pathname !== "/") return;
    e?.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div
        className={`mx-auto max-w-7xl mt-3 px-4 sm:px-6 transition-all duration-500 ${
          scrolled ? "scale-[0.99]" : ""
        }`}
      >
        <div
          className={`flex items-center justify-between rounded-2xl h-16 transition-all duration-500 ${
            scrolled ? "glass shadow-lg shadow-black/5 px-4 sm:px-5" : "px-0"
          }`}
        >
          <Link href="/"
            data-testid="navbar-logo"
            className="font-display text-2xl font-extrabold tracking-tight"
          >
            eventa<span className="text-muted-foreground">.in</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a data-testid="nav-discover" href="/#discover" onClick={(e) => scrollToSection(e, "discover")} className="hover:text-foreground transition-colors">
              Discover
            </a>
            <a data-testid="nav-categories" href="/#categories" onClick={(e) => scrollToSection(e, "categories")} className="hover:text-foreground transition-colors">
              Categories
            </a>
            <a data-testid="nav-cities" href="/#cities" onClick={(e) => scrollToSection(e, "cities")} className="hover:text-foreground transition-colors">
              Cities
            </a>
            <a data-testid="nav-ai" href="/#ai-picks" onClick={(e) => scrollToSection(e, "ai-picks")} className="hover:text-foreground transition-colors">
              AI Picks
            </a>
            <Link data-testid="nav-organizer" href="/organizer" className="hover:text-foreground transition-colors">
              For Organizers
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Search Bar */}
            <div className="relative hidden sm:block" ref={searchRef}>
              <div className={`relative flex items-center transition-all duration-300 ${searchQuery || isSearchFocused ? "w-48 sm:w-64" : "w-10"}`}>
                <button
                  className={`absolute left-0 h-10 w-10 flex items-center justify-center transition-transform z-10 ${searchQuery || isSearchFocused ? "text-muted-foreground" : "glass rounded-full text-foreground hover:scale-105"}`}
                  onClick={() => setIsSearchFocused(true)}
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className={`h-10 w-full rounded-full glass text-sm bg-transparent outline-none transition-all duration-300 ${searchQuery || isSearchFocused ? "pl-10 pr-4 border border-border/50 opacity-100" : "px-0 border-transparent opacity-0 cursor-pointer pointer-events-none"}`}
                />
              </div>

              <AnimatePresence>
                {(searchQuery || isSearchFocused) && searchQuery.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 sm:left-0 mt-2 w-72 sm:w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 max-h-[80vh] overflow-y-auto"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col py-2">
                        <div className="px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">Top Results</div>
                        {searchResults.map((ev) => (
                          <Link 
                            key={ev.id} 
                            href={`/event/${ev.slug || ev.id}`}
                            onClick={() => {
                              setSearchQuery("");
                              setIsSearchFocused(false);
                            }}
                            className="px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3"
                          >
                            <img src={ev.cover_image} onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87")} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-semibold truncate text-foreground leading-tight">{ev.title}</span>
                              <span className="text-xs text-muted-foreground truncate mt-0.5">{ev.city} • {new Date(ev.start_iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">No events found</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-10 w-10 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform overflow-hidden">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-transparent font-display font-bold text-lg">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    <span>History</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/saved")} className="cursor-pointer">
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Saved Events</span>
                    {saved.length > 0 && (
                      <span className="ml-auto bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {saved.length}
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLogoutOpen(true)} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="hidden sm:flex h-10 px-4 rounded-full glass items-center gap-2 text-sm font-semibold hover:scale-105 transition-transform"
              >
                Sign In
              </button>
            )}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <button
              className="h-10 w-10 rounded-full glass md:hidden flex items-center justify-center hover:scale-105 transition-transform"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
          >
            <div className="flex flex-col px-6 py-4 space-y-4 text-sm font-medium">
              <a href="/#discover" onClick={(e) => scrollToSection(e, "discover")} className="text-muted-foreground hover:text-foreground">Discover</a>
              <a href="/#categories" onClick={(e) => scrollToSection(e, "categories")} className="text-muted-foreground hover:text-foreground">Categories</a>
              <a href="/#cities" onClick={(e) => scrollToSection(e, "cities")} className="text-muted-foreground hover:text-foreground">Cities</a>
              <a href="/#ai-picks" onClick={(e) => scrollToSection(e, "ai-picks")} className="text-muted-foreground hover:text-foreground">AI Picks</a>
              <Link href="/organizer" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">For Organizers</Link>
              {!user && (
                <button 
                  onClick={() => { setMobileMenuOpen(false); setLoginOpen(true); }} 
                  className="text-left text-foreground font-bold hover:text-foreground/80 mt-2"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl font-bold">Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm} className="rounded-xl bg-red-500 text-white hover:bg-red-600 border-none">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.header>
  );
}
