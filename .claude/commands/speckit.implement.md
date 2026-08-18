---
description: Execute the task list for the current feature.
---

User input:

$ARGUMENTS

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` and parse `FEATURE_DIR` and `AVAILABLE_DOCS`.
2. Read `tasks.md`, `plan.md`, and the design docs that exist. Read `.specify/memory/constitution.md` and `docs/CODING_GUIDE.md` before writing code.
3. Execute phase by phase, in order:
   - Complete each phase before starting the next.
   - Run `[P]` tasks within a phase together where it helps.
   - **Do not write an implementation before its test exists and fails.** Run the test and see it red first; that is the evidence Principle IV asks for.
   - Mark each task `[x]` in `tasks.md` as it completes.
4. Follow the repo's conventions exactly: `React.FC` with an exported `XxxProps` interface, `"use client"` where hooks or browser APIs are used, `@/` imports, types in `model/`, data in `constants`, copy in all five locales.
5. Respect the layering. New code goes in one feature module; `shared/` must not import `features/`; barrels export types/constants/helpers, never client components.
6. If a task turns out to be wrong or blocked, stop and say so rather than inventing a workaround. Finish everything that does not depend on the blocker first.
7. Run the full gate before reporting done:
   ```bash
   yarn typecheck && yarn lint && yarn test && yarn build
   ```
   Report the real results. If something fails, say so with the output.
8. Report: tasks completed, tasks skipped and why, gate results, and the First Load JS delta for the affected route against the plan's budget.
