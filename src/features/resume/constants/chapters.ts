import { ResumeChapter } from "@/interfaces/resume";

// Accent/effect colours follow the site's theme `primary` — HUD uses the
// `primary` Tailwind token and the backdrop glow uses `hsl(var(--nextui-primary))`
// (see app/globals.css), so there's no hard-coded résumé accent anymore.

// The character sits at the origin, ~1.8 units tall (feet at y=0, head ≈ 1.7).
// Every chapter only moves the camera + light intensity — never the character.
export const RESUME_CHAPTERS: ResumeChapter[] = [
  {
    id: "intro",
    label: "Intro",
    index: 0,
    camera: { position: [0, 1.35, 5.6], target: [0, 1.15, 0], key: 1.1 },
  },
  {
    id: "about",
    label: "About",
    index: 1,
    camera: { position: [1.35, 1.72, 3.15], target: [0.1, 1.5, 0], key: 1.35 },
  },
  {
    id: "experience",
    label: "Journey",
    index: 2,
    camera: { position: [-4.7, 1.55, 2.4], target: [0, 1.2, 0], key: 1.2 },
  },
  {
    id: "skills",
    label: "Skills",
    index: 3,
    camera: { position: [0, 2.0, -5.4], target: [0, 1.25, 0], key: 1.0 },
  },
  {
    id: "projects",
    label: "Work",
    index: 4,
    camera: { position: [4.6, 1.4, 2.1], target: [0, 1.15, 0], key: 1.3 },
  },
  {
    id: "contact",
    label: "Contact",
    index: 5,
    camera: { position: [0, 1.5, 3.0], target: [0, 1.42, 0], key: 1.5 },
  },
];

export const RESUME_CHAPTER_COUNT = RESUME_CHAPTERS.length;
