import React from "react";
import { useOrganizer } from "../context/OrganizerContext";
import OrganizerLogin from "../components/organizer/OrganizerLogin";
import Dashboard from "../components/organizer/Dashboard";

export default function Organizer() {
  const { organizer } = useOrganizer();
  return organizer ? <Dashboard /> : <OrganizerLogin />;
}
