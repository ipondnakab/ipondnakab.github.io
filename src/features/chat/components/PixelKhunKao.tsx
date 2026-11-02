"use client";

import type { MascotState } from "@/features/chat/model/mascot";
import { motion, useReducedMotion } from "framer-motion";
import React from "react";

export interface PixelKhunKaoProps {
  className?: string;
  state?: MascotState;
}

const PixelKhunKao: React.FC<PixelKhunKaoProps> = ({
  className,
  state = "idle",
}) => {
  const reducedMotion = useReducedMotion();
  const still = reducedMotion !== false;
  const walking = state === "walking" && !still;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <motion.g
        animate={{ y: still ? 0 : walking ? [0, -2, 0] : [0, -1, 0] }}
        transition={{
          duration: walking ? 0.4 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.g
          animate={{ rotate: still ? 0 : [-3, 3, -3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: 0.1, originY: 0.9 }}
        >
          <path
            d="M44 54h8v-3h3V40h-2v-3h-4v-4h6v2h3v3h2v15h-3v4H44z"
            className="fill-default-900 dark:fill-default-100"
          />
          <path
            d="M46 54h6v-2h4V39h-2v-3h-3v-1h3v2h3v15h-3v3h-8z"
            className="fill-default-400"
          />
          <path
            d="M55 41h3v2h-3zm0 6h3v2h-3zm-5 6h3v3h-3z"
            className="fill-default-700 dark:fill-default-300"
          />
        </motion.g>

        <path
          d="M22 30h20v6h3v6h3v12h-2v5h-7v2H23v-2h-5v-5h-2V43h3v-7h3z"
          className="fill-default-900 dark:fill-default-100"
        />
        <path
          d="M24 32h16v5h3v7h3v9h-2v5H21v-4h-3v-9h3v-8h3z"
          className="fill-default-400"
        />
        <path
          d="M28 35h9v7h-2v7h-5v-7h-2z"
          className="fill-default-100 dark:fill-default-700"
        />
        <path
          d="M20 41h6v2h-6zm19 2h6v2h-6zm-21 6h6v2h-6zm24 2h4v2h-4z"
          className="fill-default-700 dark:fill-default-300"
        />
        <path d="M24 43h4v13h-4zm12 0h4v13h-4z" className="fill-default-500" />
        <motion.g
          animate={{ y: walking ? [0, -2, 0, 2, 0] : 0 }}
          transition={{ duration: 0.4, repeat: Infinity }}
        >
          <path
            d="M23 56h7v4h-7z"
            className="fill-default-100 dark:fill-default-700"
          />
          <path
            d="M25 58h1v2h-1zm3 0h1v2h-1z"
            className="fill-default-700 dark:fill-default-300"
          />
        </motion.g>
        <motion.g
          animate={{ y: walking ? [0, 2, 0, -2, 0] : 0 }}
          transition={{ duration: 0.4, repeat: Infinity }}
        >
          <path
            d="M34 56h7v4h-7z"
            className="fill-default-100 dark:fill-default-700"
          />
          <path
            d="M36 58h1v2h-1zm3 0h1v2h-1z"
            className="fill-default-700 dark:fill-default-300"
          />
        </motion.g>
        <path d="M23 33h19v2H23z" className="fill-primary" />
        <path d="M31 35h3v3h-3z" className="fill-warning-400" />
        <path
          d="M32 36h1v2h-1z"
          className="fill-default-700 dark:fill-default-300"
        />

        <path
          d="M14 5h3v2h3v2h3v2h16V9h3V7h3V5h3v15h2v7h-3v4h-4v3H21v-2h-4v-3h-3v-4h-2v-6h2z"
          className="fill-default-900 dark:fill-default-100"
        />
        <path
          d="M16 9h2v2h4v2h18v-2h4V9h2v12h2v6h-3v3h-4v2H23v-2h-5v-3h-2v-5h-2v-3h2z"
          className="fill-default-400"
        />
        <path
          d="M16 10h2v2h2v4h-4zm28 0h2v6h-4v-4h2z"
          className="fill-primary-200"
        />
        <path
          d="M24 14h3v4h-2v-2h-1zm6 0h2v5h-2zm5 0h3v2h-1v2h-2zM15 24h6v1h-6zm2 3h5v1h-5zm26-3h5v1h-5zm-2 3h5v1h-5z"
          className="fill-default-700 dark:fill-default-300"
        />
        <path
          d="M22 27h4v-1h6v1h5v-1h4v4h-4v2h-9v-2h-6z"
          className="fill-default-100 dark:fill-default-700"
        />
        <path
          d="M9 26h12v1H9zm1 3h11v1H10zm33-3h12v1H43zm0 3h11v1H43z"
          className="fill-default-100 dark:fill-default-700"
        />
        <path
          d="M25 28h1v1h-1zm13 0h1v1h-1z"
          className="fill-default-700 dark:fill-default-300"
        />
        <motion.g
          animate={{ scaleY: still ? 1 : [1, 1, 0.1, 1, 1] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            times: [0, 0.9, 0.93, 0.96, 1],
          }}
          style={{ originY: 0.5 }}
        >
          <path
            d="M19 20h9v1h1v4h-1v1h-9v-1h-1v-4h1zm16 0h9v1h1v4h-1v1h-9v-1h-1v-4h1z"
            className="fill-default-700 dark:fill-default-300"
          />
          <path
            d="M21 21h5v1h1v2h-1v1h-5v-1h-1v-2h1zm16 0h5v1h1v2h-1v1h-5v-1h-1v-2h1z"
            className="fill-success-400"
          />
          <path
            d="M23 21h2v4h-2zm16 0h2v4h-2z"
            className="fill-default-900 dark:fill-default-50"
          />
          <path
            d="M21 21h1v1h-1zm16 0h1v1h-1z"
            className="fill-default-100 dark:fill-default-800"
          />
        </motion.g>
        <path d="M30 26h4v1h-1v1h-2v-1h-1z" className="fill-primary-200" />
        <path
          d="M31 28h1v2h-1zm-2 2h2v1h-2zm3 0h2v1h-2z"
          className="fill-default-700 dark:fill-default-300"
        />
      </motion.g>
    </svg>
  );
};

export default PixelKhunKao;
