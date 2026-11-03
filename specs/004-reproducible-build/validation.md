# Validation

## Cause and fix

FormHookWrapper imports Zod types and supports @hookform/resolvers/zod, but
package.json and yarn.lock did not declare Zod. Existing local node_modules
contained Zod 3.25.76, masking the failure. Added it as an exact runtime
dependency with a Yarn-generated lock entry; its package.json and LICENSE were
read and both identify MIT. The existing Zod 3 API and form behavior are unchanged.

Set engines.node to 24.x, matching .nvmrc and both workflows. The former

> =22.12.0 range admitted future majors and caused the logged Node 26 selection.
> Official reference: [Vercel Node version overrides](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions#version-overrides-in-packagejson).

## Verification

Two new regressions failed before implementation: missing Zod manifest/lock
entry and an engines range admitting other Node majors. Both now pass.

Created a temporary checkout with no node_modules and successfully ran:

```text
yarn install --frozen-lockfile --offline --ignore-scripts --cache-folder <temporary-cache>
yarn typecheck
yarn lint
yarn test
yarn build
```

The cache read existing complete Yarn package archives; node_modules was freshly
installed rather than symlinked or copied from the working checkout. Lifecycle
scripts were skipped in the temporary checkout, which has no Git repository.
All four gates passed in the required order under Node 24.6.0 / Yarn 1.22.22:
16 test files / 92 tests and 25 statically exported pages. Fresh install resolves
zod 3.25.76 with its own MIT package metadata. No dependency versions other than
the added Zod were changed in yarn.lock.

No Vercel deployment, Git commit or push was performed. The patch is local and
needs to be committed/pushed for the next Vercel build.

## First Load JS

Baseline used the previous source/manifest with its existing installed modules;
final export used the independent frozen-lockfile install. No new application
import was introduced; the shared wrapper already referenced Zod. Both outputs
are recorded below using the rounded Next.js build figures.

| Route                                |  Before |   After | Delta |
| ------------------------------------ | ------: | ------: | ----: |
| `/`                                  |  389 kB |  389 kB |     0 |
| `/_not-found`                        | 87.9 kB | 87.9 kB |     0 |
| `/apple-icon.png`                    |     0 B |     0 B |     0 |
| `/badminton`                         |  191 kB |  191 kB |     0 |
| `/contact`                           |  391 kB |  391 kB |     0 |
| `/contact/success`                   |  191 kB |  191 kB |     0 |
| `/credit`                            |  143 kB |  143 kB |     0 |
| `/deepjump`                          |  191 kB |  191 kB |     0 |
| `/drunkard-game`                     |  123 kB |  123 kB |     0 |
| `/drunkard-game/privacy`             |  146 kB |  146 kB |     0 |
| `/icon.png`                          |     0 B |     0 B |     0 |
| `/mic-link`                          |  438 kB |  438 kB |     0 |
| `/mini-project`                      |  338 kB |  338 kB |     0 |
| `/mini-project/badminton/live`       |  290 kB |  290 kB |     0 |
| `/mini-project/badminton/scoreboard` |  174 kB |  174 kB |     0 |
| `/planning`                          |  466 kB |  466 kB |     0 |
| `/pokdeng`                           |  347 kB |  347 kB |     0 |
| `/prompt-pay`                        |  326 kB |  326 kB |     0 |
| `/resume`                            |  501 kB |  501 kB |     0 |
| `/robots.txt`                        |     0 B |     0 B |     0 |
| `/sitemap.xml`                       |     0 B |     0 B |     0 |
| `/threejs`                           |  331 kB |  331 kB |     0 |

## Separate API deployment runtime

The API has an independent package.json. Its >=20 engine admitted Node 26,
which the locked @renovatebot/pep440 4.2.1 rejects (^20.9.0 || ^22.11.0 || ^24).
The API engine is now 24.x. The root runtime regression failed before this
change and now verifies the separate API remains on the shared bounded major.
No dependency, lockfile or endpoint implementation changed. The API README
documents why its engine must be set independently.

Verified on Node 24.6.0 / Yarn 1.22.22:

- A fresh API node_modules from yarn install --frozen-lockfile --offline
  --ignore-scripts --cache-folder <temporary-cache>; engine checks stayed enabled.
  The unchanged locked pep440 dependency installs successfully. Scripts were
  skipped in the temporary checkout; no install-engine bypass was used.
- API yarn typecheck and yarn test: passed (one mocked-provider test).
- Root yarn typecheck, yarn lint, yarn test (16 files / 93 tests), yarn build:
  passed in order, with 25 static pages exported.
- git diff --check: passed.

HTTP endpoints were not changed, so SpecKub endpoint inspection/validation was
not applicable. No semantic verification is claimed. No production API request,
Vercel deployment, commit or push was performed. This verifies the installation
failure fix, not the earlier live Groq upstream response.

Frontend First Load JS versus the previously verified root-build fix:

| Route                                |  Before |   After | Delta |
| ------------------------------------ | ------: | ------: | ----: |
| `/`                                  |  389 kB |  389 kB |     0 |
| `/_not-found`                        | 87.9 kB | 87.9 kB |     0 |
| `/apple-icon.png`                    |     0 B |     0 B |     0 |
| `/badminton`                         |  191 kB |  191 kB |     0 |
| `/contact`                           |  391 kB |  391 kB |     0 |
| `/contact/success`                   |  191 kB |  191 kB |     0 |
| `/credit`                            |  143 kB |  143 kB |     0 |
| `/deepjump`                          |  191 kB |  191 kB |     0 |
| `/drunkard-game`                     |  123 kB |  123 kB |     0 |
| `/drunkard-game/privacy`             |  146 kB |  146 kB |     0 |
| `/icon.png`                          |     0 B |     0 B |     0 |
| `/mic-link`                          |  438 kB |  438 kB |     0 |
| `/mini-project`                      |  338 kB |  338 kB |     0 |
| `/mini-project/badminton/live`       |  290 kB |  290 kB |     0 |
| `/mini-project/badminton/scoreboard` |  174 kB |  174 kB |     0 |
| `/planning`                          |  466 kB |  466 kB |     0 |
| `/pokdeng`                           |  347 kB |  347 kB |     0 |
| `/prompt-pay`                        |  326 kB |  326 kB |     0 |
| `/resume`                            |  501 kB |  501 kB |     0 |
| `/robots.txt`                        |     0 B |     0 B |     0 |
| `/sitemap.xml`                       |     0 B |     0 B |     0 |
| `/threejs`                           |  331 kB |  331 kB |     0 |
