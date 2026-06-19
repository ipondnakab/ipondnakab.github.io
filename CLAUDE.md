# CLAUDE.md

Guidance for Claude Code (and other AI assistants) working in this repository.
See [docs/CODING_GUIDE.md](docs/CODING_GUIDE.md) for copy-paste templates and detailed rules.

## Project overview

Personal portfolio + playground site for Kittipat Daengdee, deployed as a **static export** to GitHub Pages at https://ipondnakab.github.io.

- **Framework:** Next.js 14 (App Router) with `output: "export"` — static HTML only, no server runtime.
- **Language:** TypeScript (`strict: true`).
- **UI:** NextUI + Tailwind CSS, `framer-motion`, `next-themes` (default theme `dark`).
- **Data/realtime:** Firebase Firestore (used by the Planning Poker feature).
- **3D:** Three.js (`components/threejs/ThreeScene.tsx`).
- **Package manager:** **yarn** (a `yarn.lock` is committed — never introduce `package-lock.json`).

Because the site is statically exported, there is **no server**: no API routes, no server actions, no server-only secrets at runtime. All data calls (Firebase, axios) run in the browser.

## Commands

```bash
yarn dev              # local dev server (http://localhost:3000)
yarn build            # production static export -> ./dist
yarn start            # serve the production build
yarn lint             # eslint over .js/.ts/.tsx
yarn lint:fix         # eslint --fix
yarn format           # prettier --write across the repo
npx tsc --noEmit      # type-check only (no test runner exists)
```

There are **no tests** configured. Validate changes with `npx tsc --noEmit` + `yarn lint`, then by running `yarn dev`/`yarn build`.

## Directory map

| Path          | Purpose                                                                      |
| ------------- | ---------------------------------------------------------------------------- |
| `app/`        | App Router routes (`page.tsx`), `layout.tsx`, `providers.tsx`, `globals.css` |
| `components/` | Reusable components, grouped by feature/domain folder                        |
| `interfaces/` | Shared TypeScript types & interfaces (the source of truth for data shapes)   |
| `constants/`  | Static data tables and config (nav menu, projects, social, db names)         |
| `functions/`  | Small pure client utilities                                                  |
| `libs/`       | Third-party SDK wrappers (`firebase.ts`)                                     |
| `core/`       | App-level config (`environment.ts`)                                          |
| `public/`     | Static assets (`images/`, `models/` for GLTF)                                |
| `dist/`       | Build output (git-ignored, set by `distDir` in `next.config.js`)             |

## Core conventions (must follow)

- **Imports use the `@/` alias** for repo-local modules (`@/components/...`, `@/interfaces/...`). Relative imports are only for same-folder siblings (e.g. `./PlanningPokerHeader`).
- **Components are arrow functions typed with `React.FC`**, each with an exported `XxxProps` interface and a `export default`. See the template in [docs/CODING_GUIDE.md](docs/CODING_GUIDE.md).
- **`"use client"`** goes at the very top of any file using hooks, browser APIs, or event handlers. Pages that only render a client component can stay server components (see `app/planning-poker/page.tsx`).
- **Types live in `interfaces/`**; static data lives in `constants/`. Don't inline large data tables in components.
- **No `any`** (ESLint error). Prefer explicit interfaces or `unknown`. Prefix intentionally-unused vars/args with `_`.
- **No stray `console.*`** (ESLint error; only `console.warn`/`console.error` are allowed).
- **Styling is Tailwind utility classes.** Use the NextUI theme tokens (`primary`, `background`) defined in `tailwind.config.ts` rather than hard-coded hex.
- **Forms** go through `components/form-hook-wrapper/FormHookWrapper` (React Hook Form) with the `components/inputs/*` field components. Validation is declarative via the `rules` prop (`FieldController`); an optional zod `validationSchema` is supported.

## Formatting & hooks

- Prettier: `printWidth: 80`, 2-space tabs, semicolons, `trailingComma: "all"`, imports auto-organized by `prettier-plugin-organize-imports`.
- Husky + lint-staged run ESLint `--fix` and Prettier on staged files at commit time. Don't fight the auto-formatter — run `yarn lint:fix && yarn format` before committing.
- Run `npx tsc --noEmit` and `yarn lint` before considering a change done.

## Enforced lint rules (errors — the build fails on these)

The conventions above are not just guidance; `.eslintrc.json` enforces them as **errors**:

- `@typescript-eslint/no-explicit-any` — no `any`.
- `no-console` — no `console.*` except `console.warn` / `console.error`.
- `unused-imports/no-unused-imports` + `unused-imports/no-unused-vars` — no unused imports/vars (prefix intentional ones with `_`).
- `no-restricted-imports` — bans `../` parent-relative imports; use the `@/` alias for anything outside the current folder.
- `@typescript-eslint/consistent-type-definitions` — object shapes are `interface`, not `type`.
- `eqeqeq` (smart), `no-var`, `prefer-const`, `no-unneeded-ternary`, `object-shorthand`.

`next build` runs ESLint + type-check, so a violation breaks the build/deploy. Don't downgrade these to warnings to make a build pass — fix the code.

## Environment & secrets

- All runtime config is `NEXT_PUBLIC_*` (firebase, API URL, secret key) and read via `process.env` — these end up in the **client bundle**, so treat them as public. See `libs/firebase.ts` and `core/environment.ts`.
- In CI, `.env` is generated from GitHub Actions secrets/vars (see `.github/workflows/nextjs.yml`).
- **Never** commit real secrets or read/print `.env` contents. There is no server tier to hide secrets in — don't add code that assumes one.

## Feature-specific notes

- **Planning Poker** (`components/planning-poker/`): Firestore-backed. Room state is one doc keyed by the `?room=` query param under `PLANNING_POKER_DB_NAME`; `votes` is a `userId -> PlayerVote` map. Shapes are in `interfaces/poker.ts`. Use `setDoc(..., { merge: true })` for partial updates and `deleteField()` to remove a vote — preserve unrelated keys.
- **ThreeScene** (`components/threejs/ThreeScene.tsx`): must fully clean up on unmount — `cancelAnimationFrame`, dispose geometries/materials/textures, stop the animation mixer. Follow the existing disposal pattern; don't reintroduce leaks.

## Git & PRs

- Conventional, present-tense commit subjects: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
- Keep commits small and focused. Only commit/push when the user asks.
- Pushing to `master` triggers the GitHub Pages deploy workflow — be deliberate about what lands there.
