import React, { useEffect, useRef, useState } from "react";
import GlobeGl from "react-globe.gl";
import { useTheme } from "next-themes";

export default function Globe({ className }) {
  const globeEl = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { resolvedTheme } = useTheme();
  
  const isLightMode = resolvedTheme === "light";

  // Handle responsive sizing natively tracking the parent container
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      // Configure controls
      const controls = globeEl.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = false; // Disable zoom to prevent getting stuck
      
      // Center roughly on India
      globeEl.current.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 2 }, 1000);
    }
  }, [dimensions.width, dimensions.height]); // Re-center if recreated

  const gData = [
    { lat: 19.0760, lng: 72.8777, name: "Mumbai", size: 0.1, color: "#ffffff" },
    { lat: 28.6139, lng: 77.2090, name: "New Delhi", size: 0.1, color: "#ffffff" },
    { lat: 12.9716, lng: 77.5946, name: "Bengaluru", size: 0.1, color: "#ffffff" },
    { lat: 17.3850, lng: 78.4867, name: "Hyderabad", size: 0.08, color: "#ffffff" },
    { lat: 18.5204, lng: 73.8567, name: "Pune", size: 0.08, color: "#ffffff" },
    { lat: 13.0827, lng: 80.2707, name: "Chennai", size: 0.08, color: "#ffffff" },
    { lat: 23.0225, lng: 72.5714, name: "Ahmedabad", size: 0.08, color: "#ffffff" },
    { lat: 22.5726, lng: 88.3639, name: "Kolkata", size: 0.08, color: "#ffffff" },
  ];

  return (
    <div ref={containerRef} className={`w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing ${className || ""}`}>
      {dimensions.width > 0 && dimensions.height > 0 && (
        <GlobeGl
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="#ffffff"
          atmosphereAltitude={0.15}
          pointsData={gData}
          pointAltitude="size"
          pointColor="color"
          pointRadius={isLightMode ? 0.6 : 0.4}
          pointsMerge={false}
        />
      )}
    </div>
  );
}
