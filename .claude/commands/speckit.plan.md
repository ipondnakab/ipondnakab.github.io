---
description: Produce the implementation plan and design artifacts for the current feature.
---

User input:

$ARGUMENTS

1. Run `.specify/scripts/bash/setup-plan.sh --json` from the repo root and parse `FEATURE_SPEC`, `IMPL_PLAN` and `SPECS_DIR`. All paths must be absolute.
2. Read `FEATURE_SPEC` in full, and read `.specify/memory/constitution.md`.
3. If the spec still contains `[NEEDS CLARIFICATION]` markers, stop and tell the user to run `/speckit.clarify` first — unless they explicitly ask you to proceed on stated assumptions, in which case record those assumptions in the plan.
4. Fill in `IMPL_PLAN` from the template:
   - **Technical Context** — name the actual dependencies, storage and route. Set a First Load JS budget for the affected route; get today's number from `yarn build`.
   - **Constitution check** — tick each box or explain the gap under Complexity Tracking. Pay particular attention to Principle II: name the one feature module this lands in.
   - **Project structure** — the exact paths under `src/features/<name>/` and `src/app/<route>/`.
5. **Phase 0** — write `research.md`: every unknown resolved as Decision / Rationale / Alternatives considered. Prefer patterns already in this repo over new ones; check how a sibling feature solved the same problem before inventing.
6. **Phase 1** — write `data-model.md` (entities, fields, validation, and where they land in `model/`), `contracts/` (Firestore document shapes and rules, or portfolio-api request/response), and `quickstart.md` (how to run and exercise the feature).
7. Run `.specify/scripts/bash/update-agent-context.sh claude` to refresh the managed block in `CLAUDE.md`.
8. Report the artifacts written, the module the feature lands in, and any unchecked constitution boxes.

Do **not** write `tasks.md` here — that is `/speckit.tasks`.
