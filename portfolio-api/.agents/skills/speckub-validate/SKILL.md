---
name: speckub-validate
description: Review SpecKub API specifications against source using an AI agent, optionally scoped by prompt, route prefix, directory, or file. Use for the optional speckub.validate review, separate from CLI structural validation.
---

# Review API specifications against source

Read the project-local `.speckub/templates/api.md` and `.speckub/examples/api.md`
when present. The user's explicit task takes precedence, then the custom template
controls presentation, then bundled guidance supplies defaults. Examples teach
style, not endpoint facts. Preserve the required HTTP frontmatter contract and
source evidence regardless of layout changes. Do not force bundled heading names
on a customized template; evaluate equivalent content instead. Replace all
placeholders in real specs. Report incompatible schema requests rather than
silently accepting unsupported fields. Use `/speckub.template` to redesign the
project's template without rewriting endpoint docs.

Use `../speckub-create/references/api-document.md` as the completeness and quality
checklist. Report missing contract details, inconsistent examples, unsupported
claims, and hidden unknowns; do not require irrelevant boilerplate. These are AI
findings, not checks performed by the deterministic CLI.

This is the optional AI review step. Read repository instructions and existing
specs in the requested docs directory (default `docs/api`). Accept a prompt,
HTTP prefix, repository directory, or specific source/spec file as scope. With no
scope, review the available specs. Resolve ambiguity before reviewing unrelated
services. If no specs match, report that there is nothing to review and suggest
`/speckub.scan` followed by `/speckub.create`; do not claim a successful review.

Trace each selected endpoint's method, full route, routing prefixes, middleware,
input validation, authentication, responses/status codes, and side effects to
source. Adapt to the repository's languages and frameworks. Flag missing source,
dynamic registration, configuration-dependent behavior, and deployment rewrites
as uncertainty. Never infer semantic correctness from the CLI exit code.

Read `.speckub/relations.md` when present. Check documented relationships against
its nodes, edges, inventory identities, and source call sites. Report dangling
references, reversed calls, unsupported deployment boundaries, stale edges, and
inferences presented as facts. These are AI findings; the CLI does not validate
the relationship artifact.

Review `Request flow` sequence diagrams against actual call order, conditions,
responses, and relationship identities. Use the guidance in
`../speckub-create/references/sequence-diagrams.md`. Flag missing diagrams or an
unexplained omission, invented participants, incorrect status codes, unsupported
retries/concurrency, and stale branches. Check rendering when an existing renderer
is available; otherwise report render checks as not run. CLI validation does not
parse Mermaid or prove sequence correctness.

Use the available SpecKub CLI to run `list` and `validate --id ID` with the correct
`--root` and `--docs-dir`. Keep deterministic findings separate from AI findings.
If the CLI is unavailable, report that check as not run. Do not execute application
modules, call external APIs, or run runtime tests unless the user authorized it.
Do not read secret files or change application code or endpoint docs during review.

Write a review to `.speckub/validation.md`, preserving findings outside the selected
scope, or return it in chat for a read-only/preview request. For each finding state
the spec/ID, severity, documented claim, source evidence, mismatch or uncertainty,
and suggested correction. Distinguish confirmed mismatches from unresolved
questions. Record reviewed scope, revision when available, checks run, skipped
checks, and coverage gaps. A clean review means no discrepancies were found in
the inspected scope, not proof that the whole API is correct.

Do not change CLI reports to claim semantic checks passed: the CLI's semantic
check remains `skipped`. Report AI source review separately. Suggest
`/speckub.clarify` for corrections; it is optional and never runs automatically.
