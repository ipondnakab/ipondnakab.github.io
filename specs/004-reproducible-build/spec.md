# Reproducible Vercel build

A clean dependency install must resolve the shared form wrapper's Zod imports.
Preserve its optional schema validation API and existing declarative form rules.
Vercel must select the same Node major (24) as .nvmrc and GitHub Actions rather
than choosing a newer major from an unbounded engines range. Add regression
coverage for the required runtime dependency and bounded Node range.

Acceptance: fresh frozen-lockfile install, compatible Zod 3, typecheck, lint,
tests and static export all succeed. No app behavior, new backend, publication,
commit or push. Record dependency licence and route bundle impact.
