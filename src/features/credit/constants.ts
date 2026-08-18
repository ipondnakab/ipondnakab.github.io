import { CreditCategory } from "@/features/credit/model/credit";

/**
 * Everything this site is built on.
 *
 * Licences were read from each package's manifest and LICENSE file rather than
 * assumed — most are MIT, but not all, and a credits page that badges them all
 * MIT is worse than one that omits them. Versions are deliberately absent: they
 * would go stale on every dependency bump.
 */
export const CREDIT_CATEGORIES: CreditCategory[] = [
  {
    id: "framework",
    projects: [
      {
        name: "Next.js",
        description: "The React framework for the web",
        url: "https://nextjs.org",
        license: "MIT",
      },
      {
        name: "React",
        description: "The library for web and native user interfaces",
        url: "https://react.dev",
        license: "MIT",
      },
      {
        name: "TypeScript",
        description: "JavaScript with syntax for types",
        url: "https://www.typescriptlang.org",
        license: "Apache-2.0",
      },
    ],
  },
  {
    id: "ui",
    projects: [
      {
        name: "NextUI",
        description: "Beautiful, fast and modern React UI components",
        url: "https://nextui.org",
        license: "MIT",
      },
      {
        name: "Tailwind CSS",
        description: "A utility-first CSS framework",
        url: "https://tailwindcss.com",
        license: "MIT",
      },
      {
        name: "Framer Motion",
        description: "A production-ready motion library for React",
        url: "https://www.framer.com/motion/",
        license: "MIT",
      },
      {
        name: "React Icons",
        description: "Popular icon packs as React components",
        url: "https://react-icons.github.io/react-icons/",
        license: "MIT",
      },
      {
        name: "next-themes",
        description: "Theme switching for Next.js, without the flash",
        url: "https://github.com/pacocoursey/next-themes",
        license: "MIT",
      },
      {
        name: "tsParticles",
        description: "The particle background on every page",
        url: "https://particles.js.org",
        license: "MIT",
      },
      {
        name: "clsx",
        description: "A tiny utility for building className strings",
        url: "https://github.com/lukeed/clsx",
        license: "MIT",
      },
    ],
  },
  {
    id: "threeD",
    projects: [
      {
        name: "Three.js",
        description: "The JavaScript 3D library behind the résumé scene",
        url: "https://threejs.org",
        license: "MIT",
      },
      {
        name: "React Three Fiber",
        description: "A React renderer for Three.js",
        url: "https://docs.pmnd.rs/react-three-fiber",
        license: "MIT",
      },
      {
        name: "Drei",
        description: "Useful helpers for React Three Fiber",
        url: "https://github.com/pmndrs/drei",
        license: "MIT",
      },
      {
        name: "GSAP",
        description: "Camera and timeline animation in the résumé scene",
        url: "https://gsap.com",
        license: "GSAP Standard (no-charge)",
      },
    ],
  },
  {
    id: "data",
    projects: [
      {
        name: "Firebase",
        description: "Firestore backs the Planning Poker and Mic Link rooms",
        url: "https://firebase.google.com",
        license: "Apache-2.0",
      },
      {
        name: "React Hook Form",
        description: "Performant, flexible forms with easy validation",
        url: "https://react-hook-form.com",
        license: "MIT",
      },
      {
        name: "Day.js",
        description: "A 2 kB immutable date library",
        url: "https://day.js.org",
        license: "MIT",
      },
      {
        name: "node-qrcode",
        description: "QR code generation in the browser",
        url: "https://github.com/soldair/node-qrcode",
        license: "MIT",
      },
      {
        name: "promptpay-qr",
        description: "Builds the PromptPay QR payload",
        url: "https://github.com/dtinth/promptpay-qr",
        license: "MIT",
      },
    ],
  },
  {
    id: "i18n",
    projects: [
      {
        name: "i18next",
        description: "The internationalisation framework",
        url: "https://www.i18next.com",
        license: "MIT",
      },
      {
        name: "react-i18next",
        description: "i18next bindings for React",
        url: "https://react.i18next.com",
        license: "MIT",
      },
    ],
  },
  {
    id: "tooling",
    projects: [
      {
        name: "Vitest",
        description: "The test runner",
        url: "https://vitest.dev",
        license: "MIT",
      },
      {
        name: "Testing Library",
        description: "Tests that use the app the way people do",
        url: "https://testing-library.com",
        license: "MIT",
      },
      {
        name: "jsdom",
        description: "A JavaScript implementation of web standards",
        url: "https://github.com/jsdom/jsdom",
        license: "MIT",
      },
      {
        name: "ESLint",
        description: "Finds problems before they ship",
        url: "https://eslint.org",
        license: "MIT",
      },
      {
        name: "typescript-eslint",
        description: "Lets ESLint understand TypeScript",
        url: "https://typescript-eslint.io",
        license: "MIT",
      },
      {
        name: "Prettier",
        description: "An opinionated code formatter",
        url: "https://prettier.io",
        license: "MIT",
      },
      {
        name: "PostCSS",
        description: "Transforms CSS with JavaScript",
        url: "https://postcss.org",
        license: "MIT",
      },
      {
        name: "Husky",
        description: "Git hooks that keep commits tidy",
        url: "https://typicode.github.io/husky",
        license: "MIT",
      },
      {
        name: "lint-staged",
        description: "Runs linters on staged files only",
        url: "https://github.com/lint-staged/lint-staged",
        license: "MIT",
      },
    ],
  },
  {
    id: "hosting",
    projects: [
      {
        name: "GitHub Pages",
        description: "Serves this site straight from the repository",
        url: "https://pages.github.com",
        license: "Service",
      },
      {
        name: "Vercel",
        description:
          "Runs the portfolio-api functions behind the chat and contact form",
        url: "https://vercel.com",
        license: "Service",
      },
    ],
  },
];

export const CREDITED_PROJECT_COUNT = CREDIT_CATEGORIES.reduce(
  (total, category) => total + category.projects.length,
  0,
);
