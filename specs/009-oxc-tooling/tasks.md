# Tasks

- [x] Add regression tests against the actual Oxlint CLI and observe failure before configuration exists.
- [x] Install and license-review Oxlint/Oxfmt; map old enabled rules and document any equivalent checks.
- [x] Replace configurations, scripts, editor settings, hooks and CI commands; remove old direct dependencies.
- [x] Adapt architecture rejection tests to Oxlint and verify allowed imports as well as prohibited ones.
- [x] Apply Oxfmt, review changes, and fix genuine diagnostics without weakening policy.
- [x] Update constitution, templates and development documentation.
- [x] Run typecheck, lint (including format check), tests and static build in order; compare bundle sizes.

## Analysis

All requirements have corresponding tasks. Preserve independently deployed backend behavior. Existing architecture tests remain the source-graph gate, with actual CLI fixture tests providing rejection evidence for the replacement configuration.
