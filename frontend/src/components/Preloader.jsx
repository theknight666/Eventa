import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [done, setDone] = useState(true);

  useEffect(() => {
    // Only run the preloader once per session to avoid annoying users and Lighthouse
    const hasRun = sessionStorage.getItem("eventa_preloader");
    if (!hasRun) {
      setDone(false);
      const t = setTimeout(() => {
        setDone(true);
        sessionStorage.setItem("eventa_preloader", "true");
      }, 1000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          data-testid="preloader"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
        >
          <div className="absolute inset-0 aurora opacity-60" />
          <div className="relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight"
            >
              eventa
            </motion.div>
            <div className="mt-6 h-[2px] w-44 mx-auto overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full bg-foreground"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.4 }}
              className="mt-4 label-eyebrow text-muted-foreground"
            >
              Discovering India's events
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
