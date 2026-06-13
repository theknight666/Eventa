import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();
const KEY = "eventa_user";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = (typeof window !== 'undefined' ? localStorage.getItem.bind(localStorage) : () => null)(KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(user));
    } else {
      if (typeof window !== 'undefined') localStorage.removeItem(KEY);
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
