# Reproducible Vercel build

A clean dependency install must resolve the shared form wrapper's Zod imports.
Preserve its optional schema validation API and existing declarative form rules.
Vercel must select the same Node major (24) as .nvmrc and GitHub Actions rather
than choosing a newer major from an unbounded engines range. Add regression
coverage for the required runtime dependency and bounded Node range.

Acceptance: fresh frozen-lockfile install, compatible Zod 3, typecheck, lint,
tests and static export all succeed. No app behavior, new backend, publication,
commit or push. Record dependency licence and route bundle impact.

## Separate API deployment

The portfolio-api project must also restrict its Node engine to the shared Node
24 major. Its independent >=20 range currently selects Node 26 on Vercel and
fails installation because @renovatebot/pep440 4.2.1 only admits Node 20/22/24.
Keep the dependency lock and endpoint behavior unchanged. Verify a fresh API
frozen-lockfile install under Node 24, API typecheck/tests, and the root gates.
