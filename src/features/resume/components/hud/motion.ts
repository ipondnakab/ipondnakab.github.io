import type { Variants } from "framer-motion";

// Cinematic ease — slow, organic, never bouncy.
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// A card slides + fades into place from an offset, then eases back out.
// NOTE: no CSS `filter` here — a `filter` left on a card's ancestor becomes a
// backdrop root and would disable the card's own `backdrop-blur` (frosted glass).
export const slideIn = (dx: number, dy: number, delay = 0): Variants => ({
  hidden: { opacity: 0, x: dx, y: dy },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.9, ease: EASE_OUT, delay },
  },
  exit: {
    opacity: 0,
    x: dx * 0.5,
    y: dy * 0.5,
    transition: { duration: 0.5, ease: "easeIn" },
  },
});

// Container that staggers its children in.
export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};
