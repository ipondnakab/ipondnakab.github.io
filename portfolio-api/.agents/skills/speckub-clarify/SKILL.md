---
name: speckub-clarify
description: Clarify or correct SpecKub API documentation from user feedback or review findings. Use for the optional speckub.clarify command with a correction prompt, route prefix, directory, or specific source/spec file.
---

# Clarify and correct API documentation

Read the project-local `.speckub/templates/api.md` and `.speckub/examples/api.md`
when present. The user's explicit task takes precedence, then the custom template
controls presentation, then bundled guidance supplies defaults. Examples teach
style, not endpoint facts. Preserve the required HTTP frontmatter contract and
source evidence regardless of layout changes. Do not force bundled heading names
on a customized template; evaluate equivalent content instead. Replace all
placeholders in real specs. Report incompatible schema requests rather than
silently accepting unsupported fields. Use `/speckub.template` to redesign the
project's template without rewriting endpoint docs.

This is an optional step after a user reviews a spec or supplies corrections; it does not require an AI
validation report first.

Read repository instructions, the selected specifications, and relevant source.
Use the user's prompt, HTTP prefix, repository directory, or source/spec file to
identify scope. Consult `.speckub/scan.md`, `.speckub/relations.md`, and
`.speckub/validation.md` if relevant. Corrections can target the inventory or
relationship map before specs exist. Preserve node identities and check affected
edges and documentation links when updating relationships.
When a correction changes request order, dependency calls, or error responses,
update the affected sequence diagrams alongside prose and tables. Follow
`../speckub-create/references/sequence-diagrams.md` and preserve unrelated flows.
If no actionable correction was supplied, ask what is inaccurate or unclear
instead of inventing changes. Ask only for ambiguities that affect the correction;
continue independent evidence gathering when possible.

Separate an incorrect description from a requested behavior change. Apply
source-backed documentation corrections while preserving endpoint IDs, useful
handwritten sections, and unrelated specs. If the user's correction conflicts
with current code, explain the discrepancy and document intended versus observed
behavior explicitly; do not silently change application code or portray the
desired behavior as implemented. Resolve identity/rename ambiguity before
replacing an ID or deleting a document.

Use the frontmatter contract in `../speckub-create/SKILL.md` when editing specs.
Follow `../speckub-create/references/api-document.md` for detailed contract tables,
evidence, and examples. Update related error/response tables and examples when a
correction affects them, while preserving uncertainty and unrelated content.
Do not read secret environment files or include credential values. A preview
request means propose edits without writing. Otherwise edit only the affected
docs and related inventory/review entries; preserve unrelated findings and
annotations. Mark a finding resolved only when evidence supports that status.

Run the available CLI's deterministic `validate --id ID` with the selected root
and docs directory for changed IDs, or report why it could not run. Summarize the
correction, evidence, remaining questions, and checks. Do not claim runtime tests
or semantic validation occurred unless they actually did; CLI semantic checks
remain `skipped`. Further AI review with `/speckub.validate` stays optional.
