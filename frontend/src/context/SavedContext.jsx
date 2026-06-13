import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { getAttendeeSaved, toggleAttendeeSaved } from "@/lib/api";

const SavedContext = createContext({ saved: [], toggle: () => {}, isSaved: () => false });
const KEY = "eventa_saved";

export const SavedProvider = ({ children }) => {
  const { user } = useUser();
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse((typeof window !== 'undefined' ? localStorage.getItem : () => null)(KEY)) || [];
    } catch {
      return [];
    }
  });

  // Sync from backend when user logs in
  useEffect(() => {
    if (user) {
      getAttendeeSaved(user.email).then((data) => {
        if (data.saved) {
          setSaved(data.saved);
          if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(data.saved));
        }
      }).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(saved));
  }, [saved]);

  const toggle = async (id) => {
    const isCurrentlySaved = saved.includes(id);
    const newSaved = isCurrentlySaved ? saved.filter((x) => x !== id) : [...saved, id];
    setSaved(newSaved);
    
    if (user) {
      try {
        await toggleAttendeeSaved(user.email, { event_id: id, save: !isCurrentlySaved });
      } catch (err) {
        console.error("Failed to sync saved event to backend", err);
      }
    }
  };

  const isSaved = (id) => saved.includes(id);

  return (
    <SavedContext.Provider value={{ saved, toggle, isSaved }}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => useContext(SavedContext);
