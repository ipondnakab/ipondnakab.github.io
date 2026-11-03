# Tasks

- [x] Read build failure, constitution, runtime pins, form wrapper and resolver.
- [x] Verify Zod 3.25.76 package.json licence and LICENSE: MIT.
- [x] Add failing regressions for missing Zod declaration/lock and Node major bounds.
- [x] Declare compatible Zod 3 and pin Node 24.x; update yarn.lock with Yarn.
- [x] Verify a fresh frozen-lockfile install and ordered four gates.
- [x] Record route bundle deltas and actual verification results.

Analysis: the plan preserves schema support, matches current runtime pins and
addresses both the reported compiler failure and runtime-selection warning.

## Separate API deployment

- [x] Observe a failing regression for the API's unbounded Node engine.
- [x] Pin API engines to 24.x and document its independent runtime requirement.
- [x] Verify fresh API frozen-lockfile installation, typecheck and API tests.
- [x] Run root typecheck, lint, tests and build; record actual results.
