import React from "react";
import { useOrganizer } from "../context/OrganizerContext";
import OrganizerLogin from "../components/organizer/OrganizerLogin";
import Dashboard from "../components/organizer/Dashboard";
import SEO from "../components/SEO";

export default function Organizer() {
  const { organizer } = useOrganizer();
  return (
    <>
      <SEO 
        title="Organizer Portal" 
        description="Manage your events, view analytics, and track attendees with the Eventa Organizer Portal."
        url="https://eventa.in/organizer"
      />
      {organizer ? <Dashboard /> : <OrganizerLogin />}
    </>
  );
}
