---
description: Cross-check spec, plan and tasks for inconsistency, gaps and constitution violations.
---

User input:

$ARGUMENTS

Read-only. Do not modify any artifact — report findings and let the user decide.

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` and parse `FEATURE_DIR`.
2. Read `spec.md`, `plan.md`, `tasks.md`, the design docs, and `.specify/memory/constitution.md`.
3. Check for:
   - **Coverage gaps** — a requirement or acceptance scenario with no task; a task with no requirement behind it.
   - **Drift** — the plan solving a different problem from the spec; tasks naming paths the plan does not.
   - **Ambiguity** — `[NEEDS CLARIFICATION]` markers still present; requirements that are not observable.
   - **Constitution violations** — a server-dependent design (I); code landing outside one feature module, or `shared/` importing `features/`, or a barrel re-exporting a client component (II); `any` or inline types (III); implementation tasks ordered before their tests (IV); copy that is not in all five locales, or a dark-only design (V); unreleased resources, or a route with no metadata (VI).
   - **Duplication** — a helper being written that already exists in `src/shared/lib/` or a sibling feature. Check before flagging as missing.
4. Report as a table: ID, severity (Critical / High / Medium / Low), location, the finding, and the recommended fix. Critical = a constitution violation or an uncovered requirement.
5. Finish with a short verdict: is this ready for `/speckit.implement`, and what must change first.
