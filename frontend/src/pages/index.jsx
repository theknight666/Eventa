import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import Hero from "@/components/Hero";
import FeaturedEvents from "@/components/FeaturedEvents";
import TrendingEvents from "@/components/TrendingEvents";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedCities from "@/components/FeaturedCities";
import SEO from "@/components/SEO";

// Lazy load below-the-fold components
const EventsNearYou = dynamic(() => import('@/components/EventsNearYou'), { ssr: false });
const CuratedEvents = dynamic(() => import('@/components/CuratedEvents'), { ssr: false });
const Discover = dynamic(() => import('@/components/Discover'), { ssr: false });
const AIRecommendations = dynamic(() => import('@/components/AIRecommendations'), { ssr: false });

const DEFAULT_FILTERS = {
  q: "",
  category: null,
  city: null,
  event_type: null,
  pricing: null,
  size: null,
  date_filter: null,
  sort: "date",
};

export default function Home({ initialStats, initialCategories, initialCities, initialFeatured, initialTrending }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const scrollToDiscover = () => {
    setTimeout(() => {
      document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  };

  const onSearch = (q) => {
    setFilters((f) => ({ ...f, q }));
    scrollToDiscover();
  };
  const onCategory = (cat) => {
    setFilters((f) => ({ ...f, category: cat }));
    scrollToDiscover();
  };
  const onCity = (city) => {
    setFilters((f) => ({ ...f, city }));
    scrollToDiscover();
  };

  return (
    <main>
      <SEO 
        title="Premium Event Discovery" 
        description="Discover exclusive and premium events happening near you. Find the best nightlife, concerts, business summits, and curated experiences with Eventa."
        url="https://eventa.in/"
        keywords="discover events India, tech events 2026, startup events near me, eventa events"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Eventa",
            "url": "https://eventa.in",
            "logo": "https://eventa.in/seo-planet.png"
          })}
        </script>
      </SEO>
      <Hero stats={initialStats} onSearch={onSearch} onCity={onCity} />
      <FeaturedEvents initialEvents={initialFeatured} />
      <TrendingEvents initialEvents={initialTrending} />
      <EventsNearYou />
      <CuratedEvents />
      <CategoryGrid categories={initialCategories} active={filters.category} onSelect={onCategory} />
      <FeaturedCities cities={initialCities} active={filters.city} onSelect={onCity} />
      <Discover filters={filters} setFilters={setFilters} categories={initialCategories} cities={initialCities} />
      <AIRecommendations />
    </main>
  );
}

export async function getStaticProps() {
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
  
  try {
    const [statsRes, catRes, citiesRes, featuredRes, trendingRes] = await Promise.all([
      fetch(`${baseURL}/api/overview`),
      fetch(`${baseURL}/api/categories`),
      fetch(`${baseURL}/api/cities`),
      fetch(`${baseURL}/api/events?featured=true`),
      fetch(`${baseURL}/api/events?trending=true`)
    ]);
    
    const [stats, categories, cities, featured, trending] = await Promise.all([
      statsRes.ok ? statsRes.json() : null,
      catRes.ok ? catRes.json() : [],
      citiesRes.ok ? citiesRes.json() : [],
      featuredRes.ok ? featuredRes.json() : { events: [] },
      trendingRes.ok ? trendingRes.json() : { events: [] }
    ]);
    
    return {
      props: {
        initialStats: stats,
        initialCategories: categories,
        initialCities: cities,
        initialFeatured: featured.events || [],
        initialTrending: trending.events || []
      },
      revalidate: 60
    };
  } catch (error) {
    console.error("ISR build error:", error);
    return {
      props: {
        initialStats: null,
        initialCategories: [],
        initialCities: [],
        initialFeatured: [],
        initialTrending: []
      },
      revalidate: 60
    };
  }
}
