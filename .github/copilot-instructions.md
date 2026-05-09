# Copilot instructions for this repository

This file helps Copilot-style assistants work effectively in this Next.js + TypeScript project.

---

## Project-specific instructions for Copilot AI assistant

This repository uses yarn as the package manager — prefer `yarn` commands in suggestions and automation.

## Purpose

Keep a single source of truth describing coding patterns, directory structure, and contributor conventions to make automated and human contributors consistent.

## 1) Build, test, and lint commands

- Local development (dev server):
  - yarn dev
- Build (production):
  - yarn build
- Start (production server):
  - yarn start
- Lint project (all files):
  - yarn lint
  - To fix automatically: yarn lint:fix
- Format (Prettier):
  - yarn format
- Type-check only:
  - npx tsc --noEmit

Single-file targets / quick commands:

- Lint a single file or folder:
  - npx eslint path/to/file.tsx --ext .ts,.tsx
- Format a single file:
  - npx prettier --write path/to/file.tsx
- Run TypeScript check for a single file (useful for diagnostics):
  - npx tsc --noEmit --pretty false && npx eslint path/to/file.tsx --ext .ts,.tsx

Notes:

- There are currently no test scripts in package.json. Add a test runner (Jest/Playwright) if you need per-file test commands.
- This repository uses yarn as the primary package manager; prefer `yarn <script>` over `npm run` when running scripts locally.

---

## 2) High-level architecture

- Framework: Next.js (app may use client components; many components include "use client").
- UI: NextUI + TailwindCSS used across components.
- State / realtime: Firebase (Firestore) is used for the Planning Poker feature (see libs/firebase and constants). Client-side code reads/writes Firestore (onSnapshot, setDoc, getDoc).
- 3D: Three.js is used for a 3D character demo under components/threejs/ThreeScene.tsx. The component mounts a WebGL renderer into a DOM node and loads GLTF models.
- Features of note:
  - Planning poker feature (components/planning-poker/PlanningPoker.tsx) uses a Firestore collection (PLANNING_POKER_DB_NAME) to store rooms, votes, deck settings, and groups.
  - interfaces/ contains TypeScript types (DeckType, PlayerVote, RoomData, GameState, Social, etc.).
  - functions/ contains small client utilities (textToCapital, preventFormSubmit).
- Path alias: imports use the "@/" alias (tsconfig paths -> "@/_": ["./_"]).

Directory entrypoints to inspect when making changes:

- components/planning-poker/PlanningPoker.tsx — Firestore interactions and voting logic (presence handling, setDoc with merge).
- components/threejs/ThreeScene.tsx — Three.js lifecycle, model loading, animation loop.
- libs/firebase.\* — Firebase initialization (uses NEXT*PUBLIC* env vars).

---

## 3) Key conventions and repository-specific patterns

- Environment variables:
  - Public keys are exposed as NEXT*PUBLIC*\* and used in client code. NEVER commit real secrets; use .env locally and .env.example in repo.
  - If you need server-only secrets, add non-public env vars and keep them out of the client bundle.

- Persistence & presence:
  - Planning Poker stores per-room data under a Firestore document keyed by room id (URL query param ?room=<id>).
  - User identity uses localStorage key "poker_user_id" generated with Math.random in the current code; prefer stable UUIDs when improving.
  - Presence cleanup is implemented using window.beforeunload + setDoc(deleteField()). This may be unreliable; preferred approaches are server-side onDisconnect or explicit leave actions.

- Firestore usage patterns:
  - setDoc(..., { merge: true }) is used often to update nested vote objects. When modifying nested objects, be careful to preserve unrelated keys.
  - deleteField() idiom is used to remove a user's vote from the votes map on unload.

- Three.js conventions:
  - ThreeScene mounts a renderer into a ref DOM node and must fully dispose geometries, materials, textures, animation mixers, and cancel RAF on unmount. New changes should follow the disposal pattern already added in this repo.
  - Prefer using typed material/texture guards instead of `any` and ensure map.texture.colorSpace is correctly set when reusing textures.

- TypeScript rules & ESLint:
  - tsconfig has strict: true. Code should avoid `any` where possible and favor explicit interfaces in interfaces/.
  - ESLint rules include unused-imports, @typescript-eslint recommendations, and Prettier formatting. Use npm run lint and npm run format before commits.

- Commit hooks and pre-commit checks:
  - Husky + lint-staged are configured. lint-staged runs ESLint --fix and Prettier on staged files. Keep that in mind when making large auto-formatting edits.

- UI component patterns:
  - NextUI components are used for forms, modals, and controls. Many components are client components ("use client").
  - Keep visual layout in Tailwind classes; TABLE_SLOTS in interfaces/poker.ts holds CSS class positions for a table layout.

---

## 4) Files and rules for Copilot sessions (how assistants should behave)

- Do not modify .env or commit secrets. If a change requires env values, add placeholders to .env.example and instruct the user to populate .env locally.
- When changing Firestore reads/writes, reference interfaces/poker.ts for the correct RoomData shape (votes is a map of userId -> PlayerVote).
- When editing ThreeScene, ensure dispose() + cancelAnimationFrame + mixer cleanup are present; run a memory smoke test by mounting and unmounting the component locally.
- If adding a new third-party dependency that runs in the browser (e.g., a new SDK), verify it does not leak secrets into the client bundle.
- When updating imports, prefer the "@/" path alias for repo-local files.
- Preserve "use client" directives in client components. If a file requires server-only code, move it to server components or API routes.

---

## Auto-fix workflow (DO NOT COMMIT)

When automated fixes are necessary (lint/format/typecheck), follow this workflow so maintainers can review before any commit or push:

1. Run checks locally using yarn (see section 1). Fixes may be generated by eslint --fix or Prettier but DO NOT commit them automatically.

2. Prepare a patch (preferred) and provide it for review instead of committing:
   - After making changes in the working tree, create a patch:
     - git diff > /tmp/fix-<short-desc>.patch
   - Alternatively, to capture staged changes only:
     - git add -N . && git diff --staged > /tmp/fix-<short-desc>.patch

3. Provide the patch and a short summary of the changes in the PR/issue/chat and wait for the maintainer's confirmation.

4. After explicit approval, create a branch and commit the changes:
   - git checkout -b fix/<short-desc>
   - git apply /tmp/fix-<short-desc>.patch # verify locally
   - git add -A
   - git commit -m "fix: <brief description>"
   - git push -u origin fix/<short-desc>

5. If a hotfix must be applied immediately and the maintainers authorize it, commit on a branch and open a draft PR, but always document the reason.

Notes:

- Do not push or open PRs that contain secrets. If a secret appears to have been committed, stop and follow the secret-rotation workflow.

---

## 5) Other repo checks to perform (quick list)

- Check for committed secrets (search for NEXT*PUBLIC* keys or .env). If found, follow the repo's secret-rotation workflow and remove from git history.
- Verify .gitignore contains .env and build artifacts (.next, dist, node_modules).
- Run `yarn lint` and `npx tsc --noEmit` after changes.

---

End notes

This file was generated to help AI assistants work effectively in this codebase. If you want, I can:

- Add a short checklist for reviewing PRs touching Firestore/Three.js.
- Add instructions for running headless checks (e.g., memory profiling for ThreeScene).

Would you like me to add any of those now?

## High-level guidance

1. Be friendly and concise by default (≤100 words).
2. Ask one clarifying question at a time if a request is ambiguous.
3. Keep files small and focused; prefer many small components over large monoliths.

## Project structure

- app/ — Next.js app routes and page-level components
- components/ — shared presentational and container components
- interfaces/ — TypeScript interfaces and small docs (e.g., field-controller.ts)
- libs/ — utilities and SDK wrappers (firebase, etc.)
- constants/, public/, styles/ — static data and assets

## React component conventions

- Use arrow-function components + explicit Props interface:
  - export interface XxxProps { /_ props _/ }
  - const Xxx: React.FC<XxxProps> = ({}) => { ... }
  - export default Xxx;
- Prefer `unknown` instead of `any` where feasible.
- Prefer concrete generics for forms (TFieldValues, TContext).
- Keep components pure; lift state up when needed.

## Forms and field-controller

- Centralize form logic using components/form-hook-wrapper (React Hook Form + zod resolver).
- Use interfaces/field-controller.ts FieldController<T> for declarative field configs:
  - { name, rules }
- Avoid value-transforming register options in FieldController; keep field configs declarative.

## Styling

- Tailwind CSS is used — prefer utility classes for layout and small variations.
- Keep longer styles in small wrapping components or layout files when reuse is needed.

## Imports, linting, and formatting

- eslint-plugin-simple-import-sort enforces import groups and order.
- Run `yarn lint:fix` or save in VSCode to auto-sort imports. VSCode is preconfigured to run organizeImports + eslint fixes on save.
- ESLint + Prettier are integrated.
- Preferred commands:
  1. yarn lint
  2. yarn lint:fix
  3. yarn format
- Use `yarn lint:fix` before committing to apply auto-fixes and import sorting.

## Editor config (VSCode)

- .vscode/settings.json runs:
  - source.organizeImports: true
  - source.fixAll.eslint: true
  - formatOnSave: true
- Recommended extensions: ESLint, Prettier — listed in .vscode/extensions.json.

## Git and PR expectations

- Keep commits focused and small.
- Use present-tense, type-scoped messages (feat:, fix:, chore:, refactor:).
- When this assistant makes commits, include the Co-authored-by trailer:
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
- Run `yarn lint:fix` and `yarn format` before opening a PR.
- Keep changes minimal and document behavioral changes in the PR description.

## When to ask the user

- For large refactors affecting more than 3 files, ask for confirmation first.
- For design decisions such as validation strategy or state management approach.

## Troubleshooting tips

- If ESLint reports parserOptions project errors for non-TS files (e.g., next.config.js), add them to tsconfig.json `include` or adjust parserOptions.project.
- If Prettier doesn’t run, check package.json format script glob and use the repo-wide glob: `"**/*.{js,jsx,ts,tsx,json,css,md}"`.

## Keep this document updated

When patterns change, update this file so future automation and contributors follow the same conventions.
