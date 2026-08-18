---
description: Find and resolve the underspecified parts of the current feature spec.
---

User input:

$ARGUMENTS

Goal: turn the `[NEEDS CLARIFICATION]` markers (and anything else materially ambiguous) into settled decisions recorded in the spec, before any planning happens.

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` and parse `FEATURE_DIR` and `FEATURE_SPEC`.
2. Read the spec. Build a list of ambiguities across: scope boundaries, user roles, data shape and retention, error and empty states, offline behaviour, limits and quotas, and anything the constitution constrains (static export, locales, themes, accessibility).
3. Ask the user **at most five** questions, one at a time, highest-impact first. Each must be answerable from a short list of concrete options — offer them. Skip anything you can settle from the repo itself; check the code before asking.
4. After each answer, immediately update `FEATURE_SPEC`: remove the corresponding `[NEEDS CLARIFICATION]` marker, fold the decision into the relevant section, and record the question and answer under a `## Clarifications` section with today's date.
5. Stop early when no material ambiguity remains — do not pad to five questions.
6. Report: the questions asked, how the spec changed, and any markers you deliberately left (with why).
