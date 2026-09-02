# AGENTS.md

Guidance for Codex (and other AI assistants) working in this repository.

- [.specify/memory/constitution.md](.specify/memory/constitution.md) — the rules. When anything here disagrees with it, it wins.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — the layering and why it is shaped that way.
- [docs/CODING_GUIDE.md](docs/CODING_GUIDE.md) — copy-paste templates and detailed rules.
- [docs/SPEC_DRIVEN_DEVELOPMENT.md](docs/SPEC_DRIVEN_DEVELOPMENT.md) — the Spec Kit workflow.

## Project overview

Personal portfolio + playground site for Kittipat Daengdee, deployed as a **static export** to GitHub Pages at https://ipondnakab.github.io.

- **Framework:** Next.js 14 (App Router) with `output: "export"` — static HTML only, no server runtime.
- **Language:** TypeScript (`strict: true`).
- **UI:** NextUI + Tailwind CSS, `framer-motion`, `next-themes` (default theme `dark`).
- **i18n:** `react-i18next`, five locales (`en`, `th`, `ja`, `sv`, `zh`), bundled not fetched.
- **Data/realtime:** Firebase Firestore (Planning Poker, Mic Link signalling).
- **3D:** Three.js + react-three-fiber.
- **Tests:** Vitest + Testing Library (jsdom).
- **Package manager:** **yarn** (a `yarn.lock` is committed — never introduce `package-lock.json`).

Because the site is statically exported, there is **no server**: no API routes, no server actions, no server-only secrets at runtime. All data calls run in the browser. Anything needing a real backend lives in the separate `portfolio-api/` Vercel project, reached over `NEXT_PUBLIC_API_BASE_URL`.

## Commands

```bash
yarn dev              # local dev server (http://localhost:3000)
yarn build            # production static export -> ./dist
yarn start            # serve the production build
yarn test             # vitest run
yarn test:watch       # vitest in watch mode
yarn test:coverage    # v8 coverage
yarn typecheck        # tsc --noEmit
yarn lint             # eslint over .js/.ts/.tsx
yarn lint:fix         # eslint --fix
yarn format           # prettier --write across the repo
```

**Definition of done** — all four, in order, with real results reported:

```bash
yarn typecheck && yarn lint && yarn test && yarn build
```

CI runs the same gates (`.github/workflows/nextjs.yml`) before building, so a red gate blocks the deploy. Running them locally first is faster than finding out from Actions.

**Node:** the floor lives in `package.json` `engines.node`, the pin in `.nvmrc`, and the same pin in the workflow's `node-version` — all three must agree, and `src/shared/config/runtime.test.ts` fails if they drift.

## Directory map

| Path                   | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `src/app/`             | App Router routes — thin pages, `layout.tsx`, `providers.tsx`           |
| `src/features/<name>/` | One folder per feature: `components/ lib/ model/ constants index.ts`    |
| `src/shared/`          | Cross-cutting: `ui/ layouts/ providers/ seo/ lib/ config/ i18n/ types/` |
| `specs/`               | One folder per feature spec (Spec Kit)                                  |
| `.specify/`            | Constitution, templates and scripts for the spec workflow               |
| `docs/`                | Architecture, coding guide, spec-driven workflow                        |
| `public/`              | Static assets (`images/`, `models/` for GLTF)                           |
| `portfolio-api/`       | Separate Vercel project — the only place with a server                  |
| `dist/`                | Build output (git-ignored, set by `distDir` in `next.config.js`)        |

Features today: `planning-poker`, `pokdeng`, `mic-link`, `resume`, `chat`, `contact`, `prompt-pay`, `profile`, `mini-project`, `threejs`.

## Core conventions (must follow)

- **Imports use the `@/` alias**, which maps to `./src/`. Relative imports are only for same-folder siblings (`./PlanningPokerHeader`).
- **Dependency direction is one-way and lint-enforced.** `app/` → `features/` → `shared/`. `shared/` must **never** import `features/` or `app/`; invert with a slot instead (see `DefaultLayout`'s `overlay` prop). A feature's `lib/`, `model/` and `constants` are private — reach other features through `@/features/<name>` or `@/features/<name>/components/<Component>`.
- **Barrels (`index.ts`) export types, constants and pure helpers — never client components.** Re-exporting a client component puts it in the client-reference manifest of every route that touches the barrel and inflates the bundle. Import components by path.
- **Components are arrow functions typed with `React.FC`**, each with an exported `XxxProps` interface and a `export default`.
- **`"use client"`** goes at the very top of any file using hooks, browser APIs, or event handlers. Route pages stay server components that set `metadata` and render one feature component.
- **Types live in `model/`** (feature) or `src/shared/types/` (cross-cutting). Static data lives in `constants`. Don't inline either in a component.
- **No `any`** (ESLint error). Prefer explicit interfaces or `unknown`. Prefix intentionally-unused vars/args with `_`.
- **No stray `console.*`** (ESLint error; only `console.warn`/`console.error` are allowed).
- **Styling is Tailwind utility classes.** Use the NextUI theme tokens (`primary`, `background`) defined in `tailwind.config.ts` rather than hard-coded hex. Check dark (default) and light.
- **All user-facing copy goes in every locale** under `src/shared/i18n/locales/`. A missing key is a bug.
- **Forms** go through `src/shared/ui/form/FormHookWrapper` (React Hook Form) with the `src/shared/ui/inputs/*` field components. Validation is declarative via the `rules` prop.

## Tests

Vitest + Testing Library, jsdom, `globals: false` — import `describe`/`it`/`expect` from `vitest` explicitly. Tests live beside the code as `<name>.test.ts` and import through `@/` like production code.

Pure logic in `lib/` is the priority; that is where the real invariants are. Write the test before the implementation and see it fail first.

## Formatting & hooks

- Prettier: `printWidth: 80`, 2-space tabs, semicolons, `trailingComma: "all"`, imports auto-organized by `prettier-plugin-organize-imports`.
- Husky + lint-staged run ESLint `--fix` and Prettier on staged files at commit time. Run `yarn lint:fix && yarn format` before committing.

## Enforced lint rules (errors — the build fails on these)

`.eslintrc.json` enforces these as **errors**:

- `@typescript-eslint/no-explicit-any` — no `any`.
- `no-console` — no `console.*` except `console.warn` / `console.error`.
- `unused-imports/*` — no unused imports/vars (prefix intentional ones with `_`).
- `no-restricted-imports` — bans `../` parent imports, **and** enforces the layering above via per-folder overrides.
- `@typescript-eslint/consistent-type-definitions` — object shapes are `interface`, not `type`.
- `eqeqeq` (smart), `no-var`, `prefer-const`, `no-unneeded-ternary`, `object-shorthand`.

`next build` runs ESLint + type-check, so a violation breaks the build/deploy. Don't downgrade these to warnings to make a build pass — fix the code.

## Environment & secrets

- All runtime config is `NEXT_PUBLIC_*` and read via `src/shared/config/environment.ts` — these end up in the **client bundle**, so treat them as public.
- In CI, `.env` is generated from GitHub Actions secrets/vars (see `.github/workflows/nextjs.yml`).
- **Never** commit real secrets or read/print `.env` contents. There is no server tier to hide secrets in — don't add code that assumes one.

## Bundle size

`yarn build` prints First Load JS per route. Treat it as a user-facing number, and **report the delta for any route you touch** — "no material change" is a valid report, silence is not.

Three traps, all measured in this repo:

- **Barrels must not re-export client components.** The App Router builds each route's client-reference manifest from the import graph, so tree-shaking does not undo it. Re-exporting two client components from one barrel doubled `/contact/success` (190 kB → 394 kB).
- **`shared/` must not construct a heavy third-party client at module scope.** `shared/lib/firebase.ts` calls `getFirestore(app)` at module load, so importing `trackEvent` — which imports `app` from it — drags the whole Firestore SDK in. That cost `/credit` 141 kB → 296 kB until the analytics call was dropped. Construct lazily, or split the module.
- **Prefer a plain element when the behaviour is not needed.** An `<a>` is not a worse link than NextUI's `Link` for an outbound URL, and does not pull in react-aria.

`package.json` declares `"sideEffects": ["**/*.css"]` — only `globals.css` is side-effectful, and that is what lets webpack tree-shake through the barrels.

**Adding a dependency** means recording two things in the plan: its licence, read from its own `package.json` and `LICENSE` file rather than assumed, and its First Load JS cost on the routes that import it. A non-OSI licence gets called out explicitly — GSAP ships under a proprietary no-charge licence while sitting among MIT deps, and `@tsparticles/react` declares no licence field at all.

## Feature-specific notes

- **Planning Poker** (`src/features/planning-poker/`): Firestore-backed. Room state is one doc keyed by the `?room=` query param under `PLANNING_POKER_DB_NAME`; `votes` is a `userId -> PlayerVote` map. Shapes are in `model/poker.ts`. Use `setDoc(..., { merge: true })` for partial updates and `deleteField()` to remove a vote — preserve unrelated keys.
- **Mic Link** (`src/features/mic-link/`): WebRTC peer-to-peer audio with Firestore signalling. Close peer connections and release the wake lock on unmount.
- **Pok Deng** (`src/features/pokdeng/`): the host balance is _derived_ (`pokdengHostCredit`), never stored — that is what keeps the game zero-sum. Covered by `lib/credit.test.ts`.
- **ThreeScene / resume scene**: must fully clean up on unmount — `cancelAnimationFrame`, dispose geometries/materials/textures, stop the animation mixer. Follow the existing disposal pattern; don't reintroduce leaks.

## Spec-driven development

Features are specified before they are built. See [docs/SPEC_DRIVEN_DEVELOPMENT.md](docs/SPEC_DRIVEN_DEVELOPMENT.md).

```
/speckit.specify → /speckit.clarify → /speckit.plan → /speckit.tasks → /speckit.analyze → /speckit.implement
```

Every plan is checked against [the constitution](.specify/memory/constitution.md). Read it before proposing an approach.

## Git & PRs

- Conventional, present-tense commit subjects: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
- Keep commits small and focused. Only commit/push when the user asks.
- Pushing to `master` triggers the GitHub Pages deploy workflow — be deliberate about what lands there.

<!-- SPECIFY:BEGIN active-feature -->
<!-- Managed by .specify/scripts/bash/update-agent-context.sh. Do not edit by hand. -->

## Active feature context

_No active feature. Run `/speckit.specify` to start one._
<!-- SPECIFY:END active-feature -->
