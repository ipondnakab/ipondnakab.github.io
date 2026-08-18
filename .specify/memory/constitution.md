# ipondnakab.github.io Constitution

The non-negotiable rules for this repository. `/speckit.plan` checks every plan
against these principles, and `/speckit.analyze` flags any spec, plan or task
that contradicts them. When a principle genuinely has to be broken, the plan
must record it under **Complexity Tracking** with the simpler alternative that
was rejected and why.

---

## Core Principles

### I. Static-first — there is no server

The site ships as `output: "export"` to GitHub Pages. There is no server tier at
runtime, and this is a boundary, not a preference.

- MUST NOT add API routes (`app/api/**`), server actions, `getServerSideProps`,
  or middleware that needs a running server.
- MUST NOT assume a server-only secret exists. Everything reachable from the
  bundle is public; all config is `NEXT_PUBLIC_*` read through
  `src/shared/config/environment.ts`.
- Data access happens in the browser (Firebase, `fetch`) inside `"use client"`
  code. Anything needing a real backend goes to the separate `portfolio-api/`
  Vercel project and is reached over `NEXT_PUBLIC_API_BASE_URL`.
- Browser-only code MUST be guarded (`typeof window !== "undefined"`) so
  prerendering does not break.

**Rationale:** the deploy target cannot run code. A plan that assumes a server
does not fail at review — it fails in production, silently, at build time.

### II. Feature modules with one-way dependencies

Code is organised by feature, not by file type. The dependency graph points one
way and is enforced by ESLint, not by convention.

```
src/app/        routes: thin pages, metadata, composition
src/features/   one folder per feature: components/ lib/ model/ constants
src/shared/     cross-cutting: ui/ layouts/ providers/ seo/ lib/ config/ i18n/ types/
```

- `app/` MAY import `features/` and `shared/`.
- `features/` MAY import `shared/`, and MAY import another feature **only**
  through its barrel (`@/features/<name>`) or a component path
  (`@/features/<name>/components/<Component>`).
- `shared/` MUST NOT import `features/` or `app/`. When the shell needs a
  feature (as `DefaultLayout` needs the chat widget), invert it: expose a slot
  and let `app/` pass the component in.
- A feature's `lib/`, `model/` and `constants` are private. Outside consumers go
  through `index.ts`.
- Barrels export types, constants and pure helpers — **never client
  components**. In the App Router every client component reachable from a barrel
  is registered in that route's client-reference manifest, so re-exporting them
  drags the whole feature into any route that touches the barrel.

**Rationale:** a spec maps to exactly one feature module, so "what does this
change touch?" has an answer before the work starts.

### III. Typed, linted, and no escape hatches

`.eslintrc.json` enforces these as errors and `next build` runs them, so a
violation breaks the deploy. They MUST NOT be downgraded to warnings to make a
build pass.

- No `any` — use `unknown` and narrow, or write the type.
- No `console.*` except `warn` and `error`.
- No unused imports or vars (prefix a deliberate one with `_`).
- No `../` parent imports — use the `@/` alias.
- `interface` for object shapes; `===`; `const`; object shorthand.
- Types live in `model/` (feature) or `src/shared/types/` (cross-cutting), never
  inline in a component. Static data tables live in `constants`, never inline.

### IV. Verified before done

A change is done when all four gates pass, in this order:

```bash
yarn typecheck   # tsc --noEmit
yarn lint        # eslint
yarn test        # vitest run
yarn build       # next build — the static export
```

- Pure logic in `lib/` MUST have tests. They live beside the code as
  `<name>.test.ts` and import through `@/`.
- Tests for a behaviour MUST be written before the implementation that
  satisfies them, and MUST be seen failing first.
- "It compiles" is not evidence. If a gate was skipped, the change is not done
  and the report MUST say so.
- The gates MUST run in CI, not only on a developer's machine. The Pages
  workflow MUST run `typecheck`, `lint` and `test` before `build`; a red gate
  MUST block the deploy.

**Rationale:** a gate that only runs where someone remembers to run it is a
convention, not a gate. Installing the test tooling in CI and never invoking it
is the worst of both — the cost without the protection.

### V. Localised and themed, or it is not shipped

- Every user-facing string goes through `react-i18next` and MUST exist in all
  five locales in `src/shared/i18n/locales/` (`en`, `th`, `ja`, `sv`, `zh`).
  English is the fallback; a missing key is a bug, not a graceful degradation.
- The default theme is `dark`; light MUST also be legible. Use NextUI theme
  tokens (`primary`, `background`, `foreground`) from `tailwind.config.ts`
  rather than hard-coded hex.
- Localised data tables use `LocalizedText` and resolve via
  `localize`/`localizeText` from `@/shared/lib/localize`.

### VI. Accessible, measured, and cleaned up

- Interactive elements MUST be keyboard reachable and carry an accessible name.
  Respect `prefers-reduced-motion` (`useReducedMotion`) wherever motion is used.
- Meaningful user actions SHOULD emit `trackEvent` from `@/shared/lib/analytics`.
- Anything that acquires a resource MUST release it: `onSnapshot`
  unsubscribes, `RTCPeerConnection` closes, wake locks release, and Three.js
  scenes `cancelAnimationFrame` and dispose geometries, materials and textures.
  Leaks here are a known past bug in `ThreeScene` — follow its disposal pattern.
- Routes carry `metadata` (title, description, canonical). A new user-navigable
  route is added to `src/shared/config/nav-menu.ts` and/or the mini-project
  catalogue.

### VII. Bundle cost is measured, not assumed

Every visitor downloads this site's JavaScript before it works. First Load JS is
therefore a feature, and it is verified rather than hoped for.

- A change that touches a route MUST report that route's First Load JS delta
  from `yarn build`. "No material change" is a valid report; silence is not.
- A plan that grows a route MUST state the number and justify it, or set a
  budget in its Technical Context and stay inside it.
- A module in `shared/` MUST NOT construct a heavy third-party client at module
  scope when a lighter consumer would inherit it. Construct it lazily, or split
  the module so each consumer pays only for what it imports.
- Barrels MUST NOT re-export client components (see Principle II) — the App
  Router's client-reference manifest is built from the import graph, so
  tree-shaking does not undo it.
- Reach for a plain element over a component library primitive when the
  behaviour is not needed. An `<a>` is not a worse link than `Link` for an
  outbound URL.

**Rationale:** these costs are invisible in code review and obvious in the build
output. Measured twice in this repo: re-exporting two client components from one
barrel doubled `/contact/success` (190 kB → 394 kB), and importing `trackEvent`
pulled the whole Firestore SDK into `/credit` (141 kB → 296 kB) because
`shared/lib/firebase.ts` calls `getFirestore(app)` at module scope.

---

## Additional Constraints

- **Package manager is yarn.** `yarn.lock` is committed; never introduce
  `package-lock.json`.
- **The Node runtime is pinned in three places and they MUST agree.**
  `engines.node` in `package.json` declares the supported floor, `.nvmrc` pins
  the exact version for local work, and the workflow's `node-version` pins the
  same version for CI. The pin MUST satisfy the floor, and the floor MUST
  satisfy every dependency's own `engines.node`. Checked by
  `src/shared/config/runtime.test.ts`. _A Node 20 runner against a dependency
  requiring >=22 broke the deploy once; that is the failure this prevents._
- **A new dependency MUST be justified on two axes before it lands:** its
  licence, read from its own `package.json` and `LICENSE` file rather than
  assumed, and its First Load JS cost on the routes that import it. Record both
  in the plan. Anything that is not an OSI licence MUST be called out
  explicitly, not absorbed silently. _GSAP ships under a proprietary no-charge
  licence while sitting among MIT dependencies, and `@tsparticles/react`
  declares no licence field at all._
- **`sideEffects` in `package.json`** is what lets webpack tree-shake through
  the barrels. Only `**/*.css` is side-effectful; keep it that way.
- **Never commit or print secrets.** `.env` is git-ignored and CI generates it
  from GitHub Actions secrets.
- **Pushing to `master` deploys.** Be deliberate about what lands there.

## Development Workflow

1. `/speckit.specify` — write the spec (WHAT and WHY, no HOW).
2. `/speckit.clarify` — resolve `[NEEDS CLARIFICATION]` markers before planning.
3. `/speckit.plan` — technical approach, checked against this constitution.
4. `/speckit.tasks` — an ordered, file-specific task list, tests first.
5. `/speckit.analyze` — cross-check spec, plan and tasks for drift.
6. `/speckit.implement` — execute, running the Principle IV gates.

Specs live in `specs/###-feature-slug/` and are committed alongside the code
they describe.

## Governance

This constitution supersedes ad-hoc practice. `CLAUDE.md` and
`docs/CODING_GUIDE.md` are the day-to-day expansion of it; where they disagree,
this file wins and the other MUST be corrected.

Amendments require: the change, the rationale, and a pass over `CLAUDE.md`,
`docs/CODING_GUIDE.md` and `.specify/templates/` so the guidance stays
consistent. Version bumps follow semver — MAJOR for a removed or redefined
principle, MINOR for a new principle or materially expanded guidance, PATCH for
clarifications.

**Version:** 1.1.0 | **Ratified:** 2026-08-18 | **Last amended:** 2026-08-18
