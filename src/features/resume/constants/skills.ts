import { SkillCategory } from "@/interfaces/resume";

// Every skill below is drawn from the existing résumé data (the readme skill
// cards in components/readme/* and the technologies named across
// constants/work-experiences.ts + constants/outsource-projects.ts). Nothing
// here is invented — categories just regroup the real stack into orbiting rings.
//
// Ring/legend colours are shades of the theme `primary` scale (see the
// `primaryColors` map in tailwind.config.ts), lightest → primary, so the rings
// read as one primary-coloured family. These run inside the WebGL canvas, which
// needs literal colours rather than CSS variables — update them here if the
// `primary` palette ever changes.
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "frontend",
    title: "Frontend",
    color: "#f3b2c1",
    radius: 2.5,
    height: 1.85,
    tilt: 0.14,
    speed: 0.16,
    skills: [
      "React.js",
      "Next.js",
      "Vue.js",
      "Angular",
      "React Native",
      "Expo",
      "Tailwind CSS",
      "Bootstrap",
    ],
  },
  {
    id: "backend",
    title: "Backend",
    color: "#e76684",
    radius: 2.15,
    height: 1.35,
    tilt: -0.1,
    speed: -0.19,
    skills: [
      "Node.js",
      "Spring Boot",
      "Deno.js",
      "Firebase",
      "SQL",
      "Redis",
      "LINE API",
    ],
  },
  {
    id: "languages",
    title: "Languages",
    color: "#e34c6f",
    radius: 2.9,
    height: 1.05,
    tilt: 0.22,
    speed: 0.13,
    skills: ["TypeScript", "JavaScript", "Java", "Python", "C++", "Go"],
  },
  {
    id: "devops",
    title: "DevOps",
    color: "#df325a",
    radius: 1.85,
    height: 2.35,
    tilt: -0.26,
    speed: -0.22,
    skills: ["Git", "Docker", "Jenkins", "Playwright"],
  },
  {
    id: "cloud",
    title: "Cloud",
    color: "#db1946",
    radius: 3.25,
    height: 0.7,
    tilt: 0.08,
    speed: 0.11,
    skills: ["AWS", "Firebase", "Firestore", "GitHub Pages"],
  },
  {
    id: "ai",
    title: "AI",
    color: "#d80032",
    radius: 2.6,
    height: 2.75,
    tilt: 0.3,
    speed: -0.15,
    skills: ["Claude", "Spec-Kit", "AI-Powered Apps", "Audio Workflows"],
  },
];
