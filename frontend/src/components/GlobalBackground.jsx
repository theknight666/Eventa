import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

export default function GlobalBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Template for the "flashlight" mask
  const maskImage = useMotionTemplate`radial-gradient(350px circle at ${smoothX}px ${smoothY}px, black, transparent 100%)`;

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-[#0a0a0a] transition-colors duration-500">
      {/* Base Noise Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
      
      {/* Interactive Cursor Spotlight over Pattern */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center opacity-80"
        style={{ WebkitMaskImage: maskImage, maskImage: maskImage }}
      >
        {/* Damask / Floral Repeating Pattern */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "300px 300px",
            filter: "invert(0.5) sepia(1) saturate(5) hue-rotate(30deg) brightness(0.8)" // Creates a golden/amber hue on the pattern
          }}
        />

        {/* Ambient Hover Glow tied to the same spot */}
        <div className="absolute inset-0 bg-amber-600/30 mix-blend-screen" />
      </motion.div>

      {/* Ambient Drifting Orbs */}
      <motion.div 
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-orange-600/5 rounded-full blur-[150px]"
      />
      <motion.div 
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 100, -50, 0],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[60%] -right-[10%] w-[800px] h-[800px] bg-amber-700/5 rounded-full blur-[150px]"
      />
    </div>
  );
}
