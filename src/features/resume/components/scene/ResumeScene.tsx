"use client";

import { ContactShadows } from "@react-three/drei";
import React, { Suspense } from "react";

import Atmosphere from "./Atmosphere";
import CameraRig, { SceneMood } from "./CameraRig";
import Character from "./Character";
import SkillRings from "./SkillRings";

export interface ResumeSceneProps {
  progressRef: React.MutableRefObject<number>;
  moodRef: React.MutableRefObject<SceneMood>;
  isDark?: boolean;
  enableIcons?: boolean;
}

// Everything that lives inside the <Canvas>. Minimal by design: neutral lights,
// a soft grounding shadow, thin orbiting skill rings — no post-processing.
// CameraRig is first so it writes the shared light value before the key light
// reads it in the same frame.
const ResumeScene: React.FC<ResumeSceneProps> = ({
  progressRef,
  moodRef,
  isDark = true,
  enableIcons = true,
}) => {
  return (
    <>
      <CameraRig progressRef={progressRef} moodRef={moodRef} />

      <Atmosphere moodRef={moodRef} isDark={isDark} />
      <SkillRings progressRef={progressRef} enableIcons={enableIcons} />

      <Suspense fallback={null}>
        <Character progressRef={progressRef} />
      </Suspense>

      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={isDark ? 0.4 : 0.28}
        scale={11}
        blur={2.6}
        far={4.5}
        resolution={enableIcons ? 256 : 128}
        color={isDark ? "#000000" : "#334155"}
      />
    </>
  );
};

export default ResumeScene;
