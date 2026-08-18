# Implementation Plan: [FEATURE NAME]

**Branch:** `[###-feature-slug]` | **Date:** [DATE] | **Spec:** [spec.md](./spec.md)
**Input:** the feature specification in this folder.

## Summary

[One paragraph: what is being built, and the technical approach in one sentence.]

## Technical Context

**Language / version:** TypeScript 5 (strict), React 18, Next.js 14 App Router
**Primary dependencies:** [NextUI, Tailwind, framer-motion, ... — list only what this feature adds or leans on]
**Storage:** [Firestore collection / localStorage key / none]
**Testing:** Vitest + Testing Library (`yarn test`)
**Target platform:** static export to GitHub Pages — no server at runtime
**Project type:** single Next.js app (`src/app`, `src/features`, `src/shared`)
**Performance goals:** [e.g. no increase in the route's First Load JS beyond X kB]
**Constraints:** [e.g. must work offline / must not add a new top-level dependency]
**Scale/scope:** [e.g. one new feature module, 6 components]

## Constitution check

Confirm against [the constitution](../../.specify/memory/constitution.md). Any
box left unchecked needs a justification in Complexity Tracking below.

- [ ] **I. Static-first** — no server runtime, API routes or server-only secrets
- [ ] **II. Feature-module boundaries** — new code lives in one `src/features/<name>/`;
      `shared/` does not import `features/`; cross-feature access goes through the barrel
- [ ] **III. Typed and linted** — no `any`, no stray `console.*`, `interface` for object shapes
- [ ] **IV. Verified before done** — `yarn typecheck && yarn lint && yarn test && yarn build`
- [ ] **V. Localised and themed** — copy in all locales, legible in dark and light
- [ ] **VI. Accessible and measured** — keyboard reachable, named, analytics on key actions

## Project structure

### Documentation (this feature)

```
specs/[###-feature-slug]/
├── spec.md              # /speckit.specify
├── plan.md              # this file (/speckit.plan)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # /speckit.tasks
```

### Source (repository)

```
src/features/[feature-name]/
├── components/          # UI, one component per file, PascalCase
├── lib/                 # pure helpers + their *.test.ts
├── model/               # types and interfaces
├── constants.ts         # or constants/ when it grows
└── index.ts             # public API: types, constants, helpers (never components)

src/app/[route]/page.tsx # thin route wrapper: metadata + the feature component
```

**Structure decision:** [name the feature module this lands in, and why]

## Phase 0: Outline & research

1. Extract every `[NEEDS CLARIFICATION]` from the spec into a research question.
2. For each unknown: what are the options, what does this repo already do, and
   what is the decision?
3. Record in `research.md` as **Decision / Rationale / Alternatives considered**.

**Output:** `research.md` with no unknowns left.

## Phase 1: Design & contracts

1. **Data model** (`data-model.md`) — the entities, their fields and validation
   rules, and how they map to `src/features/<name>/model/`.
2. **Contracts** (`contracts/`) — for Firestore, the document shape and the
   rules that must hold; for the portfolio API, the request/response shape.
3. **Quickstart** (`quickstart.md`) — how a developer runs and exercises the
   feature locally.
4. **Agent context** — run `.specify/scripts/bash/update-agent-context.sh claude`.

**Output:** `data-model.md`, `contracts/`, `quickstart.md`, refreshed CLAUDE.md.

## Phase 2: Task planning approach

_Described here; actually executed by `/speckit.tasks`._

- Derive one task per contract, per entity and per acceptance scenario.
- Tests for pure logic come before the implementation that satisfies them.
- Mark `[P]` on tasks that touch disjoint files and can run in parallel.

## Complexity tracking

_Only fill this in if a Constitution check box is unchecked._

| Violation | Why it is needed | Simpler alternative rejected because |
| --------- | ---------------- | ------------------------------------ |
|           |                  |                                      |

## Progress tracking

- [ ] Phase 0: research complete
- [ ] Phase 1: design complete
- [ ] Phase 2: task planning approach described
- [ ] Constitution check passed
- [ ] All `[NEEDS CLARIFICATION]` resolved
