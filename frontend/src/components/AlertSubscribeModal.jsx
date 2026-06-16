import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { Bell, MapPin, Tag, Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { subscribeAlerts } from "@/lib/api";

const CITIES = [
  "Bangalore", "Mumbai", "Delhi NCR", "Pune", "Hyderabad", "Chennai"
];

const CATEGORIES = [
  "Technology", "Startup", "AI", "Design", "Marketing", "Finance", "Web3", "Healthcare"
];

const inputCls = "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50 transition-colors";

export default function AlertSubscribeModal({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleCity = (city) => {
    setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleNext = () => {
    if (step === 1 && !email) {
      toast.error("Please enter your email");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      await subscribeAlerts({
        email,
        cities: selectedCities,
        categories: selectedCategories,
        keywords: keywordList
      });
      setSuccess(true);
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setStep(1);
      setEmail("");
      setSelectedCities([]);
      setSelectedCategories([]);
      setKeywords("");
      setSuccess(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-3xl overflow-hidden p-0 border-border">
        {success ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">You're Subscribed!</h2>
            <p className="text-muted-foreground mb-8">
              We'll notify you at <b>{email}</b> as soon as we discover new events matching your preferences.
            </p>
            <button 
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-[400px]">
            <div className="p-6 pb-2 shrink-0 border-b border-border/50 bg-muted/20">
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Bell className="text-blue-500" size={20} /> Smart Event Alerts
                </DialogTitle>
              </DialogHeader>
              <div className="flex gap-2 mt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-blue-500' : 'bg-border'}`} />
                ))}
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Where should we send alerts?</h3>
                    <p className="text-sm text-muted-foreground">Enter your email to get notified of new events.</p>
                  </div>
                  <div>
                    <label className="label-eyebrow text-muted-foreground mb-1.5 block">Email Address</label>
                    <input 
                      type="email" 
                      className={inputCls} 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="you@email.com" 
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Select your cities</h3>
                    <p className="text-sm text-muted-foreground">Which locations are you interested in?</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map(city => (
                      <button
                        key={city}
                        onClick={() => toggleCity(city)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors flex items-center gap-1.5 ${selectedCities.includes(city) ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-border bg-card hover:border-foreground/30'}`}
                      >
                        <MapPin size={14} /> {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Select interests</h3>
                    <p className="text-sm text-muted-foreground">Choose categories or add specific keywords.</p>
                  </div>
                  
                  <div>
                    <label className="label-eyebrow text-muted-foreground mb-2 block">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${selectedCategories.includes(cat) ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-border bg-card hover:border-foreground/30'}`}
                        >
                          <Tag size={12} /> {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label-eyebrow text-muted-foreground mb-1.5 block flex items-center gap-1">
                      <Search size={14} /> Keywords (Optional)
                    </label>
                    <input 
                      type="text" 
                      className={inputCls} 
                      value={keywords} 
                      onChange={(e) => setKeywords(e.target.value)} 
                      placeholder="e.g. hackathon, founder, python" 
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Comma separated list of keywords.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-2 shrink-0 flex items-center gap-3">
              {step > 1 && (
                <button 
                  onClick={handleBack}
                  className="px-5 py-3.5 rounded-2xl border border-border font-semibold hover:bg-muted transition-colors"
                >
                  Back
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  onClick={handleNext}
                  className="flex-1 py-3.5 rounded-2xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Turn on Alerts"} <Bell size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
