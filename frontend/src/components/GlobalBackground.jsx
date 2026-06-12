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
      
      {/* Premium Fading Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_60%,transparent_100%)] dark:opacity-50 opacity-100" />

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
