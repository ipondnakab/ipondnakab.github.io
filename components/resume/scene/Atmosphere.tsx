"use client";

import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";

import { SceneMood } from "./CameraRig";

export interface AtmosphereProps {
  moodRef: React.MutableRefObject<SceneMood>;
  isDark?: boolean;
}

// Clean, neutral studio lighting + a whisper of fog for depth. Fog colour and
// ambient fill flip with the theme so the scene reads on a light backdrop too.
const Atmosphere: React.FC<AtmosphereProps> = ({ moodRef, isDark = true }) => {
  const keyLight = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (keyLight.current) keyLight.current.intensity = moodRef.current.key;
  });

  return (
    <>
      <fogExp2 attach="fog" args={[isDark ? "#07090e" : "#e9edf2", 0.035]} />

      <ambientLight intensity={isDark ? 0.5 : 0.85} color="#c9d4e2" />
      <hemisphereLight
        intensity={isDark ? 0.5 : 0.8}
        color={isDark ? "#d7e2f0" : "#ffffff"}
        groundColor={isDark ? "#0a0d13" : "#c4ccd6"}
      />
      <directionalLight
        ref={keyLight}
        position={[3.5, 7, 5]}
        intensity={1.1}
        color="#ffffff"
      />
      {/* Soft fill from the opposite side to keep the silhouette readable. */}
      <directionalLight
        position={[-4, 3, -3]}
        intensity={0.35}
        color="#aebccc"
      />
    </>
  );
};

export default Atmosphere;
