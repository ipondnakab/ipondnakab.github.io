---
description: Generate a focused review checklist for the current feature.
---

User input:

$ARGUMENTS

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` and parse `FEATURE_DIR`.
2. Read `spec.md` and `plan.md`, plus `.specify/memory/constitution.md`.
3. Decide the checklist's subject from `$ARGUMENTS` (e.g. accessibility, i18n, release readiness, Firestore rules). Ask the user only if it is genuinely unclear.
4. Write `FEATURE_DIR/checklists/<subject>.md` from `.specify/templates/checklist-template.md`.
5. Every item must be a question with an **observable** answer — something a reviewer settles by reading a file, running a command, or clicking through the app. Items like "code is clean" are not allowed. Prefer items that name the exact file or command.
6. Ground the items in this feature's actual requirements, not a generic list. Include the constitution constraints that apply.
7. Report the path written and the item count.
