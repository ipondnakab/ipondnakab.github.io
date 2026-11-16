# Implementation plan

Record the current effective ESLint rules, then map enabled rules and severities to Oxlint native rules. Use a TypeScript Oxlint config to discover feature folders automatically. Exercise the real CLI in architecture rejection tests, batching fixtures to avoid per-example process startup. Add policy regression fixtures before implementing the config. Preserve Vitest globals: false and ArchUnitTS.

Use Oxfmt JSON configuration with the existing layout settings, explicit import sorting, no package.json field reordering and shared ignore patterns for generated/vendor files. Add format:check to yarn lint so CI retains formatting enforcement previously provided by eslint-plugin-prettier. Update Next 14 build integration to delegate linting to the explicit package gate. Update hooks, all formatting workflows, VS Code recommendations, constitution and current documentation.

Development dependencies: oxlint@1.94.0 and oxfmt@0.79.0. Both installed package.json files declare MIT and both LICENSE files contain the MIT grant. Node 24 satisfies both packages’ ^20.19.0 || >=22.12.0 engines. No imports into product code, hence production tooling bundle budget 0 kB. Pre-existing architecture refactor changes remain intact.

Constitution check: static-first unchanged; one-way dependencies preserved; strict errors retained in the new tool; failing fixtures first; no UI copy/theme/lifecycle changes; ordered local and CI gates maintained; compare static build route sizes. Tool names and build integration are amended as explicitly requested, without weakening lint policy.

## Rule parity

Every enabled rule from the effective legacy frontend config was recorded before
removal. Native mappings retain their original error/warning severity:

- `@typescript-eslint/*` → `typescript/*`, except `no-array-constructor` and `no-unused-expressions`, which use TypeScript-aware native ESLint rules.
- `@next/next/*` → `nextjs/*`; `react-hooks/*` → `react/*`.
- React, accessibility and import rules retain their native counterparts.
- `unused-imports/*` → `no-unused-vars`, preserving `_` exemptions and argument policy; `fix.imports: safe-fix` restores unused-import cleanup without enabling dangerous variable fixes.
- `prettier/prettier` → Oxfmt validation in `yarn lint` and `yarn build`.
- `react/jsx-uses-react` and `react/jsx-uses-vars` → native JSX-aware unused-variable analysis.
- `react/no-deprecated` → native `no-restricted-imports`/`no-restricted-properties` plus a local Oxlint plugin rejecting the three deprecated lifecycle names. The local lifecycle guard also disallows these names on non-React objects; no current code uses them.

Legacy ESLint negated patterns cancelled component restrictions in Oxlint. Generate positive patterns from all other feature folders instead. CLI regression fixtures cover each existing feature, allowed imports, reverse dependencies and barrels.

## Measured scope adjustment

The native Next.js internal-link check correctly flags the Drunkard Game privacy
anchor, which the older ESLint integration missed. Replacing it with Next.js Link
retains navigation while satisfying that existing error rule and adds client
navigation/prefetch support. Its measured First Load JS is 123 → 130 kB (+7 kB).
Allow a 7 kB budget for this route; all other routes retain a 0 kB growth budget
at the reporting precision. The tooling packages themselves have no production
imports. This preserves the lint rule rather than suppressing it to keep the
original budget. The credits data now acknowledges Oxlint/Oxfmt instead of the
removed direct ESLint/Prettier dependencies, reusing its existing descriptions.

## Validation results

- Test-first evidence: the real CLI fixture suite failed with no replacement config, then caught import-pattern/barrel incompatibility before it was fixed.
- `yarn typecheck`: passed (2.01 s reported by Yarn).
- `yarn lint`: passed, no Oxlint warnings/errors; all 336 matched files pass Oxfmt (1.22 s reported by Yarn, including command startup).
- `yarn test`: passed, 26 suites / 220 tests. CLI fixtures cover all 15 existing feature folders, coding rules, React Hooks, Next.js, accessibility, React deprecations, JSX usage and unused-import fixes. The fix regression confirms side-effect imports and unused-variable diagnostics remain intact.
- `yarn build`: passed (15.50 s reported by Yarn), 26 static pages generated. The package script runs the replacement gate before Next.js; Next 14's ESLint-only phase is disabled using `eslint.ignoreDuringBuilds`.
- `yarn list --pattern 'eslint|prettier'`: no matching installed packages remain.
- `git diff --check`: passed. The independently deployed portfolio-api tree is unchanged.
- Oxfmt was applied once across the configured repository scope, followed by a successful check, verifying repeatable formatting. Source differences are formatting/import order plus the documented link/hook/credits fixes and the earlier architecture refactor.
- Constitution amended to 1.2.0; agent instructions, coding guide, architecture docs, plan template, formatting workflows, VS Code configuration and CI commands reviewed and updated.

### First Load JS comparison

Compared against the verified architecture-refactor build immediately preceding
this migration, under the same existing local build configuration. The only
material First Load JS growth is the measured Next.js Link cost explained above.
Values use Next.js reporting precision; the tools add no production imports.

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
| `/drunkard-game`                     | 123 kB  | 130 kB  | +7 kB |
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
