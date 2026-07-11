"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useState } from "react";
import * as THREE from "three";

import { SceneMood } from "./scene/CameraRig";
import ResumeScene from "./scene/ResumeScene";

export interface ResumeCanvasProps {
  progressRef: React.MutableRefObject<number>;
  moodRef: React.MutableRefObject<SceneMood>;
  isDark?: boolean;
  highDpr?: boolean;
  enableIcons?: boolean;
}

// Client-only WebGL surface (imported with ssr:false). Transparent clear so the
// CSS backdrop shows through and blends with the scene fog. Resolution adapts to
// the measured frame-rate (PerformanceMonitor) so it trades sharpness for FPS
// under load instead of dropping frames.
const ResumeCanvas: React.FC<ResumeCanvasProps> = ({
  progressRef,
  moodRef,
  isDark = true,
  highDpr = true,
  enableIcons = true,
}) => {
  const maxDpr = highDpr ? 1.75 : 1.25;
  const [dpr, setDpr] = useState(highDpr ? 1.5 : 1);

  return (
    <Canvas
      className="!absolute inset-0"
      style={{ touchAction: "pan-y" }}
      dpr={dpr}
      gl={{
        antialias: highDpr,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ fov: 42, near: 0.1, far: 100, position: [0, 1.35, 5.6] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
        gl.setClearAlpha(0);
      }}
    >
      <PerformanceMonitor
        flipflops={3}
        onFallback={() => setDpr(1)}
        onChange={({ factor }) =>
          setDpr(Math.round((1 + factor * (maxDpr - 1)) * 4) / 4)
        }
      />
      <ResumeScene
        progressRef={progressRef}
        moodRef={moodRef}
        isDark={isDark}
        enableIcons={enableIcons}
      />
    </Canvas>
  );
};

export default ResumeCanvas;
