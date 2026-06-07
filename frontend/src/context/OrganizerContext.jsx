import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const OrganizerContext = createContext({ organizer: null, login: () => {}, logout: () => {}, update: () => {} });
const KEY = "eventa_organizer";

export const OrganizerProvider = ({ children }) => {
  const [organizer, setOrganizer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (organizer) localStorage.setItem(KEY, JSON.stringify(organizer));
    else localStorage.removeItem(KEY);
  }, [organizer]);

  const login = (org) => setOrganizer(org);
  const logout = () => {
    setOrganizer(null);
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
