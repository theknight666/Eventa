import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

export default function GlobalBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Tighter, darker "flashlight" mask (less spread)
  const maskImage = useMotionTemplate`radial-gradient(250px circle at ${smoothX}px ${smoothY}px, black, transparent 100%)`;

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-[#050505] transition-colors duration-500">
      {/* Base Noise Texture for premium feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.25] mix-blend-overlay" />
      
      {/* Interactive Cursor Spotlight over Classical Indian Jaali Pattern */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ WebkitMaskImage: maskImage, maskImage: maskImage }}
      >
        <svg width="100%" height="100%" className="absolute inset-0 opacity-80">
          <defs>
            <pattern id="jaali" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              {/* Intricate Jaali (Classical Indian Lattice) Motif */}
              <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M20 20 Q 40 0 60 20 Q 80 40 60 60 Q 40 80 20 60 Q 0 40 20 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="40" cy="40" r="6" fill="currentColor" opacity="0.6" />
              {/* Corner embellishments */}
              <circle cx="0" cy="0" r="4" fill="currentColor" opacity="0.4" />
              <circle cx="80" cy="0" r="4" fill="currentColor" opacity="0.4" />
              <circle cx="0" cy="80" r="4" fill="currentColor" opacity="0.4" />
              <circle cx="80" cy="80" r="4" fill="currentColor" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#jaali)" className="text-amber-500" />
        </svg>

        {/* Tighter amber overlay inside the flashlight */}
        <div className="absolute inset-0 bg-amber-500/20 mix-blend-overlay" />
      </motion.div>
    </div>
  );
}
