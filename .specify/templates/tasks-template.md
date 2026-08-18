# Tasks: [FEATURE NAME]

**Input:** the design documents in `specs/[###-feature-slug]/`
**Prerequisites:** `plan.md` (required), `research.md`, `data-model.md`, `contracts/`

## Format

`[ID] [P?] Description` — `[P]` means the task touches files no other pending
task touches, so it can run in parallel. Every task names an exact path.

## Path conventions

This is a single Next.js app. Feature code lives in `src/features/<name>/`,
routes in `src/app/<route>/page.tsx`, cross-cutting code in `src/shared/`.

---

## Phase 3.1: Setup

- [ ] T001 Create the feature module skeleton in `src/features/[name]/`
      (`components/`, `lib/`, `model/`, `index.ts`)
- [ ] T002 [P] Add the feature's types to `src/features/[name]/model/[name].ts`
- [ ] T003 [P] Add copy keys to every locale in `src/shared/i18n/locales/`

## Phase 3.2: Tests first ⚠️ MUST COMPLETE BEFORE 3.3

**These tests must be written and must fail before any implementation.**

- [ ] T004 [P] Unit test for [pure helper] in `src/features/[name]/lib/[helper].test.ts`
- [ ] T005 [P] Unit test for [pure helper] in `src/features/[name]/lib/[helper].test.ts`
- [ ] T006 [P] Component test for [component] in `src/features/[name]/components/[Component].test.tsx`

## Phase 3.3: Core implementation _(only after 3.2 is red)_

- [ ] T007 [P] Implement [pure helper] in `src/features/[name]/lib/[helper].ts`
- [ ] T008 Implement [Component] in `src/features/[name]/components/[Component].tsx`
- [ ] T009 Wire the route in `src/app/[route]/page.tsx` (thin: metadata + component)
- [ ] T010 Export the feature's public types/constants from `src/features/[name]/index.ts`

## Phase 3.4: Integration

- [ ] T011 [Firestore/localStorage] wiring, following the patterns in `docs/CODING_GUIDE.md`
- [ ] T012 Analytics via `trackEvent` from `@/shared/lib/analytics` on the key actions
- [ ] T013 Add the route to `src/shared/config/nav-menu.ts` and/or
      `src/features/mini-project/constants.ts` if it is user-navigable

## Phase 3.5: Polish

- [ ] T014 [P] Verify both themes (dark default and light)
- [ ] T015 [P] Verify keyboard reachability and accessible names
- [ ] T016 Check the route's First Load JS in `yarn build` against the budget in plan.md
- [ ] T017 Run the full gate: `yarn typecheck && yarn lint && yarn test && yarn build`

---

## Dependencies

- Tests (T004–T006) block implementation (T007–T010).
- T007 blocks T008 where the component consumes the helper.
- Everything blocks Polish (T014–T017).

## Parallel example

```
# Launch T004–T006 together — different files, no shared state:
Task: "Unit test for [helper] in src/features/[name]/lib/[helper].test.ts"
Task: "Unit test for [helper] in src/features/[name]/lib/[helper].test.ts"
Task: "Component test for [Component] in src/features/[name]/components/[Component].test.tsx"
```

## Validation checklist

- [ ] Every contract has a corresponding test
- [ ] Every entity has a model type
- [ ] Tests come before implementation
- [ ] `[P]` tasks are genuinely independent
- [ ] Every task names an exact file path
