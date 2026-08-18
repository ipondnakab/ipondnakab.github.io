"use client";

import { Card } from "@nextui-org/react";
import { motion } from "framer-motion";
import React from "react";

// framer-motion wrapper around NextUI's Card. Entrance animations are applied to
// the Card element itself, so its own opacity/transform never disable its
// backdrop-blur. (An animating *ancestor* with opacity < 1 or a `filter` becomes
// a "backdrop root" and suppresses the frosted glass until the animation ends —
// which showed up as the blur appearing with a delay.)
//
// Card's full prop type is a huge union that makes `motion(Card)` blow past
// TypeScript's complexity budget (TS2590), so we collapse it to the few props we
// actually pass. The cast is types-only — the real Card is wrapped at runtime.
interface MotionCardBaseProps {
  isBlurred?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const MotionCard = motion(Card as unknown as React.FC<MotionCardBaseProps>);

export default MotionCard;
