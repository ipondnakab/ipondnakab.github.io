# Tasks

- [x] Read the constitution and specify single-cat behavior and new idle activities.
- [x] Generate the 32-frame seated/walk/groom/stretch/roll/expression atlas.
- [x] Edit the coat against the real photo; preserve the returned active bitmap
      and record exact built-in ImageGen prompts in sprite-art-v3.md / v4.md.
- [x] Correct the extra planted foreleg in raised-paw grooming poses (v5).
- [x] Measure alpha bounds/contact anchors and calibrate seated/walking height.
- [x] Observe failing action-priority/random-selection, size and lifecycle tests.
- [x] Implement typed clips, pure selection/frame helpers and finite ambient actions.
- [x] Preserve interruption, hidden-tab pause, fresh idle waits, reduced motion,
      complete cleanup and the existing single-cat entrance/dismissal state machine.
- [x] Specify hover, panel toggle, reply and draft-wait actions.
- [x] Observe failing event/typing integration tests, then implement numbered
      one-shot roll/stretch events and draft-driven grooming.
- [x] Verify repeat triggers, both close controls, return to state, interruption,
      reduced motion and preserved single-cat behavior.
- [x] Observe failing hover-loop/leave regressions; implement persistent pointer
      hover, loop until leave, resume after stretch and pause in hidden tabs.
- [x] Observe failing timing/settling and stretch-preservation tests; add paced
      roll frames and finish the current cycle on leave without restarting on
      re-entry or rewinding an unrelated stretch.
- [x] Observe failing ground-loop tests; split hover playback into lowering,
      ground-only loop and recovery so sitting happens before/after hover.
- [x] Observe failing random-rest tests; choose a relaxed ground pose each cycle,
      hold 1.2–3.2 seconds, release the wait on leave, and verify hidden-tab/unmount
      cleanup without altering one-shot chat or idle actions.
- [x] Observe the failing minimum ground-movement duration regression; halve
      rolling speed while preserving preparation, recovery and random rests.
- [x] Observe failing grooming-delay/playback tests; schedule finite bursts for
      typing/waiting with random seated pauses, immediate reply interruption,
      fresh visible waits and complete cleanup.
- [x] Restore the original decorative header photo; verify it appears only
      with the panel while retaining one animated launcher.
- [x] Observe failing invitation tests; show the localized chat bubble after
      readiness/arrival for three seconds, cancel on open/dismiss and verify
      reduced motion, no replay and timer cleanup.
- [x] Observe failing inline bubble assertions; replace Tooltip with a native
      pixel-border/tail bubble, preserve timing and hover/focus, and verify
      status/description wiring and placement outside the clipped travel strip.
- [x] Format; pass typecheck, lint and 127 tests in order.
- [x] Complete production export and report per-route/active asset costs.
- [ ] Verify in-page playback, both themes and mobile sizing in a connected browser.

Analysis: every requirement has an implementation/regression task; plan satisfies
the constitution with no exceptions. No API, dependency, locale copy or endpoint
changes. Browser discovery returns no connected browsers; artwork and read-only
PNG/frame metadata were inspected directly, which does not replace browser QA.
