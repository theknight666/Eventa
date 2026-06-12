import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate, useScroll, useTransform } from "framer-motion";

export default function GlobalBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const { scrollY } = useScroll();
  // Makes the background pattern move slightly as the user scrolls
  const bgPosY = useTransform(scrollY, (y) => `${-y * 0.8}px`);

  // Larger, softer "flashlight" mask
  const maskImage = useMotionTemplate`radial-gradient(500px circle at ${smoothX}px ${smoothY}px, black, transparent 100%)`;

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-[#070707] transition-colors duration-500">
      {/* Base Noise Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.25] mix-blend-overlay" />
      
      {/* Interactive Cursor Spotlight over Pattern */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center opacity-100"
        style={{ WebkitMaskImage: maskImage, maskImage: maskImage }}
      >
        {/* User's Damask / Floral Repeating Pattern */}
        <motion.div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: "url('/damask-pattern.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "600px",
            backgroundPositionY: bgPosY,
            backgroundPositionX: "0px",
            opacity: 0.6
          }}
        />

        {/* Lighter Ambient Hover Glow */}
        <div className="absolute inset-0 bg-amber-200/20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-amber-400/10 mix-blend-screen" />
      </motion.div>

      {/* Ambient Drifting Orbs */}
      <motion.div 
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-amber-500/5 rounded-full blur-[150px]"
      />
      <motion.div 
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 100, -50, 0],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[60%] -right-[10%] w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[150px]"
      />
    </div>
  );
}
