"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useTranslation } from "react-i18next";
import { HiChevronDown } from "react-icons/hi";

export interface ScrollHintProps {
  visible: boolean;
}

// Quiet "scroll to explore" cue shown only on the opening chapter.
const ScrollHint: React.FC<ScrollHintProps> = ({ visible }) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none fixed inset-x-0 bottom-5 z-20 flex flex-col items-center text-foreground/60"
        >
          <span className="text-[10px] uppercase tracking-[0.4em]">
            {t("resume.scrollHint", "Scroll to explore")}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <HiChevronDown className="text-lg" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollHint;
