# Tasks

- [x] Read the constitution and document the single-cat/reference-art requirements.
- [x] Generate transparent tabby atlas with built-in ImageGen; inspect it, persist
      the original bitmap and record the exact generation prompt in sprite-art.md.
- [x] Measure frame bounds/anchors, including translucent whiskers, without
      modifying the generated pixels.
- [x] Observe failing frame-selection/layout and sprite-player regression tests.
- [x] Implement canvas playback, facing, readiness, reduced motion, background
      pause and cleanup; remove the unused procedural model/pose code.
- [x] Preserve one automatic entrance, same instance across chat toggles,
      dismiss-only delayed departure, session dismissal and blocked-storage fallback.
- [x] Format; pass typecheck, lint and all 89 tests in order.
- [x] Finish production build and record all route/asynchronous asset costs.
- [ ] Verify actual in-page animation, dark/light themes and mobile layout.

Analysis: every acceptance condition has an implementation/test task. The plan
passes the constitution without exceptions. Existing portfolio-api edits remain
untouched. Browser discovery returns no connected browsers, so actual browser
visual QA remains unavailable; generated artwork and PNG/frame metadata were
inspected directly.

## Consistent scale regeneration

- [x] Regenerate tabby atlas with standing idle/grooming and the same physical scale.
- [x] Inspect alpha bounds and observe the size-regression test fail against v1.
- [x] Update v2 source URL, sixteen crop rectangles and ground/column anchors.
- [x] Run typecheck, lint, tests and build; report route and active asset costs.
- [ ] Verify playback in-page when a browser is connected.
