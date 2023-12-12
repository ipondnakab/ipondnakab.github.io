import React, { useEffect, useMemo, useState } from "react";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";

const BackgroundParticles: React.FC = () => {
  const [init, setInit] = useState(false);
  const { theme } = useTheme();

  const isDark = useMemo(() => theme === "dark", [theme]);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      await loadSlim(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const getMaxMin = () => {
    const wScreen = window.innerWidth;
    const hScreen = window.innerHeight;
    const max = Math.round(Math.min(wScreen, hScreen) * 0.4);
    return {
      max,
      min: Math.round(max * 0.15),
    };
  };

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      // particlesLoaded={particlesLoaded}
      options={{
        fpsLimit: 60,
        fullScreen: {
          enable: true,
          zIndex: -10,
        },
        pauseOnOutsideViewport: true,
        detectRetina: true,
        particles: {
          number: {
            value: 6,
          },
          color: {
            // value: ["#c311e7", "#b8e986", "#4dc9ff", "#ffd300", "#ff7e79"],
            value: "#d80032",
          },
          shape: {
            type: "circle",
            // stroke: {
            //   width: 0,
            //   color: "#000000",
            // },
            options: {
              stroke: {
                width: 0,
                color: "#000000",
              },
              polygon: {
                nb_sides: 5,
              },
            },
            // polygon: {
            //   nb_sides: 5,
            // },
            // image: {
            //   src: "img/github.svg",
            //   width: 100,
            //   height: 100,
            // },
          },
          opacity: {
            value: isDark
              ? {
                  max: 0.7,
                  min: 0.1,
                }
              : {
                  max: 1,
                  min: 0.6,
                },
            // random: false,
            // anim: {
            //   enable: false,
            //   speed: 1,
            //   opacity_min: 0.5,
            //   sync: false,
            // },
            // animation: {
            //   enable: true,
            //   speed: 1,
            //   sync: false,
            // },
          },
          size: {
            value: getMaxMin(),
            // animation: {
            //   enable: true,
            //   speed: 30,
            //   mode: "random",
            // },
          },

          //   line_linked: {
          //     enable: true,
          //     distance: 200,
          //     color: isDark ? "#ffffff" : "#000000",
          //     opacity: 0.4,
          //     width: 1,
          //   },
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
            // warp: true,
            // vibrate: true,
            angle: {
              value: 90,
              offset: {
                max: 45,
                min: -45,
              },
            },
          },
        },
        retina_detect: true,
      }}
    />
  );
};

export default BackgroundParticles;
