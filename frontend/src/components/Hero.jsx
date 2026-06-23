import React, { useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Search, MapPin, Sparkles, ScanLine, Ticket as TicketIcon, Navigation, Loader2, Bell } from "lucide-react";
import AlertSubscribeModal from "./AlertSubscribeModal";
import { toast } from "sonner";
import Counter from "./Counter";
import { useRef } from "react";

const HERO_VIDEO =
  "https://assets.codepen.io/3364143/7btrrd.mp4";

const ease = [0.22, 1, 0.36, 1];

const TicketFront = ({ 
  opacity = 1,
  title1 = "Eventa",
  title2 = "All-Access",
  subtitle = "Valid for 2026 Season",
  holder = "VIP Guest",
  price = "Priceless",
  ticketType = "Admit One",
  bgGradient = "from-foreground/5 to-transparent",
  color1 = "bg-indigo-500/30",
  color2 = "bg-emerald-500/30",
  priceColor = "text-emerald-500",
  textColor = "text-white",
  subtitleColor = "text-white/70",
  blurClass = "backdrop-blur-md",
  isVip = false
}) => (
  <div 
    className={`absolute inset-0 rounded-[2.5rem] border ${isVip ? "border-amber-500/50 shadow-[0_30px_60px_rgba(245,158,11,0.3)]" : "border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.6)]"} bg-gradient-to-br ${bgGradient} ${blurClass} p-8 flex flex-col justify-between overflow-hidden`}
    style={{ 
      opacity,
      backfaceVisibility: "hidden",
      WebkitMaskImage: "radial-gradient(circle 14px at 0% 80%, transparent 14px, black 14.5px), radial-gradient(circle 14px at 100% 80%, transparent 14px, black 14.5px)",
      WebkitMaskComposite: "source-in",
      maskImage: "radial-gradient(circle 14px at 0% 80%, transparent 14px, black 14.5px), radial-gradient(circle 14px at 100% 80%, transparent 14px, black 14.5px)",
      maskComposite: "intersect"
    }}
  >
     <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-12 -mt-12 transition-opacity duration-500 group-hover:opacity-100 opacity-80 ${color1}`} />
     <div className={`absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl -ml-12 -mb-12 transition-opacity duration-500 group-hover:opacity-100 opacity-80 ${color2}`} />
     
     {isVip && (
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent opacity-60 mix-blend-overlay pointer-events-none" />
     )}
     {isVip && (
       <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-100/10 to-transparent pointer-events-none skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
     )}

     <div className="relative z-10">
       <div className="flex justify-between items-start mb-8">
         <div className={`h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-md border ${isVip ? "bg-amber-500/20 border-amber-500/50" : "bg-white/20 border-white/30"}`}>
           <TicketIcon size={18} className={isVip ? "text-amber-400" : "text-white"} />
         </div>
         <span className={`px-3 py-1.5 rounded-full text-[0.65rem] font-extrabold uppercase tracking-widest backdrop-blur-md border ${isVip ? "bg-amber-500/20 text-amber-100 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-white/20 text-white border-white/30"}`}>{ticketType}</span>
       </div>
       <div className={`font-display font-extrabold text-4xl leading-[1.1] tracking-tight ${isVip ? "bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-transparent bg-clip-text drop-shadow-sm" : textColor}`}>
         {title1}<br/>{title2}
       </div>
       <div className={`mt-3 text-xs font-semibold uppercase tracking-widest ${subtitleColor}`}>{subtitle}</div>
     </div>

     <div className="relative z-10">
        <div className="w-full h-[1px] my-6 relative flex items-center justify-between">
          <div className="absolute left-0 right-0 border-t-2 border-dashed border-white/30" />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className={`text-[0.65rem] font-bold uppercase tracking-widest mb-1.5 ${subtitleColor}`}>Ticket Holder</div>
            <div className={`font-display font-semibold text-lg ${textColor}`}>{holder}</div>
          </div>
          <div className="text-right">
            <div className={`text-[0.65rem] font-bold uppercase tracking-widest mb-1.5 ${subtitleColor}`}>Price</div>
            <div className={`font-display font-bold text-xl ${priceColor}`}>{price}</div>
          </div>
        </div>
     </div>
  </div>
);

function Ticket3D() {
  const ref = useRef(null);
  const [flipped, setFlipped] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
  const mouseXSpringBg1 = useSpring(x, { stiffness: 90, damping: 20 });
  const mouseYSpringBg1 = useSpring(y, { stiffness: 90, damping: 20 });
  const mouseXSpringBg2 = useSpring(x, { stiffness: 60, damping: 25 });
  const mouseYSpringBg2 = useSpring(y, { stiffness: 60, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateYBase = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);
  const rotateXBg1 = useTransform(mouseYSpringBg1, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateYBaseBg1 = useTransform(mouseXSpringBg1, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);
  const rotateXBg2 = useTransform(mouseYSpringBg2, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateYBaseBg2 = useTransform(mouseXSpringBg2, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[360px] aspect-[1/1.5] perspective-[1200px]" style={{ perspective: 1200, transform: "scale(0.76)" }}>
      {/* Background Ticket 2 (Further back, falling left) */}
      <motion.div
        initial={{ z: -40, rotateZ: -30 }}
        whileHover={{ z: -10, rotateZ: -50 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          rotateX: rotateXBg2,
          rotateY: rotateYBaseBg2,
          transformStyle: "preserve-3d",
          transformOrigin: "bottom center",
        }}
        className="absolute inset-0 w-full h-full cursor-pointer pointer-events-auto"
      >
        <TicketFront 
          title1="Eventa"
          title2="Early Bird"
          holder="General"
          price="₹499"
          bgGradient="from-rose-600 to-rose-800 dark:from-rose-500/20 dark:to-rose-500/5"
          color1="bg-rose-400 dark:bg-rose-500/40"
          color2="bg-rose-500 dark:bg-rose-600/40"
          priceColor="text-rose-100 dark:text-rose-500"
          textColor="text-white dark:text-foreground"
          subtitleColor="text-rose-200 dark:text-muted-foreground"
          blurClass="dark:backdrop-blur-2xl"
        />
      </motion.div>

      {/* Background Ticket 1 (Middle, falling left) */}
      <motion.div
        initial={{ z: -20, rotateZ: -15 }}
        whileHover={{ z: 0, rotateZ: -30 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          rotateX: rotateXBg1,
          rotateY: rotateYBaseBg1,
          transformStyle: "preserve-3d",
          transformOrigin: "bottom center",
        }}
        className="absolute inset-0 w-full h-full cursor-pointer pointer-events-auto"
      >
        <TicketFront 
          title1="Eventa"
          title2="Standard"
          holder="General"
          price="₹999"
          bgGradient="from-cyan-600 to-cyan-800 dark:from-cyan-400/30 dark:to-cyan-500/10"
          color1="bg-cyan-400 dark:bg-cyan-400/40"
          color2="bg-cyan-500 dark:bg-cyan-500/40"
          priceColor="text-cyan-100 dark:text-cyan-400"
          textColor="text-white dark:text-foreground"
          subtitleColor="text-cyan-200 dark:text-muted-foreground"
          blurClass="dark:backdrop-blur-2xl"
        />
      </motion.div>

      {/* Main Ticket */}
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setFlipped(!flipped)}
        style={{
          rotateX,
          rotateY: rotateYBase,
          transformStyle: "preserve-3d",
          transformOrigin: "bottom center",
        }}
        className="w-full h-full relative cursor-pointer group"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="w-full h-full relative"
        >
          {/* Front of Ticket */}
          <TicketFront 
            isVip={true} 
            color1="bg-amber-600 dark:bg-amber-500/40" 
            color2="bg-yellow-700 dark:bg-yellow-600/30" 
            bgGradient="bg-zinc-950 dark:bg-transparent dark:from-amber-500/10 dark:to-transparent dark:bg-gradient-to-br" 
            textColor="text-white dark:text-foreground"
            subtitleColor="text-zinc-400 dark:text-muted-foreground"
          />
          
          {/* Back of Ticket */}
          <div 
            className="absolute inset-0 rounded-[2.5rem] border border-amber-500/50 dark:border-amber-500/30 bg-zinc-950 dark:bg-transparent dark:bg-gradient-to-br dark:from-amber-500/10 dark:to-transparent dark:backdrop-blur-md p-8 flex flex-col justify-center items-center overflow-hidden shadow-[0_30px_60px_rgba(245,158,11,0.3)] dark:shadow-[0_30px_60px_rgba(245,158,11,0.25)]" 
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)",
              WebkitMaskImage: "radial-gradient(circle 14px at 0% 80%, transparent 14px, black 14.5px), radial-gradient(circle 14px at 100% 80%, transparent 14px, black 14.5px)",
              WebkitMaskComposite: "source-in",
              maskImage: "radial-gradient(circle 14px at 0% 80%, transparent 14px, black 14.5px), radial-gradient(circle 14px at 100% 80%, transparent 14px, black 14.5px)",
              maskComposite: "intersect"
            }}
          >
             <div className="absolute top-0 right-0 w-40 h-40 bg-amber-600 dark:bg-amber-500/40 rounded-full blur-3xl -mr-12 -mt-12 transition-opacity duration-500 group-hover:opacity-100 opacity-80 dark:opacity-60" />
             <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-700 dark:bg-yellow-600/30 rounded-full blur-3xl -ml-12 -mb-12 transition-opacity duration-500 group-hover:opacity-100 opacity-80 dark:opacity-60" />
             
             <div className="relative z-10 w-full max-w-[200px] aspect-square bg-white rounded-2xl p-4 flex items-center justify-center shadow-inner">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EVENTA-VIP-PASS-2026&margin=0" 
                  alt="VIP QR Code" 
                  className="w-full h-full object-contain mix-blend-multiply"
                />
             </div>
             <div className="relative z-10 mt-8 text-center space-y-2">
               <div className="font-display text-white dark:text-foreground font-extrabold tracking-tracking-widest text-lg">SCAN FOR MAGIC</div>
               <div className="text-zinc-400 dark:text-muted-foreground text-xs font-semibold uppercase tracking-widest">eventa.in/vip</div>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const HeroBackground = React.memo(({ y, scale, overlayOpacity }) => {
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = () => {
      if (video.paused) {
        video.play().catch(e => console.log("Video play failed:", e));
      }
    };

    attemptPlay();
    
    // Force play if browser tries to pause it out of nowhere
    video.addEventListener('pause', attemptPlay);
    video.addEventListener('suspend', attemptPlay);

    return () => {
      video.removeEventListener('pause', attemptPlay);
      video.removeEventListener('suspend', attemptPlay);
    };
  }, []);

  return (
    <>
      <div className="absolute inset-0 bg-background -z-10" />
      <motion.div style={{ y, scale }} className="absolute inset-0 overflow-hidden pointer-events-none">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline 
          disablePictureInPicture
          preload="auto"
          className="h-full w-full object-cover opacity-100"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
      </motion.div>
      <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40 pointer-events-none" />
      <div className="absolute inset-0 aurora opacity-50" />
    </>
  );
});

export default function Hero({ stats, onSearch, onCity }) {
  const [q, setQ] = useState("");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 140]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.12]);
  const overlayOpacity = useTransform(scrollY, [0, 500], [0.3, 0.85]);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) onSearch?.(q);
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const data = await res.json();
          let city = data.address.city || data.address.town || data.address.village || data.address.state_district;
          if (city) {
            if (city.toLowerCase().includes("district")) {
              city = city.replace(/district/i, "").trim();
            }
            const cityAliases = {
              "delhi": "New Delhi",
              "new delhi": "New Delhi",
              "bangalore": "Bengaluru",
              "bengaluru": "Bengaluru",
              "gurgaon": "Gurugram",
              "gurugram": "Gurugram",
              "bombay": "Mumbai",
              "mumbai": "Mumbai",
              "madras": "Chennai",
              "chennai": "Chennai",
              "calcutta": "Kolkata",
              "kolkata": "Kolkata",
              "poona": "Pune",
              "pune": "Pune",
            };
            const normalizedCity = cityAliases[city.toLowerCase()] || city;

            toast.success(`Location found: ${normalizedCity}`);
            onCity?.(normalizedCity);
          } else {
            toast.error("Could not determine your city");
          }
        } catch (error) {
          toast.error("Failed to reverse geocode location");
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        toast.error("Could not get your location. Please enable permissions.");
        setLoadingLocation(false);
      }
    );
  };

  const counters = [
    { label: "Total Events", value: stats?.total_events || 0 },
    { label: "Cities Covered", value: stats?.cities_covered || 0 },
    { label: "Registered Attendees", value: stats?.registered_attendees || 0, compact: true },
    { label: "Active Organizers", value: stats?.active_organizers || 0 },
  ];

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden" data-testid="hero">
      <HeroBackground y={y} scale={scale} overlayOpacity={overlayOpacity} />

      <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 pt-24 lg:pt-24 pb-4 lg:pb-4 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        
        {/* Left Column: Text & CTA */}
        <div className="flex-1 max-w-3xl w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 mb-7"
          >
            <Sparkles size={14} className="text-foreground" />
            <span className="label-eyebrow text-foreground/80">AI-powered event discovery · India</span>
          </motion.div>

          <h1 className="font-display font-extrabold tracking-tight text-balance text-3xl sm:text-5xl lg:text-6xl xl:text-[3.5rem] leading-[1] max-w-3xl">
            <span className="whitespace-nowrap">
              {"Discover India's Most".split(" ").map((w, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.25em]"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease, delay: 0.1 + i * 0.08 }}
                >
                  {w}
                </motion.span>
              ))}
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.5 }}
              className="inline-block bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent"
            >
              Important Events
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.6 }}
            className="mt-6 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
          >
            One intelligent home for every conference, summit, festival and meetup
            worth your time — across 8+ cities and 20+ industries.
          </motion.p>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.7 }}
            className="mt-8 max-w-xl w-full"
            data-testid="hero-search-form"
          >
            <div className="glass rounded-full p-1.5 flex flex-row items-center gap-2 shadow-xl shadow-black/10">
              <div className="flex items-center gap-2 flex-1 px-3 sm:px-4">
                <Search size={18} className="text-muted-foreground shrink-0" />
                <input
                  data-testid="hero-search-input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search events, cities…"
                  className="w-full bg-transparent py-2.5 outline-none placeholder:text-muted-foreground text-sm sm:text-base"
                />
              </div>
              <button
                type="submit"
                data-testid="hero-search-submit"
                className="shrink-0 rounded-full bg-foreground text-background px-4 sm:px-6 py-2 sm:py-2.5 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <MapPin size={15} className="hidden sm:block" /> Explore
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground px-2">
              <button 
                type="button" 
                onClick={handleLocationClick} 
                disabled={loadingLocation} 
                className="flex items-center gap-1.5 hover:text-foreground transition-colors disabled:opacity-50"
              >
                {loadingLocation ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} />}
                <span>Use current location</span>
              </button>
              <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
              <button 
                type="button" 
                onClick={() => setAlertsOpen(true)}
                className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 transition-colors"
              >
                <Bell size={15} />
                <span>Get Event Alerts</span>
              </button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden glass max-w-xl"
            data-testid="hero-counters"
          >
            {counters.map((c) => (
              <div key={c.label} className="px-5 py-6">
                <div className="font-display text-3xl font-extrabold tracking-tight">
                  <Counter to={c.value} compact={c.compact} />
                  {c.label === "Registered Attendees" && "+"}
                </div>
                <div className="mt-1.5 label-eyebrow text-muted-foreground text-[0.62rem]">
                  {c.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: 3D Ticket */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.3 }}
          className="hidden md:flex flex-1 w-full justify-center lg:justify-end -mt-16 lg:-mt-32"
        >
          <Ticket3D />
        </motion.div>

      </div>
      <AlertSubscribeModal open={alertsOpen} onOpenChange={setAlertsOpen} />
    </section>
  );
}
