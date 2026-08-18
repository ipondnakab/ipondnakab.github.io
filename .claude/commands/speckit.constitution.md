---
description: Create or amend the project constitution, and propagate the change.
---

User input:

$ARGUMENTS

1. Read `.specify/memory/constitution.md`.
2. Apply the user's amendment. Keep every principle **declarative and testable**: a rule a reviewer cannot check by reading code or running a command does not belong here. Say MUST / MUST NOT / SHOULD deliberately.
3. Every principle keeps a short **Rationale** — a rule whose reason is not written down gets deleted by the next person who finds it inconvenient.
4. Bump the version by semver and update the footer dates:
   - **MAJOR** — a principle is removed or redefined in a way that invalidates existing plans.
   - **MINOR** — a new principle, or materially expanded guidance.
   - **PATCH** — wording, typos, clarification with no change in meaning.
5. Propagate. A constitution change is not done until the documents that expand on it agree:
   - `CLAUDE.md` — the day-to-day rules
   - `docs/CODING_GUIDE.md` — the templates and detail
   - `docs/ARCHITECTURE.md` — the layering
   - `.specify/templates/plan-template.md` — the Constitution check list
   - `.eslintrc.json` — if the rule is mechanically enforceable, enforce it
6. Report: the version bump and why, the sections changed, the files propagated to, and anything a reviewer should look at by hand.
