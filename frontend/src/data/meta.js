// Category visual metadata: gradient + lucide icon name
export const CATEGORY_META = {
  startup: { gradient: "from-orange-500 to-rose-500", icon: "Rocket" },
  business: { gradient: "from-slate-500 to-slate-700", icon: "Briefcase" },
  technology: { gradient: "from-blue-500 to-cyan-400", icon: "Cpu" },
  ai: { gradient: "from-violet-500 to-fuchsia-500", icon: "Sparkles" },
  finance: { gradient: "from-emerald-500 to-teal-500", icon: "TrendingUp" },
  marketing: { gradient: "from-pink-500 to-orange-400", icon: "Megaphone" },
  "import-export": { gradient: "from-sky-500 to-indigo-500", icon: "Ship" },
  manufacturing: { gradient: "from-zinc-500 to-stone-600", icon: "Factory" },
  "real-estate": { gradient: "from-amber-500 to-yellow-400", icon: "Building2" },
  healthcare: { gradient: "from-rose-500 to-red-400", icon: "HeartPulse" },
  education: { gradient: "from-indigo-500 to-blue-400", icon: "GraduationCap" },
  entertainment: { gradient: "from-purple-500 to-pink-500", icon: "Clapperboard" },
  sports: { gradient: "from-green-500 to-lime-400", icon: "Trophy" },
  government: { gradient: "from-slate-600 to-gray-700", icon: "Landmark" },
  networking: { gradient: "from-cyan-500 to-blue-500", icon: "Users" },
  ecommerce: { gradient: "from-fuchsia-500 to-purple-500", icon: "ShoppingBag" },
  sustainability: { gradient: "from-green-600 to-emerald-400", icon: "Leaf" },
  creator: { gradient: "from-red-500 to-orange-500", icon: "Video" },
  music: { gradient: "from-violet-600 to-indigo-500", icon: "Music" },
  hr: { gradient: "from-teal-500 to-cyan-500", icon: "UserPlus" },
  legal: { gradient: "from-stone-500 to-zinc-600", icon: "Scale" },
};

export const formatINR = (n) =>
  new Intl.NumberFormat("en-IN").format(n || 0);

export const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
};

export const formatDateLong = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400";
