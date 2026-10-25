# SpecKub instructions for Codex

This repository uses SpecKub Markdown API specifications.

Before changing an HTTP endpoint:

1. Find its endpoint ID with `speckub list` (or `node packages/cli/dist/bin.js list` when working in the SpecKub monorepo).
2. Inspect the current specification using `speckub inspect <endpoint-id>`.
3. Update the relevant endpoint Markdown files (default authoring location `docs/api/`) frontmatter and Markdown body when behavior changes.
4. Preserve stable endpoint IDs unless the endpoint is intentionally replaced.
5. Run `speckub validate --id <endpoint-id>` and the project's tests.
6. Explain any failed checks and never claim semantic verification was performed: the current validator reports semantic checks as skipped.

Do not invent source paths or overwrite existing instructions. Source paths are repository-relative. A spec change is not proof that code implements it.

## AI documentation workflow

Read the matching skill under `.agents/skills/` (installed by `speckub init --agent ...`):

- `speckub-scan/SKILL.md`: `/speckub.scan [prompt, route prefix, or path]` discovers APIs and prepares `.speckub/scan.md`; it does not write endpoint docs.
- `speckub-relations/SKILL.md`: `/speckub.relations [scope]` maps API/service relationships in `.speckub/relations.md` after scan and before create.
- `speckub-create/SKILL.md`: `/speckub.create [scope]` creates or updates docs from inventory and source evidence.
- `speckub-validate/SKILL.md`: optional `/speckub.validate [scope]` performs AI source review, separate from CLI structural checks.
- `speckub-clarify/SKILL.md`: optional `/speckub.clarify [scope or correction]` applies user-directed documentation corrections.

Use the host agent's skill invocation if slash commands are unavailable, or read
the skill file explicitly. Keep existing endpoint IDs and report discovery gaps.

Use `/speckub.template [design request or reference path]` to customize
`.speckub/templates/api.md` and `.speckub/examples/api.md` with the
`speckub-template/SKILL.md` skill. Custom layout never changes the HTTP schema.

Discover specs across the project with `speckub list`; `--docs-dir` is an optional
directory filter. New endpoint docs use `speckub: true` in YAML frontmatter;
legacy unmarked specs remain supported. Keep templates/examples opted out with
`speckub: false`. Preserve existing spec paths and stable IDs.
