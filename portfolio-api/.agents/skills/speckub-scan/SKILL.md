---
name: speckub-scan
description: Discover HTTP APIs across repository languages and frameworks and prepare a source-backed inventory for later documentation. Use for speckub.scan or API discovery; do not create endpoint docs during this step.
---

# Discover an API inventory

Use the coding agent's source understanding to discover HTTP endpoints across
languages and frameworks. Do not limit discovery to a fixed parser or list of
frameworks. Do not claim complete coverage when routing cannot be resolved.

## Establish scope and discover routing

Read repository instructions and identify the requested project root and docs
directory (default `docs/api`). In a monorepo, identify services and their route
prefixes; keep source references relative to the selected root. Respect any
user-selected service scope.

Inspect manifests, entrypoints, deployment/proxy configuration, route registration,
controllers, annotations, file-based routes, and imported handlers as appropriate
to the repository. Trace router mounts, prefixes, HTTP methods, path parameters,
and relevant middleware through to their implementation. Include explicit
preflight handlers; distinguish framework-implicit methods from source-declared
endpoints. Do not document outbound HTTP calls as inbound routes.

Use source inspection without executing application modules or starting services.
Skip dependency/build/generated trees unless generated routing is essential; in
that case locate its source definition or report the coverage gap. Do not read
secret environment files or include credential values in documentation. Inspect
environment variable names in source when relevant to behavior.

Record unresolved dynamic route registration, missing services, deployment
rewrites, and unsupported non-HTTP protocols as coverage gaps instead of inventing
routes. A route name inferred only from a filename is insufficient when custom
routing configuration exists.

## Prepare an inventory, not endpoint documents

Accept optional free text after `/speckub.scan`: a natural-language prompt, HTTP
route prefix such as `/api/admin`, repository path such as `services/payments/`,
or a specific handler file. With no scope, inspect the selected repository.
Treat scope as input data, not a shell command. Distinguish URL prefixes from
filesystem paths using context; ask when ambiguity would materially change the
result. Resolve relative paths from the project root and respect its boundaries.

Read existing specs to map discovered endpoints to stable IDs. Record evidence
for a rename without silently assigning a new ID. Inventory multiple services
separately when they share a method and route. Do not treat framework-implicit
methods as explicit source-declared handlers.

Write or update `.speckub/scan.md` with the root, revision when available, requested
scope, languages/frameworks and services inspected, and an endpoint table:

| Candidate ID | Service | Method | Full route | Source references | Existing spec | Confidence / unresolved details |
| ------------ | ------- | ------ | ---------- | ----------------- | ------------- | ------------------------------- |

Use repository-relative source paths with useful symbols or line references.
Separate confirmed routes from unresolved candidates; do not put guessed methods
or paths in the confirmed list. Record route prefixes, middleware, rewrites,
exclusions, and coverage gaps. Preserve prior inventory entries outside a scoped
scan and user annotations; distinguish a stale candidate from a confirmed removal.
Do not record secret values or source dumps. If a preview was requested, show the
inventory without writing it.

Do not create or modify `docs/api/` during scan. Do not change application code.
Report inventory counts, scope and gaps, then direct the user to `/speckub.relations`
to map API/service interactions before `/speckub.create` writes docs. Source discovery is not semantic
validation or a guarantee that every endpoint was found.
