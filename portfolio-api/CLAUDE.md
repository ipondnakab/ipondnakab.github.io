# SpecKub instructions for Claude Code

Maintain API documentation as versioned Markdown under `docs/api/`.

When modifying an API route:

- Use `speckub list` to discover endpoint IDs and `speckub inspect <endpoint-id>` to read metadata.
- Keep YAML frontmatter (`specVersion`, `id`, `kind`, `method`, `path`, `summary`, optional `source`) consistent with the implementation.
- Keep endpoint IDs stable, update request/response behavior in Markdown, and check repository-relative source paths.
- Run `speckub validate --id <endpoint-id>` plus relevant application tests.
- Report structural/reference validation separately from semantic correctness; semantic validation is not implemented.

Do not replace existing project-specific instructions without human review.

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
