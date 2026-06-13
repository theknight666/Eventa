import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const OrganizerContext = createContext({ organizer: null, login: () => {}, logout: () => {}, update: () => {} });
const KEY = "eventa_organizer";

export const OrganizerProvider = ({ children }) => {
  const [organizer, setOrganizer] = useState(() => {
    try {
      return JSON.parse((typeof window !== 'undefined' ? localStorage.getItem.bind(localStorage) : () => null)(KEY)) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (organizer) if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(organizer));
    else if (typeof window !== 'undefined') localStorage.removeItem(KEY);
  }, [organizer]);

  const login = (org) => {
    if (org.token) {
      if (typeof window !== 'undefined') localStorage.setItem("eventa_organizer_token", org.token);
      delete org.token;
    }
    setOrganizer(org);
  };
  const logout = () => {
    setOrganizer(null);
    if (typeof window !== 'undefined') localStorage.removeItem("eventa_organizer_token");
    toast.success("Successfully logged out");
  };
  const update = (patch) => setOrganizer((o) => (o ? { ...o, ...patch } : o));

  return (
    <OrganizerContext.Provider value={{ organizer, login, logout, update }}>
      {children}
    </OrganizerContext.Provider>
  );
};

export const useOrganizer = () => useContext(OrganizerContext);
