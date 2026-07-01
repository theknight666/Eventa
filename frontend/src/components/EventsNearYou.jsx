import React, { useEffect, useState, useRef } from "react";
import { MapPin, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getEvents } from "@/lib/api";
import EventCard from "./EventCard";
import { GridSkeleton } from "./Skeletons";

export default function EventsNearYou({ selectedCity, userCoords }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState(null);
  const [userArea, setUserArea] = useState(null);
  const [locationStatus, setLocationStatus] = useState("detecting"); // detecting, found, denied, error
  const scroller = useRef(null);

  useEffect(() => {
    async function fetchLocationAndEvents() {
      try {
        if (selectedCity) {
          setLoading(true);
          setUserCity(selectedCity);
          setUserArea(null);
          setLocationStatus("found");
          
          const queryParams = { limit: 15 };
          if (userCoords) {
            queryParams.lat = userCoords.lat;
            queryParams.lng = userCoords.lng;
            queryParams.radius_km = 30;
          } else {
            queryParams.city = selectedCity;
          }
          
          const d = await getEvents(queryParams);
          setEvents(d.events || []);
          setLoading(false);
          return;
        }

        let latitude = null;
        let longitude = null;
        let detectedCity = "your area";
        let detectedArea = null;

        // Try precise geolocation first
        const getPreciseLocation = () => {
          return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error("Geolocation not supported"));
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (position) => resolve(position.coords),
              (err) => reject(err),
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
          });
        };

        const fetchPreciseDetails = async (lat, lon) => {
          try {
            const geocodeRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`);
            if (geocodeRes.ok) {
              const geoData = await geocodeRes.json();
              const area = geoData.address?.suburb || geoData.address?.neighbourhood || geoData.address?.town || null;
              const city = geoData.address?.city || geoData.address?.state_district || "your area";
              return { area, city };
            }
          } catch (e) {
            console.error("Reverse geocoding failed", e);
          }
          return { area: null, city: null };
        };

        try {
          const coords = await getPreciseLocation();
          latitude = coords.latitude;
          longitude = coords.longitude;
          
          const details = await fetchPreciseDetails(latitude, longitude);
          if (details.city) {
            detectedArea = details.area;
            detectedCity = details.city;
          }
        } catch (err) {
          console.log("Precise geolocation failed or denied, falling back to IP based location.", err);
          // Fallback to IP-based location
          const res = await fetch("https://ipapi.co/json/");
          if (res.ok) {
            const data = await res.json();
            latitude = data.latitude;
            longitude = data.longitude;
            
            const details = await fetchPreciseDetails(latitude, longitude);
            detectedArea = details.area;
            detectedCity = details.city || data.city || "your area";
          }
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
        const normalizedCity = cityAliases[detectedCity.toLowerCase()] || detectedCity;

        setUserCity(normalizedCity);
        setUserArea(detectedArea);
        setLocationStatus("found");

        const queryParams = { limit: 15 };
        if (latitude && longitude) {
            queryParams.lat = latitude;
            queryParams.lng = longitude;
            queryParams.radius_km = 30;
        } else {
            queryParams.city = normalizedCity;
        }
        
        const d = await getEvents(queryParams);
        
        setEvents(d.events || []);
      } catch (error) {
        console.error("Location or fetch error:", error);
        setLocationStatus("error");
      } finally {
        setLoading(false);
      }
    }

    fetchLocationAndEvents();
  }, [selectedCity]);

  const scroll = (dir) => {
    scroller.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (locationStatus === "denied" || locationStatus === "error") {
    return null; // Optionally, we could show a prompt "Enable location to see events near you"
  }

  return (
    <section id="events-near-you" className="mx-auto max-w-5xl px-4 sm:px-6 py-24" data-testid="near-you-section">
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
              Showing events in <span className="text-foreground">{userArea ? `${userArea}, ${userCity}` : userCity}</span>
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
          <p>{locationStatus === "detecting" ? "Detecting your location..." : "Fetching events..."}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass p-8 rounded-3xl text-center">
          <MapPin size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-2xl font-bold mb-2">No events found near you</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn't find any upcoming events in {userArea ? `${userArea}, ${userCity}` : userCity}. Check out the trending events instead or try searching in a different city.
          </p>
        </div>
      ) : (
        <div ref={scroller} className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
          {events.map((ev, i) => (
            <div key={ev.id} className="snap-start shrink-0 w-[80vw] sm:w-[220px]">
              <EventCard event={ev} index={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
