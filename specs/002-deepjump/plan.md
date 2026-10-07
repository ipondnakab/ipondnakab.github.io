# Plan

Use a thin static /deepjump route with metadata and a client feature component.
Use FormHookWrapper and InputString with declarative validation. Launch
synchronously in the click/Enter handler: React Hook Form's asynchronous submit
validation must not delay navigation past the Android user gesture. Native
location.assign hands custom schemes and intent links to the browser unchanged.
Pure URL/history helpers own validation, deduplication and untrusted JSON parsing.
Browser storage is accessed only after mount or in event handlers, with catches.
No analytics import because it currently adds Firestore to lightweight routes.

Constitution check: static-only; app → feature → shared; typed feature models;
tests first and four gates; all five locales and theme tokens; accessible native
buttons with no motion/resources; metadata and mini-project catalogue entry.
No dependencies. Budget: /deepjump <= 220 kB First Load JS; /mini-project increase
<= 5 kB. Measure baseline build and final build. Android behavior reference:
https://developer.chrome.com/docs/android/intents (user gesture required).

## Theme and mobile refinement

Reuse the existing Badminton/mini-project presentation: content1 surfaces,
primary tint, rounded-3xl panels and existing react-icons. No new dependency or
motion. Use min-w-0 and break-all for long URLs, wrapping history headings and
responsive action grids. Configure the existing InputString with outside label,
bordered theme style, 16px input, URL inputMode and go enterKeyHint. Preserve
synchronous launch handlers. Baseline /deepjump: 154 kB First Load JS.

## Shared UI components

Keep the existing shared FormHookWrapper/InputString and reuse NextUI Button
and Card for actions and history surfaces, consistent with the site catalogue.
Do not introduce duplicate primitive wrappers. Preserve the user's combined
launcher Card, mobile spacing and direct synchronous click/Enter launch. Disable
component animations; verify the existing behavioral tests with real components.
Measure /deepjump before and after; no new dependency.

## History confirmation

Add a reusable shared ConfirmModal built from NextUI modal/button primitives.
It accepts translated title, description, confirm/cancel labels, an optional
content slot and callbacks; shared code never imports feature code. Track the
pending clear/delete action in the feature model and component state. Persist
only on confirm. Use trapped modal focus, initial Cancel focus, disabled animation,
centered responsive width and wrapping URL content. Add copy in all five locales.
Test confirmation and cancellation before implementation; run the four gates
and compare /deepjump First Load JS with a fresh baseline.
