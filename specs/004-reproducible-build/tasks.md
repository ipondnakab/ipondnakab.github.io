# Tasks

- [x] Read build failure, constitution, runtime pins, form wrapper and resolver.
- [x] Verify Zod 3.25.76 package.json licence and LICENSE: MIT.
- [x] Add failing regressions for missing Zod declaration/lock and Node major bounds.
- [x] Declare compatible Zod 3 and pin Node 24.x; update yarn.lock with Yarn.
- [x] Verify a fresh frozen-lockfile install and ordered four gates.
- [x] Record route bundle deltas and actual verification results.

Analysis: the plan preserves schema support, matches current runtime pins and
addresses both the reported compiler failure and runtime-selection warning.
