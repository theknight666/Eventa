import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function GlobalBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Offset by half the size of the orb to center it on cursor
      mouseX.set(e.clientX - 300);
      mouseY.set(e.clientY - 300);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-white dark:bg-zinc-950 transition-colors duration-500">
      {/* Base Noise Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] dark:opacity-[0.25] mix-blend-overlay" />
      
      {/* Rotating Mandala Art */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] dark:opacity-20 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
          width="1000" height="1000" viewBox="0 0 800 800"
          className="stroke-amber-700 dark:stroke-amber-400 fill-none"
        >
          <circle cx="400" cy="400" r="380" strokeWidth="1" strokeDasharray="10 15" />
          <circle cx="400" cy="400" r="360" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="280" strokeWidth="2" strokeDasharray="4 12" />
          <circle cx="400" cy="400" r="140" strokeWidth="1.5" />
          
          {[...Array(24)].map((_, i) => (
            <g key={i} transform={`rotate(${i * 15} 400 400)`}>
              {/* Petals / Geometric shapes */}
              <path d="M400 120 Q 440 260 400 400 Q 360 260 400 120 Z" strokeWidth="0.75" />
              <path d="M400 40 L 415 100 L 400 120 L 385 100 Z" strokeWidth="1" />
              <circle cx="400" cy="260" r="80" strokeWidth="0.5" strokeDasharray="3 6" />
            </g>
          ))}
          
          {[...Array(12)].map((_, i) => (
            <g key={`inner-${i}`} transform={`rotate(${i * 30} 400 400)`}>
              <path d="M400 260 Q 430 330 400 400 Q 370 330 400 260 Z" strokeWidth="1" />
              <circle cx="400" cy="260" r="10" strokeWidth="2" />
            </g>
          ))}
        </motion.svg>
      </div>

      {/* Interactive Cursor Glow */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-amber-500/20 dark:bg-amber-600/15 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen"
      />

      {/* Ambient Drifting Orbs */}
      <motion.div 
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-orange-400/10 dark:bg-orange-600/10 rounded-full blur-[150px]"
      />
      <motion.div 
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 100, -50, 0],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[60%] -right-[10%] w-[800px] h-[800px] bg-amber-300/10 dark:bg-amber-700/10 rounded-full blur-[150px]"
      />
    </div>
  );
}
