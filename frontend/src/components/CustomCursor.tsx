import { useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';

export default function CustomCursor() {
  const [isActive, setIsActive] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.2 });

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (!isFinePointer || shouldReduceMotion) {
      setIsActive(false);
      document.body.classList.remove('custom-cursor-active');
      return undefined;
    }

    const interactiveSelector =
      'a, button, input, textarea, select, [role="button"], [data-cursor="hover"]';

    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setIsActive(true);

      const target = e.target as HTMLElement | null;
      setIsHovering(Boolean(target?.closest(interactiveSelector)));
    };

    const handleMouseLeave = () => {
      setIsActive(false);
      setIsHovering(false);
    };

    document.body.classList.add('custom-cursor-active');
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [shouldReduceMotion, x, y]);

  if (!isActive) {
    return null;
  }

  return (
    <motion.div className="custom-cursor" style={{ x: springX, y: springY }}>
      <motion.span
        className="custom-cursor__ring"
        animate={{ scale: isHovering ? 1.45 : 1, opacity: isHovering ? 0.45 : 0.2 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      />
      <motion.span
        className="custom-cursor__dot"
        animate={{ scale: isHovering ? 0.35 : 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      />
    </motion.div>
  );
}
