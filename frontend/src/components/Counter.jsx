import React, { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

export default function Counter({ to = 0, duration = 2, suffix = "", compact = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {new Intl.NumberFormat(
        compact ? "en-US" : "en-IN", 
        compact ? { notation: "compact", maximumFractionDigits: 1 } : {}
      ).format(val)}
      {suffix}
    </span>
  );
}
