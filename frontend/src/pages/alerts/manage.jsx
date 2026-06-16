import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Bell, MapPin, Tag, Search, ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { getAlertPreferences, subscribeAlerts, unsubscribeAlerts } from "@/lib/api";

const CITIES = [
  "Bangalore", "Mumbai", "Delhi NCR", "Pune", "Hyderabad", "Chennai"
];

const CATEGORIES = [
  "Technology", "Startup", "AI", "Design", "Marketing", "Finance", "Web3", "Healthcare"
];

const inputCls = "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50 transition-colors";

export default function ManageAlerts() {
  const router = useRouter();
  const emailParam = router.query.email;
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [preferences, setPreferences] = useState(null);
  
  // Edit State
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      fetchPreferences(emailParam);
    }
  }, [emailParam]);

  const fetchPreferences = async (emailToFetch) => {
    if (!emailToFetch) return;
    setFetching(true);
    try {
      const data = await getAlertPreferences(emailToFetch);
      if (data.is_active) {
        setPreferences(data);
        setSelectedCities(data.cities || []);
        setSelectedCategories(data.categories || []);
        setKeywords(data.keywords?.join(", ") || "");
      } else {
        toast.info("This subscription is currently inactive.");
      }
    } catch (err) {
      toast.error("Subscription not found for this email.");
    } finally {
      setFetching(false);
    }
  };

  const handleFetch = (e) => {
    e.preventDefault();
    if (email) {
      fetchPreferences(email);
      // Update URL without reloading
      router.push(`/alerts/manage?email=${encodeURIComponent(email)}`, undefined, { shallow: true });
    }
  };

  const toggleCity = (city) => {
    setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      await subscribeAlerts({
        email,
        cities: selectedCities,
        categories: selectedCategories,
        keywords: keywordList
      });
      toast.success("Alert preferences updated!");
      setPreferences(prev => ({ ...prev, cities: selectedCities, categories: selectedCategories, keywords: keywordList }));
    } catch (error) {
      toast.error("Failed to update preferences.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (window.confirm("Are you sure you want to stop receiving event alerts?")) {
      setLoading(true);
      try {
        await unsubscribeAlerts(email);
        toast.success("Successfully unsubscribed from all alerts.");
        setPreferences(null);
      } catch (error) {
        toast.error("Failed to unsubscribe.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <SEO title="Manage Event Alerts | Eventa" />
      
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <h1 className="text-3xl font-display font-black tracking-tight flex items-center gap-3 mb-2">
        <Bell className="text-blue-500" /> Manage Event Alerts
      </h1>
      <p className="text-muted-foreground mb-8">Update your preferences or unsubscribe from Eventa alerts.</p>

      {!preferences ? (
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
          <form onSubmit={handleFetch} className="space-y-4">
            <div>
              <label className="label-eyebrow text-muted-foreground mb-1.5 block">Email Address</label>
              <input 
                type="email" 
                className={inputCls} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter the email you subscribed with..." 
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={fetching || !email}
              className="px-6 py-3 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {fetching ? "Searching..." : "Find Subscription"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={20} />
            <div>
              <div className="font-semibold text-sm">Active Subscription Found</div>
              <div className="text-xs opacity-80">{email}</div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><MapPin size={18} /> Cities</h3>
              <div className="flex flex-wrap gap-2">
                {CITIES.map(city => (
                  <button
                    key={city}
                    onClick={() => toggleCity(city)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${selectedCities.includes(city) ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-border hover:border-foreground/30'}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Tag size={18} /> Categories</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${selectedCategories.includes(cat) ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-border hover:border-foreground/30'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Search size={18} /> Keywords</h3>
              <input 
                type="text" 
                className={inputCls} 
                value={keywords} 
                onChange={(e) => setKeywords(e.target.value)} 
                placeholder="e.g. hackathon, founder, python" 
              />
              <p className="text-xs text-muted-foreground mt-1.5">Comma separated list of keywords.</p>
            </div>
            
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
              <button 
                onClick={handleUpdate}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Preferences"}
              </button>
              
              <button 
                onClick={handleUnsubscribe}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Unsubscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
