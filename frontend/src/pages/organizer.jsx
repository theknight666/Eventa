import React from "react";
import { useOrganizer } from "@/context/OrganizerContext";
import OrganizerLogin from "@/components/organizer/OrganizerLogin";
import Dashboard from "@/components/organizer/Dashboard";
import SEO from "@/components/SEO";

export default function Organizer() {
  const { organizer } = useOrganizer();
  return (
    <>
      <SEO 
        title={organizer ? `${organizer.name} Events & Community` : "Organizer Portal"}
        description={organizer ? (organizer.about || `Discover upcoming events by ${organizer.name} on Eventa.`) : "Manage your events, view analytics, and track attendees with the Eventa Organizer Portal."}
        url={organizer ? `https://eventa.in/org/${organizer.slug}` : "https://eventa.in/organizer"}
        image={organizer?.logo}
        keywords={organizer ? `${organizer.name}, ${organizer.name} events, buy tickets ${organizer.name}, upcoming events` : "organizer, event management, eventa"}
      />
      {organizer ? <Dashboard /> : <OrganizerLogin />}
    </>
  );
}
