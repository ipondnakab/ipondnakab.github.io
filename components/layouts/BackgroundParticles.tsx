"use client";

import type { ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useState } from "react";

export interface BackgroundParticlesProps {
  isPlaying?: boolean;
}

// <Particles> reloads whenever it re-renders (its internal load effect depends
// on the whole props object). Memoise it and feed it only stable props so it
// loads exactly once. Visibility/opacity is controlled on the wrapper below,
// never on <Particles> itself, so the engine is never reloaded.
const MemoizedParticles = React.memo(Particles);

const getMaxMin = () => {
  // The memo below runs during SSR/prerender too (hooks run before the `init`
  // gate), so guard window — the value is only used once mounted on the client.
  if (typeof window === "undefined") {
    return { max: 100, min: 15 };
  }
  const wScreen = window.innerWidth;
  const hScreen = window.innerHeight;
  const max = Math.round(Math.min(wScreen, hScreen) * 0.4);
  return {
    max,
    min: Math.round(max * 0.15),
  };
};

const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({
  isPlaying = true,
}) => {
  const [init, setInit] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // this loads the tsparticles slim bundle, the easiest way to get everything ready
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // Not fullScreen: the canvas renders inside the wrapper <div> below, so we can
  // fade that wrapper to hide/show without touching <Particles> props.
  const options = useMemo<ISourceOptions>(
    () => ({
      fpsLimit: 60,
      fullScreen: {
        enable: false,
      },
      pauseOnOutsideViewport: true,
      detectRetina: true,
      particles: {
        number: {
          value: 6,
        },
        color: {
          value: "#d80032",
        },
        shape: {
          type: "circle",
          options: {
            stroke: {
              width: 0,
              color: "#000000",
            },
            polygon: {
              nb_sides: 5,
            },
          },
        },
        opacity: {
          value: {
            max: 1,
            min: 0.5,
          },
        },
        size: {
          value: getMaxMin(),
        },
        move: {
          enable: true,
          speed: {
            max: 1,
            min: 0.1,
          },
          direction: "none",
          random: true,
          straight: false,
          outModes: {
            default: "bounce",
          },
          angle: {
            value: 90,
            offset: {
              max: 45,
              min: -45,
            },
          },
        },
      },
    }),
    [],
  );

  if (!init) return null;

  // Hide by fading the wrapper (the animation keeps running underneath); dim a
  // little in dark mode. This is plain CSS on our own element — no reload.
  const opacity = isPlaying ? (isDark ? 0.7 : 1) : 0;

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity, transition: "opacity 0.4s ease" }}
    >
      <MemoizedParticles
        id="tsparticles"
        className="w-full h-full"
        options={options}
      />
    </div>
  );
};

export default React.memo(BackgroundParticles);
