import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getEvents, getCategories, getCities } from "@/lib/api";
import EventCard from "@/components/EventCard";
import SEO from "@/components/SEO";
import { Loader2 } from "lucide-react";

export default function BrowseEvents({ filter, events, type, displayName }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;
  }

  const title = type === "city" 
    ? `Top Events in ${displayName} | Eventa` 
    : `Top ${displayName} Events | Eventa`;

  const description = type === "city"
    ? `Discover the best upcoming events, conferences, and meetups in ${displayName}. Book your tickets now on Eventa.`
    : `Explore the top ${displayName} events happening near you. Discover, network, and grow with Eventa.`;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": events.map((ev, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": ev.title,
        "url": `https://eventa.in/event/${ev.slug || ev.id}`
      }
    }))
  };

  return (
    <main className="min-h-screen pt-24 pb-20 bg-background text-foreground">
      <SEO 
        title={title} 
        description={description} 
        url={`https://eventa.in/events/${filter}`}
        keywords={`${displayName} events, upcoming events ${displayName}, events in india`}
      >
        <script type="application/ld+json">
          {JSON.stringify(itemListSchema)}
        </script>
      </SEO>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-display font-black mb-8 capitalize">
          {type === "city" ? `Events in ${displayName}` : `${displayName} Events`}
        </h1>
        
        {events.length === 0 && router.isFallback ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-3xl">
            <h3 className="text-xl font-bold mb-2">No events found</h3>
            <p className="text-muted-foreground">We couldn't find any upcoming events for "{displayName}".</p>
          </div>
        )}
      </div>
    </main>
  );
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { filter: 'technology' } },
      { params: { filter: 'startup' } },
      { params: { filter: 'ai' } },
      { params: { filter: 'bangalore' } },
      { params: { filter: 'mumbai' } },
      { params: { filter: 'delhi' } }
    ],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const filter = params.filter;
  let events = [];
  let type = "events";
  let displayName = filter;

  try {
    const [cats, cityList] = await Promise.all([getCategories(), getCities()]);
    
    let queryParams = {};
    const filterLower = filter?.toLowerCase().replace(/-/g, " ");

    const isCity = cityList.some(c => c.name.toLowerCase() === filterLower);
    const isCat = cats.some(c => c.id.toLowerCase() === filterLower || c.name.toLowerCase() === filterLower);

    if (isCity) {
      type = "city";
      displayName = cityList.find(c => c.name.toLowerCase() === filterLower)?.name || filter;
      queryParams.city = filterLower;
    } else if (isCat) {
      type = "category";
      const catObj = cats.find(c => c.id.toLowerCase() === filterLower || c.name.toLowerCase() === filterLower);
      displayName = catObj?.name || filter;
      queryParams.category = catObj?.id || filter;
    } else {
      queryParams.q = filterLower;
    }

    const res = await getEvents({ ...queryParams, limit: 20 });
    events = res.events || [];
  } catch (e) {
    // Ignore data fetch failure in build
  }

  return {
    props: {
      filter,
      events,
      type,
      displayName
    },
    revalidate: 300,
  };
}
