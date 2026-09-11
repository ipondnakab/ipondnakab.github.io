# Validation

- Observed new round-robin tests fail against the initial implementation before
  implementing the confirmed round-robin and pairing requirements.
- Final gates, in order: yarn typecheck PASS; yarn lint PASS; yarn test PASS
  (8 files, 45 tests); yarn build PASS (static export).
- git diff --check PASS.
- First Load JS: /badminton is new at 155 kB (budget 250 kB);
  /mini-project 332 -> 335 kB (+3 kB, budget +10 kB);
  /sitemap.xml remains 0 B. No added dependencies.
- Local dev server starts on http://127.0.0.1:3000. Browser runtime reports no
  available browsers; browser discovery returned an empty list. Visual dark/light
  and interactive browser checks remain unverified.
- Data is session-only and resets on refresh. Competition requires an even total roster of at least four for doubles.
  Gender preferences fall back to unrestricted pairs for unmatched players.
  Random mode lists players left over after forming complete matches.

## Gender preference fallback verification

- Two regression tests failed before the fallback implementation and pass now.
- All four gates pass again, in order (45 tests).
- /badminton First Load JS remains 155 kB: no material change.
- Updated pairing guidance in all five locales.

## Random history verification

- Two partner-history regression tests failed before implementation and pass now.
- Typecheck, lint, all 47 tests and static build pass, in order.
- /badminton First Load JS: 155 -> 156 kB (+1 kB); no dependencies added.
- Session history includes played matches, sit-outs and the chosen pairing rule.
  Partner counts use player IDs and only played teams. Repeats are best-effort
  avoided, not prohibited. Gender preferences and fallback remain supported.
- Visual verification remains unavailable because no browser is connected.

## Mobile design verification

- Typecheck, lint, all 47 tests and static export passed, in order.
- /badminton First Load JS: 156 -> 173 kB (+17 kB). Added responsive navigation,
  themed match cards, mobile standings and icons; remains below 250 kB budget.
  /mini-project remains 335 kB. No dependencies added.
- Verified generated CSS contains the 44px minimum button height, primary action
  height, match selection height and responsive layout utility rules.
- Inputs use 16px text; long names wrap; standings use stacked cards under 640px.
  Mobile view navigation switches presentation only, preserving feature state.
- Browser discovery returned an empty list again. Visual checks on mobile widths
  and dark/light themes remain unverified; no screenshots were produced.

## Random singles verification

- Three new regression tests failed before implementation and pass now: singles
  match sizes/sit-outs, opponent variety and independence of singles/doubles history.
- Typecheck, lint, all 50 tests and static export passed in order.
- First Load JS: /badminton 173 -> 173 kB; /mini-project 335 -> 335 kB.
  No material change and no added dependencies.
- Random singles accepts two or more players; odd rosters leave one sitting out.
  Format changes clear current results and preserve history. Gender settings are
  shown only in doubles. History records the format of each generated round.
- Visual browser verification remains unavailable in this session.

## Local storage verification

- Typecheck, lint, all 57 tests and static export passed in order.
- Storage and lifecycle tests cover complete round trips, malformed JSON,
  unsupported versions, invalid players/results, blocked storage, quota failures,
  React Strict Mode and prevention of startup overwrites when reads fail.
- Saved under badminton.session.v1 after edits; restored only after client mount.
  Saves never write initial defaults over unreadable data during startup.
- /badminton First Load JS: 173 -> 174 kB (+1 kB). No dependencies added.
- Saves apply to this browser only. Storage failures leave the app usable in
  memory with a translated status notice. Browser visual checks remain unavailable.
