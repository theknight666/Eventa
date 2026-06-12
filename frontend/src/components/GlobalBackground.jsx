import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

export default function GlobalBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const maskImage = useMotionTemplate`radial-gradient(180px circle at ${smoothX}px ${smoothY}px, black, transparent 100%)`;

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
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.25] mix-blend-overlay" />
      
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ WebkitMaskImage: maskImage, maskImage: maskImage }}
      >
        <svg width="100%" height="100%" className="absolute inset-0 opacity-100">
          <defs>
            <pattern id="flower-mandala" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <g transform="translate(60, 60)">
                <circle cx="0" cy="0" r="3" fill="currentColor" opacity="0.8" />
                
                {/* Inner Petals */}
                {[...Array(8)].map((_, i) => (
                  <g key={`inner-${i}`} transform={`rotate(${i * 45})`}>
                    <path d="M 0 -3 Q 15 -20 0 -30 Q -15 -20 0 -3 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
                  </g>
                ))}

                {/* Outer Petals */}
                {[...Array(12)].map((_, i) => (
                  <g key={`outer-${i}`} transform={`rotate(${i * 30})`}>
                    <path d="M 0 -20 Q 25 -40 0 -55 Q -25 -40 0 -20 Z" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
                    <path d="M 0 -55 L 4 -60 L 0 -65 L -4 -60 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
                  </g>
                ))}

                {/* Concentric Rings */}
                <circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
                <circle cx="0" cy="0" r="55" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 6" opacity="0.4" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#flower-mandala)" className="text-amber-500" />
        </svg>

        {/* Visibility fixed exactly at 10% (opacity-10) */}
        <div className="absolute inset-0 bg-amber-400 opacity-10 mix-blend-screen" />
      </motion.div>
    </div>
  );
}
