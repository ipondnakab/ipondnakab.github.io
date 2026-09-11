# Tasks

- [x] Specify roster rules and competition assumptions.
- [x] Write and observe failing draw/schedule invariant tests.
- [x] Implement models, pairing, round-robin scheduling and standings.
- [x] Build roster form, mode controls, match cards and competition schedule and standings.
- [x] Add locales, route, catalogue, sitemap and lint boundaries.
- [x] Run typecheck, lint, tests, build in order.
- [ ] Verify both themes in browser (no available browser in this session).
- [x] Record bundle sizes and review changes.

## Preimplementation analysis

Each acceptance requirement maps to tasks above. No backend, dependencies,
or cross-feature private imports required. Round-robin rests and leftovers are explicit.

## Random history follow-up

- [x] Specify session history, reset behavior and best-effort partner variety.
- [x] Observe failing history regression tests, then implement partner costs.
- [x] Add history disclosures, next-round action and clear-history action.
- [x] Update copy in all five locales and run all four gates.
- [x] Record route bundle delta (+1 kB).

## Mobile design refinement

- [x] Match existing crimson palette, rounded cards and soft themed surfaces.
- [x] Separate mobile Players, Play and History views without clearing state.
- [x] Enlarge touch targets and form text, wrap long names and add mobile standings.
- [x] Reuse a presentation-only match card for current, competition and history games.
- [x] Translate new copy into all five locales.
- [x] Pass typecheck, lint, tests and static build; measure bundle delta.
- [ ] Visually verify phone widths and both themes (browser discovery is empty).

## Random singles follow-up

- [x] Specify one-on-one draws, odd-player sit-outs and separate history costs.
- [x] Observe three failing regression tests before implementing singles draws.
- [x] Show format controls in random mode and gender preferences only for doubles.
- [x] Label singles players and history formats; translate copy into all locales.
- [x] Pass all gates and verify route bundle sizes.

## Local storage follow-up

- [x] Define the versioned saved session and corruption/failure behavior.
- [x] Write failing storage and hydration lifecycle tests before implementation.
- [x] Implement validation, guarded storage access and restoration-before-save.
- [x] Persist roster, settings, view, current draws, history and competition results.
- [x] Update storage messages in all five languages.
- [x] Pass all four gates and record the route bundle delta.
