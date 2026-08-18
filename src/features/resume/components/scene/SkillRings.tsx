"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { RESUME_CHAPTER_COUNT } from "@/constants/resume-chapters";
import {
  FALLBACK_SKILL_ICON,
  SKILL_ICONS,
} from "@/constants/resume-skill-icons";
import { SKILL_CATEGORIES } from "@/constants/resume-skills";
import { SkillCategory } from "@/interfaces/resume";

// One skill node = its brand icon, tinted to the category colour.
const SkillNodeIcon: React.FC<{ skill: string; color: string }> = ({
  skill,
  color,
}) => {
  const Icon = SKILL_ICONS[skill] ?? FALLBACK_SKILL_ICON;
  return (
    <div className="skill-node-icon" style={{ color }}>
      <Icon size={20} />
    </div>
  );
};

// One category = one thin ring; each skill sits on it as a billboarded icon
// (drei <Html>), so the rings read as the actual tech stack orbiting.
const SkillRing: React.FC<{
  category: SkillCategory;
  reveal: React.MutableRefObject<number>;
  showIcons: boolean;
}> = ({ category, reveal, showIcons }) => {
  const group = useRef<THREE.Group>(null);

  const nodes = useMemo(
    () =>
      category.skills.map((_, i) => {
        const a = (i / category.skills.length) * Math.PI * 2;
        return [
          Math.cos(a) * category.radius,
          0,
          Math.sin(a) * category.radius,
        ] as [number, number, number];
      }),
    [category],
  );

  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: category.color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [category.color],
  );

  useEffect(() => () => ringMaterial.dispose(), [ringMaterial]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const r = reveal.current;
    g.rotation.y += category.speed * delta;
    g.scale.setScalar(0.9 + 0.1 * r);
    g.visible = r > 0.01;
    ringMaterial.opacity = 0.22 * r;
  });

  return (
    <group
      ref={group}
      position={[0, category.height, 0]}
      rotation={[category.tilt, 0, 0]}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]} material={ringMaterial}>
        <torusGeometry args={[category.radius, 0.006, 6, 128]} />
      </mesh>
      {showIcons &&
        category.skills.map((skill, i) => (
          <Html
            key={skill + i}
            position={nodes[i]}
            center
            distanceFactor={8}
            zIndexRange={[10, 0]}
            style={{ pointerEvents: "none" }}
          >
            <SkillNodeIcon skill={skill} color={category.color} />
          </Html>
        ))}
    </group>
  );
};

export interface SkillRingsProps {
  progressRef: React.MutableRefObject<number>;
  // DOM-overlay icon nodes are skipped on low-power devices (rings only).
  enableIcons?: boolean;
}

// Fades in near the "Skills" chapter (index 3). The icon nodes are DOM overlays,
// so they're only mounted while the rings are actually on screen.
const SkillRings: React.FC<SkillRingsProps> = ({
  progressRef,
  enableIcons = true,
}) => {
  const reveal = useRef(0);
  const [showIcons, setShowIcons] = useState(false);

  useFrame((_, delta) => {
    const cf = progressRef.current * (RESUME_CHAPTER_COUNT - 1);
    const target = THREE.MathUtils.clamp(1 - Math.abs(cf - 3) / 1.4, 0, 1);
    reveal.current += (target - reveal.current) * Math.min(1, delta * 4);
    if (!enableIcons) return;
    if (!showIcons && reveal.current > 0.2) setShowIcons(true);
    else if (showIcons && reveal.current < 0.05) setShowIcons(false);
  });

  return (
    <group>
      {SKILL_CATEGORIES.map((category) => (
        <SkillRing
          key={category.id}
          category={category}
          reveal={reveal}
          showIcons={enableIcons && showIcons}
        />
      ))}
    </group>
  );
};

export default SkillRings;
