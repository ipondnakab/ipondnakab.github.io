# Validation

Passed in order: `yarn typecheck`, `yarn lint`, `yarn test` (16 files, 90 tests),
and `yarn build` (25 static pages, isolated copy of current source/configuration).
`git diff --check` passes. No dependencies, deployment or commit added.

## Regenerated atlas and scale regression

Built-in ImageGen regenerated the tabby atlas from v1, keeping its identity and
using a standing idle/grooming pose to match walking. Active asset:
`public/images/khunkao/tabby-atlas-v2.png` (1254 × 1254 RGBA, 1,935,016 bytes).
Original v1 is retained. Exact regeneration prompt: sprite-art-v2.md.

Artwork was inspected directly. Read-only PNG inspection confirmed 779,373 fully
transparent pixels and measured sixteen visible bounds. Transparent gutters
determine column boundaries; crop metadata includes translucent whiskers and
uses fixed row ground lines plus a common column anchor offset. Scale remains
0.35 and the canvas remains 112px. No bitmap resampling/stretching was performed.

The new size regression failed against v1 and passes against v2: all walking,
grooming and reply frames stay within 5% of idle visible height and 10% of idle
width. Idle drawing height is 86.45px; walking is 83.30–84.70px (under 4% variation
from idle), with the shared ground line at 108px. Existing crop bounds, baseline,
looping, reduced-motion, image/canvas failure, timer cleanup, background pause
and single-cat entrance/dismissal tests all pass.

Browser discovery returns no connected browsers. Actual in-page playback, both
colour themes and mobile layout remain visually unverified; canvas tests use a
mocked drawing context. Artwork inspection does not replace browser QA.

## Bundle and asset cost

The active atlas grows from 1,796,925 to 1,935,016 bytes (+138,091 bytes, about
0.14 MB), still within the 2 MB artwork budget. It is a separate image request
after hydration for a non-dismissed session and is not included in First Load JS.
No player/runtime logic changed; the atlas URL is versioned to load the new art.

First Load JS compared with the v1 sprite build (rounded values):

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
