---
description: Generate the ordered, file-specific task list for the current feature.
---

User input:

$ARGUMENTS

1. Run `.specify/scripts/bash/check-prerequisites.sh --json` and parse `FEATURE_DIR` and `AVAILABLE_DOCS`.
2. Read what exists: `plan.md` (required), then `data-model.md`, `contracts/`, `research.md`, `quickstart.md` and `spec.md` as available.
3. Read `.specify/templates/tasks-template.md` for the required shape.
4. Derive tasks from the artifacts, not from imagination:
   - one test task per contract and per acceptance scenario;
   - one model task per entity;
   - one implementation task per component or helper the plan names;
   - integration tasks for storage, analytics and navigation;
   - polish tasks for both themes, keyboard access, and the First Load JS budget.
5. Order them: setup → tests → implementation → integration → polish. **Tests come before the implementation they cover**, per Principle IV. Mark `[P]` only where the files are genuinely disjoint.
6. Every task must name an exact path under `src/`. A task a reader cannot start without asking a question is not finished.
7. Write `FEATURE_DIR/tasks.md`, numbered T001…, with a dependency list and a parallel-execution example.
8. Report the task count, the phase breakdown, and the parallelisable groups.
