import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      data-testid="theme-toggle"
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative h-10 w-10 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </motion.span>
    </button>
  );
}
