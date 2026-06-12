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
    if (!("geolocation" in navigator)) {
      setLocationStatus("error");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding using Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (!res.ok) throw new Error("Failed to reverse geocode");
          
          const data = await res.json();
          // Try to get a city name from the address
          let detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            data.address?.county ||
            "Mumbai"; // Fallback to a major city if undefined

          // Clean up the city name if it has "District" or something similar
          if (detectedCity.toLowerCase().includes("district")) {
            detectedCity = detectedCity.replace(/district/i, "").trim();
          }

          setUserCity(detectedCity);
          setLocationStatus("found");

          // Fetch events for this city
          const d = await getEvents({ city: detectedCity, limit: 15 });
          setEvents(d.events);
        } catch (error) {
          console.error("Geocoding error:", error);
          setLocationStatus("error");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationStatus("denied");
        setLoading(false);
      },
      { timeout: 10000 }
    );
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
              Showing events in and around <span className="text-foreground">{userCity}</span>
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
