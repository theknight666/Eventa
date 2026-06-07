import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Search, Building2, User, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useSaved } from "../context/SavedContext";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";
import LoginDialog from "./LoginDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LayoutDashboard, History, Settings } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { saved } = useSaved();
  const { user, login, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("login") === "true") {
      setLoginOpen(true);
      searchParams.delete("login");
      const newUrl = location.pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      navigate(newUrl, { replace: true });
    }
  }, [location.search, navigate, location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (e, id) => {
    if (location.pathname !== "/") {
      return; // Let standard anchor behavior handle navigation to home
    }
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
          <Link
            to="/"
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
            <Link data-testid="nav-organizer" to="/organizer" className="hover:text-foreground transition-colors">
              For Organizers
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              data-testid="navbar-search-btn"
              onClick={(e) => scrollToSection(e, "discover")}
              aria-label="Search"
              className="h-10 w-10 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Search size={18} />
            </button>
            
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
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    <span>History</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/saved")} className="cursor-pointer">
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Saved Events</span>
                    {saved.length > 0 && (
                      <span className="ml-auto bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {saved.length}
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="h-10 px-4 rounded-full glass flex items-center gap-2 text-sm font-semibold hover:scale-105 transition-transform"
              >
                Sign In
              </button>
            )}
            <Link
              data-testid="navbar-organizer-btn"
              to="/organizer"
              aria-label="Organizer portal"
              className="h-10 w-10 rounded-full glass md:hidden flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Building2 size={18} />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </motion.header>
  );
}
