import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import TrendingEvents from "../components/TrendingEvents";
import EventsNearYou from "../components/EventsNearYou";
import CuratedEvents from "../components/CuratedEvents";
import CategoryGrid from "../components/CategoryGrid";
import FeaturedCities from "../components/FeaturedCities";
import AIRecommendations from "../components/AIRecommendations";
import Discover from "../components/Discover";
import { getStats, getCategories, getCities } from "../lib/api";

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

export default function Home() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    getStats().then(setStats);
    getCategories().then(setCategories);
    getCities().then(setCities);
  }, []);

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
      <Hero stats={stats} onSearch={onSearch} onCity={onCity} />
      <TrendingEvents />
      <EventsNearYou />
      <CuratedEvents />
      <CategoryGrid categories={categories} active={filters.category} onSelect={onCategory} />
      <FeaturedCities cities={cities} active={filters.city} onSelect={onCity} />
      <Discover filters={filters} setFilters={setFilters} categories={categories} cities={cities} />
      <AIRecommendations />
    </main>
  );
}
