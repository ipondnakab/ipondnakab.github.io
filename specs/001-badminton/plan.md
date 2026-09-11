# Implementation plan

Feature: src/features/badminton; route: /badminton. Use pure TypeScript draw and
round-robin helpers, React state, existing FormHookWrapper/InputString and a reusable
RHF select field. Add catalogue entry, sitemap, and five locale dictionaries.
No dependencies. Budget: new route First Load JS below 250 kB; catalogue delta
below 10 kB. Measure baseline and final builds. Avoid analytics import because
it brings Firestore into a local-only tool; catalogue clicks already tracked.

Constitution check: static browser state (I); app -> feature -> shared with
private internals and lint overrides (II); strict types (III); failing tests
before implementation and all four gates (IV); five locales and theme tokens
(V); native accessible controls and no acquired resources (VI); measured bundle,
no dependency additions or component barrel (VII). No exceptions.

Pairing update: preserve all preferred pairs, then pair unmatched players without
gender restrictions. Test unequal groups and fully unmatched rosters before
implementation. No dependencies or UI structure changes; route budget unchanged.

History update: test partner counts and repeated rounds before implementation.
Use history-based partner costs, with bounded candidate draws to reduce repeats;
keep gender preference first. Store immutable draw snapshots in component state
and render accessible native history disclosures with localized copy. No new
packages; keep /badminton below its existing 250 kB budget.

Mobile refinement: add a presentation-only match-card component and responsive
view navigation inside the existing feature. Reuse existing react-icons, theme
colors and form controls. No new dependency, animation or pairing-logic change.
Validate all four gates and review mobile/theme states if a browser is available.
Baseline /badminton First Load JS is 156 kB; retain budget below 250 kB.

Random singles: add a format to draw snapshots and use it to separate singles
opponent history from doubles partner history. Reuse bounded candidate draws and
pair selection, interpreting each selected pair as opposing singles players.
Write failing tests for odd rosters, two-player minimum, opponent variety and
mixed-format history. Expose format controls in both modes and translate help.
Baseline First Load JS: 173 kB; budget remains 250 kB. No dependencies added.

Persistence: centralize session state in a feature hook, with typed versioned
JSON validation and guarded localStorage reads/writes. Test corrupt storage,
blocked/quota failures, round trips and restoration-before-save before coding.
Keep browser reads in effects for static hydration. Update five locales to replace
session-only wording. No dependency; route baseline 173 kB, budget 250 kB.
