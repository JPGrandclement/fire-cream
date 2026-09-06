import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function ContextualCursor() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 25, stiffness: 300 });
  const springY = useSpring(y, { damping: 25, stiffness: 300 });
  const [label, setLabel] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = (e.target as HTMLElement).closest("[data-cursor]");
      setLabel(target ? target.getAttribute("data-cursor") : null);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (isTouch) return null;

  return (
    <motion.div
      className="cursor"
      style={{ x: springX, y: springY }}
      animate={{ scale: label ? 1.8 : 1 }}
      transition={{ duration: 0.2 }}
    >
      {label && <span>{label}</span>}
    </motion.div>
  );
}
