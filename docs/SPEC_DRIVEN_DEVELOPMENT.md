# Spec-Driven Development

This repo is wired for [Spec Kit](https://github.com/github/spec-kit): features
are specified, planned and broken into tasks before they are implemented, and
every plan is checked against a written constitution.

## What is where

| Path                              | What it is                                      |
| --------------------------------- | ----------------------------------------------- |
| `.specify/memory/constitution.md` | The rules every plan is checked against         |
| `.specify/templates/`             | Templates for spec, plan, tasks, checklist      |
| `.specify/scripts/bash/`          | The scripts the slash commands call             |
| `.claude/commands/speckit.*.md`   | The slash commands                              |
| `specs/###-feature-slug/`         | One folder per feature, committed with the code |

## The workflow

```
/speckit.specify   "let a room owner set a round timer"   → specs/00N-…/spec.md
/speckit.clarify                                          → resolves [NEEDS CLARIFICATION]
/speckit.plan                                             → plan.md, research.md, data-model.md, contracts/
/speckit.tasks                                            → tasks.md
/speckit.analyze                                          → cross-check before writing code
/speckit.implement                                        → executes, running the gates
```

Two more, used less often:

- `/speckit.constitution` — amend the rules and propagate the change.
- `/speckit.checklist` — generate a focused review checklist (a11y, i18n, release).

## Why the order matters here

- **`clarify` before `plan`.** The spec template forces `[NEEDS CLARIFICATION]`
  markers instead of plausible guesses. Planning around a guess is the expensive
  mistake this step exists to prevent.
- **`plan` before `tasks`.** The plan names the one feature module the change
  lands in (Principle II). Tasks that do not have that answer sprawl across
  folders.
- **`analyze` before `implement`.** It is read-only and catches the two failures
  that cost the most: a requirement with no task behind it, and a design that
  quietly assumes a server.

## Working without a branch

`create-new-feature.sh` makes a `###-slug` branch by default. To work on the
current branch instead:

```bash
.specify/scripts/bash/create-new-feature.sh --json --no-branch "your description"
export SPECIFY_FEATURE=00N-your-slug   # tells the other scripts which feature
```

`SPECIFY_FEATURE` overrides branch detection everywhere. Without it, the scripts
fall back to the highest-numbered folder in `specs/`.

## The constitution is the point

[`.specify/memory/constitution.md`](../.specify/memory/constitution.md) encodes
what is actually true of this repo — no server at runtime, one-way dependencies
between `app/`, `features/` and `shared/`, four gates before done, copy in five
locales, both themes. `/speckit.plan` ticks each principle explicitly and
anything unchecked has to be justified in the plan's Complexity Tracking table.

Amend it with `/speckit.constitution` rather than editing it in isolation — the
command propagates the change to `CLAUDE.md`, `docs/CODING_GUIDE.md`,
`docs/ARCHITECTURE.md`, the plan template and `.eslintrc.json`.

## Syncing with upstream Spec Kit

These files were hand-authored to match Spec Kit's layout, so they work with no
extra toolchain. To pull upstream's canonical versions later:

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init --here --ai claude
```

Review the diff rather than accepting it wholesale — the constitution and the
templates here are customised to this repo's constraints.
