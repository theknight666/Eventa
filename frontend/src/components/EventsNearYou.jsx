import React, { useEffect, useState, useRef } from "react";
import { MapPin, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getEvents } from "../lib/api";
import EventCard from "./EventCard";
import { GridSkeleton } from "./Skeletons";

export default function EventsNearYou() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState(null);
  const [locationStatus, setLocationStatus] = useState("detecting"); // detecting, found, denied, error
  const scroller = useRef(null);

  useEffect(() => {
    async function fetchLocationAndEvents() {
      try {
        // 1. Fetch IP-based location automatically
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("Failed to fetch IP location");
        
        const data = await res.json();
        const { latitude, longitude } = data;
        let detectedCity = data.city || "your area";

        // Map common aliases to backend city names for fallback
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
        const normalizedCity = cityAliases[detectedCity.toLowerCase()] || detectedCity;

        setUserCity(normalizedCity);
        setLocationStatus("found");

        // 2. Fetch events within a precise 50km radius using backend geo-search
        // Pass the normalized city as a fallback in case the backend geo-query fails
        const d = await getEvents({ 
          city: normalizedCity,
          lat: latitude, 
          lng: longitude, 
          radius_km: 50, 
          limit: 15 
        });
        
        setEvents(d.events || []);
      } catch (error) {
        console.error("Location or fetch error:", error);
        setLocationStatus("error");
      } finally {
        setLoading(false);
      }
    }

    fetchLocationAndEvents();
  }, []);

  const scroll = (dir) => {
    scroller.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (locationStatus === "denied" || locationStatus === "error") {
    return null; // Optionally, we could show a prompt "Enable location to see events near you"
  }

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-24" data-testid="near-you-section">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="label-eyebrow text-muted-foreground flex items-center gap-2">
            <MapPin size={14} className="text-primary" /> Location Features
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mt-3">
            Events Near You
          </h2>
          {userCity && (
            <p className="text-muted-foreground mt-2 font-medium">
              Showing events within 50km of <span className="text-foreground">{userCity}</span>
            </p>
          )}
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scroll(-1)} className="h-11 w-11 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50" disabled={loading || events.length === 0}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll(1)} className="h-11 w-11 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50" disabled={loading || events.length === 0}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading || locationStatus === "detecting" ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 size={32} className="animate-spin mb-4 text-primary" />
          <p>Detecting your location...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass p-8 rounded-3xl text-center">
          <MapPin size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-2xl font-bold mb-2">No events found near you</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn't find any upcoming events in {userCity}. Check out the trending events instead or try searching in a different city.
          </p>
        </div>
      ) : (
        <div ref={scroller} className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
          {events.map((ev, i) => (
            <div key={ev.id} className="snap-start shrink-0 w-[80vw] sm:w-[300px]">
              <EventCard event={ev} index={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
