# Tasks

- [x] Write URL/history tests and observe failure before implementation.
- [x] Implement model, constants, pure validation/history helpers.
- [x] Implement client form, synchronous launch, resilient localStorage/history.
- [x] Add route metadata, catalogue, five locale dictionaries and lint boundaries.
- [x] Test UI validation, restoration, launch and deletion.
- [ ] Verify both themes visually and app launching on Android (browser unavailable).
- [x] Format changed files; typecheck → lint → test → build; record bundle delta.

Analysis: all spec requirements have tasks; plan satisfies constitution without
exceptions. App launches cannot be confirmed from browser navigation and require
real Android device verification beyond desktop UI tests.

## Shared UI components

- [x] Replace custom action controls and history surfaces with NextUI primitives.
- [x] Preserve shared form/input, synchronous jump behavior and mobile layout.
- [x] Run four gates and record the /deepjump bundle delta.

## History confirmation

- [x] Add failing tests for explicit delete/clear confirmation and cancellation.
- [x] Add shared ConfirmModal, pending action model and history integration.
- [x] Translate modal copy in all five locales.
- [x] Format and run four gates; record bundle delta and visual QA limitations.
