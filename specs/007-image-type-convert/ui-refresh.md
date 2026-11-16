# Converter UI refresh

## Scope and acceptance

Refresh the existing converter with the site's primary accent, theme surfaces,
and shared controls. Keep file/folder selection, batch processing, cancellation,
individual downloads and ZIP downloads intact. Provide a clear upload/settings
hierarchy, an informative empty state, visible batch progress and responsive
result cards. All new copy supports all five locales; controls remain keyboard
accessible in dark and light themes.

## Plan and constitution review

Reuse NextUI Button, Card, CardBody and Progress with the existing shared
FormHookWrapper and InputSelect. No dependency or backend changes. Keep all
conversion logic and resource ownership intact. Use theme tokens and existing
react-icons. Keep the route below its existing 230 kB First Load JS budget and
measure against a baseline build. No architecture or constitution exceptions.

## Tasks

- [x] Add an empty-state/progress regression test and observe it fail.
- [x] Refresh the upload, settings and results UI; localize new copy.
- [x] Run typecheck, lint, tests and static build in order.
- [ ] Verify responsive layout and both themes in a browser if available.
- [x] Record bundle comparison and validation results.

## Validation

- New regression test failed on the absent empty state before implementation.
- Typecheck and lint passed; all 26 suites / 221 tests passed.
- Production static export passed.
- Browser runtime connected but reported no available browsers; responsive and
  dark/light visual verification remains pending.
- Converter First Load JS: 134 → 181 kB (+47 kB), within the existing
  230 kB budget. This pays for the shared NextUI controls, loading states and
  accessible progress indicator. No new dependencies were added.
- Catalogue First Load JS: 339 → 340 kB (+1 kB rounded) from shared chunk
  redistribution; catalogue source is unchanged.

## Glass card consistency

Use NextUI `Card isBlurred` for upload, settings, empty state and result cards,
matching Contact and Mini Projects. Remove opaque card background overrides so
NextUI supplies its translucent theme surface. Keep results as list items using
`Card as="li"`. Use a translucent upload surface so it does not hide the card
blur. This is a styling-only correction; verify with the four existing gates.
Baseline converter First Load JS: 182 kB.

Glass correction verification: typecheck, lint, all 233 tests and static build
passed. Converter First Load JS remains 182 kB (no material change). Visual
browser verification remains pending because no browser is connected.

## Borderless cards

Remove the decorative outlines from upload, settings, empty-state and result
cards at the user's request. Retain the blurred theme surfaces. Baseline
converter First Load JS: 182 kB. This is a presentation-only change.
