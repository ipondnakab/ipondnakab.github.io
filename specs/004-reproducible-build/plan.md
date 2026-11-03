# Plan

Declare zod 3.25.76 as a direct runtime dependency and update yarn.lock with
Yarn. The existing wrapper uses ZodTypeDef and @hookform/resolvers 3's Zod 3
API; do not upgrade to Zod 4 or remove schema validation. Installed Zod 3.25.76
package.json declares MIT and its LICENSE file contains the MIT grant, both
read before this change. It is currently an undeclared local package masking
clean-install failures. No new source import: bundle growth budget <= 1 kB per
route versus a baseline build with the current installed modules.

Set engines.node to 24.x to match .nvmrc and both workflow Node pins. Keep pins
unchanged. Vercel documentation confirms package.json controls runtime selection.
Extend runtime.test.ts first to reject unbounded major ranges and missing Zod
manifest/lock entries; observe failure before implementation. Preserve existing
minimum-version dependency checks. Use a fresh install in a temporary checkout
for final verification, rather than the existing node_modules tree.

Constitution check: static export unchanged; no layering/UI/copy/resource changes;
MIT dependency verified locally; tests first and ordered four gates; measure
routes because the form wrapper is shared. Existing portfolio-api changes remain
untouched. No Git mutation or deployment requested.

## Separate API runtime fix

Pin portfolio-api/package.json engines.node to 24.x, matching the existing root
pin. Add a failing root runtime regression that checks the independently deployed
API's range is bounded to the shared major. Document the API Node selection in its
README. No HTTP endpoint changes, so SpecKub endpoint discovery/validation does
not apply. Verify a fresh API install with engines enabled, then its own typecheck
and tests. Run all root gates after the config/test change. No dependency or lock
changes; compare the frontend build to the previously verified root-build log.
Constitution: static frontend and API boundary preserved; no UI/copy/bundle logic,
resources, secrets, dependency additions, Git mutations or deployment.
