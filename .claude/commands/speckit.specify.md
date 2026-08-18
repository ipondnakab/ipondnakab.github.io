---
description: Create or update the feature specification from a natural-language description.
---

The user input to you can be provided directly by the agent or as a command argument — you **MUST** consider it before proceeding.

User input:

$ARGUMENTS

Given that feature description, do this:

1. Run `.specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS"` from the repo root and parse the JSON for `BRANCH_NAME`, `SPEC_FILE` and `FEATURE_DIR`. All paths must be absolute.
   - If the user does not want a new branch, pass `--no-branch` and set `SPECIFY_FEATURE` to the returned `BRANCH_NAME` for the rest of the session.
2. Read `.specify/templates/spec-template.md` to understand the required sections.
3. Read `.specify/memory/constitution.md`. The spec's non-functional requirements must reflect the constraints that apply to this repo (static export, i18n across all five locales, both themes, accessibility).
4. Write the specification to `SPEC_FILE`, replacing the template placeholders with concrete content derived from the description while preserving the section order and headings.
5. Be rigorous about ambiguity. Anything the description does not settle gets an explicit `[NEEDS CLARIFICATION: <the specific question>]` marker rather than a plausible guess. Under-specification is the failure mode this step exists to catch.
6. Keep the spec free of implementation detail: no library names, file paths, component names or schemas. Describe what a user can do and how you would observe it.
7. Report back with the branch name, the spec path, the count of `[NEEDS CLARIFICATION]` markers, and readiness for `/speckit.clarify`.

**Note:** the script creates the branch and the spec file before writing. Always run it first.
