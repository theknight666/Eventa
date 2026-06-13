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
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-slate-50 dark:bg-[#050505] transition-colors duration-500">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] dark:opacity-[0.25] mix-blend-multiply dark:mix-blend-overlay" />
      
      {/* 30% Visibility applied to the entire masked layer */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.15] dark:opacity-30 transform-gpu will-change-transform"
        style={{ WebkitMaskImage: maskImage, maskImage: maskImage }}
      >
        {/* text-amber-600/500 ensures deeply amber lines on both modes */}
        <svg width="100%" height="100%" className="absolute inset-0 text-amber-600 dark:text-amber-500">
          <defs>
            <pattern id="flower-mandala" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <g transform="translate(60, 60)">
                <circle cx="0" cy="0" r="3" fill="currentColor" opacity="0.8" />
                
                {/* Inner Petals (Clockwise Kaleidoscope Rotation) */}
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="20s" repeatCount="indefinite" />
                  {[...Array(8)].map((_, i) => (
                    <g key={`inner-${i}`} transform={`rotate(${i * 45})`}>
                      <path d="M 0 -3 Q 15 -20 0 -30 Q -15 -20 0 -3 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
                    </g>
                  ))}
                </g>

                {/* Outer Petals (Counter-Clockwise Kaleidoscope Rotation) */}
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="30s" repeatCount="indefinite" />
                  {[...Array(12)].map((_, i) => (
                    <g key={`outer-${i}`} transform={`rotate(${i * 30})`}>
                      <path d="M 0 -20 Q 25 -40 0 -55 Q -25 -40 0 -20 Z" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
                      <path d="M 0 -55 L 4 -60 L 0 -65 L -4 -60 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
                    </g>
                  ))}
                </g>

                {/* Concentric Rings with Pulsing Scale */}
                <g>
                  <animateTransform attributeName="transform" type="scale" values="1;1.05;1" dur="10s" repeatCount="indefinite" />
                  <circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5">
                    <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="-360 0 0" dur="15s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="0" r="55" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 6" opacity="0.4">
                    <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="40s" repeatCount="indefinite" />
                  </circle>
                </g>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#flower-mandala)" />
        </svg>

        {/* Multiply for light mode (darkens), Screen for dark mode (lightens) */}
        <div className="absolute inset-0 bg-amber-500/50 mix-blend-multiply dark:mix-blend-screen" />
      </motion.div>
    </div>
  );
}
