// Shapes for the cinematic 3D résumé experience (see components/resume/*).
// Data lives in constants/resume-*.ts; these are the source-of-truth types.

export type ResumeChapterId =
  "intro" | "about" | "experience" | "skills" | "projects" | "contact";

// One cinematic camera pose plus the light intensity that eases alongside it.
export interface CameraKeyframe {
  position: [number, number, number];
  target: [number, number, number];
  key: number; // key-light intensity
}

export interface ResumeChapter {
  id: ResumeChapterId;
  label: string; // short label shown in the floating nav
  index: number;
  camera: CameraKeyframe;
}

export type SkillCategoryId =
  "frontend" | "backend" | "languages" | "cloud" | "devops" | "ai";

// A thin ring of skills orbiting the character.
export interface SkillCategory {
  id: SkillCategoryId;
  title: string;
  color: string; // hex accent for the ring + legend
  radius: number; // orbit radius in world units
  height: number; // y-offset of the ring
  tilt: number; // ring tilt in radians
  speed: number; // orbital speed (rad/s), sign sets direction
  skills: string[];
}
