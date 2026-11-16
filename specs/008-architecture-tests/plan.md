# Plan

Use ArchUnitTS with Vitest and explicit check() assertions to preserve globals: false. Add source-tree structure checks using the installed TypeScript parser where framework-specific rules need AST inspection. Discover features from disk for both tests and ESLint; replace hand-maintained per-feature overrides with generated equivalents. Refactor misplaced helpers and types found by the checks. Do not introduce empty barrels or directories solely for symmetry.

Dependency: archunit, development-only. Verified installed archunit@2.5.5 package.json declares MIT and LICENSE contains the MIT grant. Its root entry throws without global Vitest expect, so use the pinned core files entry with check() and retain globals: false. No production imports; First Load JS budget is 0 kB growth across routes. Compare baseline and final static builds.

Constitution check: static-first unchanged; one-way dependencies strengthened; strict typing and existing lint severities retained; tests fail before refactoring; no user-facing copy/theme changes; no resource lifecycle changes; bundle budget 0 kB. No exceptions. This is cross-cutting maintenance of the existing architecture, rather than a new product feature.

## Validation results

- Test-first: the source architecture suite ran before refactoring and reported five source-structure failures (plus an empty-target check for the component-only prompt-pay feature). Empty private surfaces are now detected from disk rather than enabling allowEmptyTests.
- `yarn typecheck`: passed.
- `yarn lint`: passed, 0 errors; the existing badminton missing-`t` hook dependency warning remains.
- `yarn test`: passed, 26 suites / 214 tests, including 55 architecture checks.
- `yarn build`: passed; all 26 static pages generated.
- Existing CI invokes `vitest run`, so it includes these architecture checks without changing the deployment workflow.
- The ArchUnitTS core subpath is deliberately pinned to 2.5.5 to avoid its root entry's requirement for global Vitest matchers. Review this entry when upgrading the package.
- No browser interaction or visual layout changed. Backend endpoints and portfolio-api files are unchanged.

## Bundle comparison

Baseline and final `yarn build` results use the same existing local build configuration. No material First Load JS change on any route (0 kB delta at Next.js reporting precision). ArchUnitTS is referenced only by tests and adds no production bundle imports.

| Route                                | Before  | After   | Delta |
| ------------------------------------ | ------- | ------- | ----- |
| `/`                                  | 389 kB  | 389 kB  | 0 kB  |
| `/_not-found`                        | 87.9 kB | 87.9 kB | 0 kB  |
| `/apple-icon.png`                    | 0 B     | 0 B     | 0 kB  |
| `/badminton`                         | 191 kB  | 191 kB  | 0 kB  |
| `/contact`                           | 391 kB  | 391 kB  | 0 kB  |
| `/contact/success`                   | 191 kB  | 191 kB  | 0 kB  |
| `/credit`                            | 143 kB  | 143 kB  | 0 kB  |
| `/deepjump`                          | 191 kB  | 191 kB  | 0 kB  |
| `/drunkard-game`                     | 123 kB  | 123 kB  | 0 kB  |
| `/drunkard-game/privacy`             | 146 kB  | 146 kB  | 0 kB  |
| `/icon.png`                          | 0 B     | 0 B     | 0 kB  |
| `/mic-link`                          | 438 kB  | 438 kB  | 0 kB  |
| `/mini-project`                      | 339 kB  | 339 kB  | 0 kB  |
| `/mini-project/badminton/live`       | 337 kB  | 337 kB  | 0 kB  |
| `/mini-project/badminton/scoreboard` | 174 kB  | 174 kB  | 0 kB  |
| `/mini-project/image-type-convert`   | 134 kB  | 134 kB  | 0 kB  |
| `/planning`                          | 466 kB  | 466 kB  | 0 kB  |
| `/pokdeng`                           | 347 kB  | 347 kB  | 0 kB  |
| `/prompt-pay`                        | 326 kB  | 326 kB  | 0 kB  |
| `/resume`                            | 501 kB  | 501 kB  | 0 kB  |
| `/robots.txt`                        | 0 B     | 0 B     | 0 kB  |
| `/sitemap.xml`                       | 0 B     | 0 B     | 0 kB  |
| `/threejs`                           | 331 kB  | 331 kB  | 0 kB  |
