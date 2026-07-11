"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/character.glb";
const TARGET_HEIGHT = 1.85; // world units, feet at y=0

// Scroll speed (progress units / second, smoothed) that picks the gait.
const WALK_SPEED = 0.03;
const RUN_SPEED = 0.35;
// Past this scroll progress we've reached the final "contact" chapter.
const CONTACT_PROGRESS = 0.9;

// Preferred clip -> ordered fallbacks (in case a clip is missing from the GLB).
const CLIP_FALLBACKS: Record<string, string[]> = {
  idle: ["idle"],
  walk: ["walk", "run", "idle"],
  run: ["run", "walk", "idle"],
  dance: ["hiphopDancing", "spainDancing", "idle"],
};

export interface CharacterProps {
  // Base facing rotation. 0 points the face toward the +Z front camera; flip by
  // Math.PI if the model turns out to face away.
  baseRotation?: number;
  // Shared scroll progress (0..1). When provided, the character's gait follows
  // scroll speed: still = idle, scrolling = walk, fast scroll = run, and it
  // dances once settled on the final contact chapter.
  progressRef?: React.MutableRefObject<number>;
}

// The hologram subject. It never travels through the scene — only micro idle
// motion (breathing float, cursor lean) plus a skeletal clip driven by scroll.
const Character: React.FC<CharacterProps> = ({
  baseRotation = 0,
  progressRef,
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, group);

  const currentClip = useRef<string>("");
  const lastProgress = useRef(progressRef?.current ?? 0);
  const scrollSpeed = useRef(0);

  // Normalise the model once: centre it on x/z, drop its feet to y=0, and scale
  // to a predictable height so every camera chapter frames it consistently.
  useLayoutEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const s = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
    scene.scale.setScalar(s);
    scene.position.set(-center.x * s, -box.min.y * s, -center.z * s);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = false;
        mesh.frustumCulled = false;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && "map" in mat && mat.map)
          mat.map.colorSpace = THREE.SRGBColorSpace;
      }
    });
  }, [scene]);

  // Crossfade to the first available clip for `desired` (see CLIP_FALLBACKS).
  const fadeTo = (desired: string, fade = 0.35) => {
    if (!actions) return;
    const chain = CLIP_FALLBACKS[desired] ?? [desired];
    const clip = chain.find((c) => actions[c]) ?? Object.keys(actions)[0];
    if (!clip || clip === currentClip.current) return;
    const next = actions[clip];
    if (!next) return;
    const prev = currentClip.current ? actions[currentClip.current] : null;
    next.reset().setEffectiveWeight(1).fadeIn(fade).play();
    if (prev && prev !== next) prev.fadeOut(fade);
    currentClip.current = clip;
  };

  // Start on idle once the clips are ready.
  useEffect(() => {
    if (!actions) return;
    fadeTo("idle", 0.8);
    const snapshot = actions;
    return () => {
      Object.values(snapshot).forEach((a) => a?.fadeOut(0.3));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const k = Math.min(1, delta * 2.2);

    // Pick the gait from smoothed scroll speed + which chapter we're on.
    if (progressRef && actions) {
      const p = progressRef.current;
      const raw = Math.abs(p - lastProgress.current) / Math.max(delta, 1e-4);
      lastProgress.current = p;
      scrollSpeed.current +=
        (raw - scrollSpeed.current) * Math.min(1, delta * 6);
      const spd = scrollSpeed.current;
      const desired =
        spd > RUN_SPEED
          ? "run"
          : spd > WALK_SPEED
            ? "walk"
            : p > CONTACT_PROGRESS
              ? "dance"
              : "idle";
      fadeTo(desired);
    }

    // Breathing float — calmer while moving so it doesn't fight the gait bob.
    const moving =
      currentClip.current === "walk" || currentClip.current === "run";
    g.position.y = Math.sin(t * 0.9) * (moving ? 0.012 : 0.035);
    // Subtle idle drift + a slight lean toward the cursor (head-tracking).
    const targetYaw =
      baseRotation + state.pointer.x * 0.16 + Math.sin(t * 0.28) * 0.03;
    const targetPitch = -state.pointer.y * 0.06;
    g.rotation.y += (targetYaw - g.rotation.y) * k;
    g.rotation.x += (targetPitch - g.rotation.x) * k;
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload(MODEL_URL);

export default Character;
