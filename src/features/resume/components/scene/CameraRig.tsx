"use client";

import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";

import { RESUME_CHAPTERS } from "@/constants/resume-chapters";

// Light intensity eased alongside the camera and read by the key light.
export interface SceneMood {
  key: number;
}

export interface CameraRigProps {
  progressRef: React.MutableRefObject<number>;
  moodRef: React.MutableRefObject<SceneMood>;
}

// Drives the camera along a GSAP timeline that is *scrubbed* by scroll progress.
// Each chapter is one keyframe; per-segment easing means the camera slows into
// and out of every waypoint instead of ever snapping.
const CameraRig: React.FC<CameraRigProps> = ({ progressRef, moodRef }) => {
  const smooth = useRef(0);
  const target = useMemo(() => new THREE.Vector3(), []);

  const state = useMemo(() => {
    const c = RESUME_CHAPTERS[0].camera;
    return {
      px: c.position[0],
      py: c.position[1],
      pz: c.position[2],
      tx: c.target[0],
      ty: c.target[1],
      tz: c.target[2],
      key: c.key,
    };
  }, []);

  const timeline = useMemo(() => {
    const tl = gsap.timeline({ paused: true });
    RESUME_CHAPTERS.slice(1).forEach(({ camera }) => {
      tl.to(state, {
        px: camera.position[0],
        py: camera.position[1],
        pz: camera.position[2],
        tx: camera.target[0],
        ty: camera.target[1],
        tz: camera.target[2],
        key: camera.key,
        duration: 1,
        ease: "power2.inOut",
      });
    });
    return tl;
  }, [state]);

  useFrame((s, delta) => {
    smooth.current +=
      (progressRef.current - smooth.current) * Math.min(1, delta * 3.2);
    timeline.progress(THREE.MathUtils.clamp(smooth.current, 0, 1));
    s.camera.position.set(state.px, state.py, state.pz);
    target.set(state.tx, state.ty, state.tz);
    s.camera.lookAt(target);
    moodRef.current.key = state.key;
  });

  return null;
};

export default CameraRig;
