"use client";

import { Avatar, Tooltip } from "@nextui-org/react";
import { motion, useReducedMotion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { PROFILE_AVATARS } from "@/features/profile/constants/profile-avatars";
import { trackEvent } from "@/shared/lib/analytics";

export interface ProfileAvatarProps {
  className?: string;
}

const TOTAL = PROFILE_AVATARS.length;
const SPIN_DURATION = 0.6;
const SPIN_EASE = [0.22, 1, 0.36, 1] as const;

// Only the two faces of the card are mounted, so the picture that spins into
// view has already been fetched and decoded — the reveal never flashes an
// empty circle. Hiding the back face keeps the outgoing picture from showing
// through mirrored during the second half of the turn.
const faceStyle: React.CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ className }) => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  // Total number of half-turns. It only ever grows — rotateY is `flips * 180`,
  // so the card keeps spinning the same way instead of unwinding back to 0.
  const [flips, setFlips] = useState(0);
  // Which picture sits on each face: [front, back]. The hidden face always
  // holds the *next* picture in the cycle, ready for the following click.
  const [faces, setFaces] = useState<[number, number]>([0, 1 % TOTAL]);
  // A face can only be re-dressed once it is out of sight, so a turn has to
  // finish before the next one starts — otherwise a fast second click would
  // spin the previous picture back in.
  const [isSpinning, setIsSpinning] = useState(false);

  const canSpin = TOTAL > 1;
  const visibleFace = flips % 2;
  const duration = prefersReducedMotion ? 0 : SPIN_DURATION;

  const onSpin = useCallback(() => {
    if (!canSpin || isSpinning) return;
    const nextIndex = faces[(flips + 1) % 2];
    trackEvent("profile_avatar_spin", {
      image: PROFILE_AVATARS[nextIndex].src,
      index: nextIndex,
    });
    setIsSpinning(true);
    setFlips((prev) => prev + 1);
  }, [canSpin, faces, flips, isSpinning]);

  // Load the follow-up picture onto the face that just turned away, now that
  // it is out of sight. Swapping any earlier would change the image mid-turn.
  const onSpinComplete = () => {
    if (flips === 0) return;
    const hiddenFace = (flips + 1) % 2;
    setFaces((prev) => {
      const next: [number, number] = [prev[0], prev[1]];
      next[hiddenFace] = (prev[flips % 2] + 1) % TOTAL;
      return next;
    });
    setIsSpinning(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onSpin();
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avatar = (
    <motion.button
      type="button"
      onClick={onSpin}
      aria-label={t("home.avatarAria")}
      whileTap={canSpin ? { scale: 0.94 } : undefined}
      className={`group relative rounded-full outline-none ring-offset-2 ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-primary ${
        canSpin ? "cursor-pointer hover:ring-2 hover:ring-primary" : ""
      } ${className ?? ""}`}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flips * 180 }}
        transition={{ duration, ease: SPIN_EASE }}
        onAnimationComplete={onSpinComplete}
      >
        {([0, 1] as const).map((face) => (
          <div
            key={face}
            className="absolute inset-0"
            style={{
              ...faceStyle,
              transform: face === 1 ? "rotateY(180deg)" : undefined,
            }}
            aria-hidden={face !== visibleFace}
          >
            <Avatar
              className="w-full h-full"
              src={PROFILE_AVATARS[faces[face]].src}
              alt={PROFILE_AVATARS[faces[face]].alt}
            />
          </div>
        ))}
      </motion.div>
    </motion.button>
  );

  if (!canSpin) return avatar;

  return (
    <Tooltip content={t("home.avatarHint")} placement="bottom" closeDelay={0}>
      {avatar}
    </Tooltip>
  );
};

export default ProfileAvatar;
