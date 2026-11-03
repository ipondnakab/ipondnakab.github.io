# Validation

Passed in order: `yarn typecheck`, `yarn lint`, `yarn test` (18 files, 127 tests),
and `yarn build` (25 static pages, isolated copy of current source/configuration).
`git diff --check` passes. No dependencies, deployment or commit added.

## Artwork and scale

Built-in ImageGen generated the action poses, then edited the coat using the real
KhunKao photograph. Active asset: `public/images/khunkao/tabby-atlas-v5.png`
(953 × 1651 RGBA, 1,960,081 bytes). Earlier versions and exact prompts are retained
in sprite-art-v3.md, sprite-art-v4.md and sprite-art-v5.md. The coat uses muted brown-grey fur,
broad charcoal swirls/blotches, tan underside, banded legs and a ringed tail.

Direct artwork and read-only PNG inspection confirmed 823,867 fully transparent
pixels. Measured source rectangles include whiskers, with contact anchors used
to align frames on a common 108px ground line inside the 112px canvas. The bitmap
was not resampled or stretched. Seated height is 84.04px; walking is
82.9708–84.8892px, under 1.3% variation from seated height. Lower rolling/stretching
frames retain their natural size rather than being enlarged. The size regression
bounds walk/idle height variation to 2%.

The v5 anatomy edit removes the extra planted front leg in grooming frames
12–14: one front paw is raised and the other remains planted. Direct sheet
inspection confirms the corrected poses. All 32 bounds/contact anchors were
remeasured; a one-pixel common anchor adjustment fixes the regenerated walking
frame edges that initially failed the canvas-bound regression.

## Behavior and verification

Idle sits and blinks. Every 8–16 seconds it chooses a finite roll, groom, stretch
or expression clip, excludes the previous choice, and returns to sitting.
Walking, thinking and replying interrupt ambient actions. Hidden tabs pause active
playback and cancel pending idle waits; visibility restores a fresh idle wait.
Reduced motion shows a still seated frame. Timers/listeners and pending image
handlers are cleaned up. Tests cover these transitions, crop/destination bounds,
looping, image/canvas failure, and the existing single-cat entrance/dismissal.

Event tests were observed failing before implementation. Pointer entry loops roll; keyboard focus issues one
roll. Both open/close controls issue stretch, and numbered triggers restart the
same action. Stretch completion resumes hover roll if the pointer remains over
the cat. Leave finishes the current roll before restoring the chat state.
Brief leave/re-entry does not reset the frame. Leaving during stretch neither
rewinds that clip nor queues a new roll. The hover loop pauses while hidden, yields to travel and
respects reduced motion; random idle actions cannot interrupt it. Finite events
resume the underlying chat state, do not replay after
travel/replies, and respect reduced motion. Nonempty visible drafts groom;
clearing/closing ends draft grooming. Typing interrupts replies and active event
clips even when the draft was already nonempty. IDs remain monotonic after
cancellation. Existing request/reply/error and single-cat lifecycle tests pass.

Natural one-shot roll timing holds preparation/recovery longer than the middle
tumble (2,360ms total). The first and final frames use the identical resting seated
pose, removing the former size change at the loop seam. Frame-specific timeouts
replace fixed intervals; hidden tabs pause playback and unmount clears timers.
Timing, seamless-boundary and settle/stretch regressions failed before the fixes.
The underlying atlas is unchanged.

Hover playback now plays sit/lower once, loops only ground poses 22–25, then
finishes through recovery/get-up poses 26–27 and seated pose 0 after leave.
It never sits up between tumbles while continuously hovered. Pure phase tests
and rendered-frame integration assertions failed before implementation and now
cover entry, sustained ground looping, exit and re-entry during recovery. Other
roll triggers retain the full one-shot sequence. Existing stretching, travel,
reply/draft reactions, reduced motion and hidden-tab cleanup regressions pass.

Hover ground loops now choose a relaxed side pose (clip tick 2 or 5) once per
cycle and hold it for a bounded random 1.2–3.2 seconds. There are no redraws
throughout the rest. Pointer leave releases the long hold at the normal frame
cadence, then finishes recovery; no extra idle wait delays get-up. Visibility
pause/resume preserves the selected hold duration and cleanup releases both the
frame timer and leave callback. New delay/pose and canvas lifecycle tests cover
these paths; initial random-rest regressions failed before implementation.
The ground movement is now 1,040ms per loop rather than 520ms (half speed),
with preparation/recovery and 1.2–3.2s random rests unchanged. The minimum
movement-duration assertion failed before the timing adjustment. One-shot rolls
use the same slower ground frames; other chat reactions retain their timing.

Typing/waiting now starts one finite grooming burst, sits/blinks for a random
1.5–4.5 seconds, then plays another burst. The same scheduler handles idle
activities and thinking bursts; a status ref prevents repeated keystrokes from
restarting the sequence. The chat status remains thinking while the sprite is
seated between bursts. Replies cancel pending grooming immediately. Hidden tabs
cancel pending waits and return to a fresh visible wait; unmount clears timers.
New bounds/playback/visibility tests failed before implementation; reaction,
hover-roll, stretch, reduced-motion and chat widget regressions still pass.

The open chat header restores the original 32px round KhunKao photograph from
`public/images/khunkao-avatar.png`, with an empty decorative alt beside the name,
fixed dimensions and a theme-token background. The existing widget regression
was observed failing before restoration; it verifies the photo appears while
the panel is open and disappears on close while the single animated launcher
persists. The existing asset is reused unchanged; no dependency is added.

The localized “Click to chat” invitation now renders as a native PixelChatBubble,
with stepped 4px corners, a square tail, monospace text and foreground/background
theme tokens. It is an inline sibling of the clipped travel strip, positioned
above the cat with a viewport-bounded width. The NextUI Tooltip import/wrapper
is removed; no portal, image or font dependency is added. A polite status region
and useId/aria-describedby associate the visible invitation with the launcher.
The initial three-second timing, open/dismiss cancellation and cleanup remain.
Later hover/focus shows the same pixel bubble; leave/blur hides it. The adjusted
inline/status/description tests failed before implementation and now pass, along
with timed expiry, no replay, reduced motion and later hover/focus coverage.

Production CSS contains the relative bottom offset, viewport width cap, 4px
border and monospace rules. This verifies emitted styles, not visual appearance.

Browser selection reported no available browser; troubleshooting discovery returned no connected browsers. Actual in-page playback, both
colour themes and mobile layout remain visually unverified; canvas tests use a
mocked drawing context. Artwork inspection does not replace browser QA.

## Bundle and asset cost

The active atlas grows from v4's 1,955,542 to 1,960,081 bytes (+4,539 bytes),
within the 2.5 MB artwork budget. Only v5 is requested by the runtime. It loads
separately after hydration and is not included in First Load JS. The asynchronous
player chunk remains 2,011 bytes gzipped (no change for the pixel bubble).

First Load JS compared with the preceding tooltip-invitation build: /mic-link
increases from 438 to 439 kB at the build report's precision (+1 kB, within the
5 kB budget). Other routes have no material change at that precision.

| Route                                |  Before |   After | Delta |
| ------------------------------------ | ------: | ------: | ----: |
| `/`                                  |  389 kB |  389 kB |     0 |
| `/_not-found`                        | 87.9 kB | 87.9 kB |     0 |
| `/apple-icon.png`                    |     0 B |     0 B |     0 |
| `/badminton`                         |  191 kB |  191 kB |     0 |
| `/contact`                           |  391 kB |  391 kB |     0 |
| `/contact/success`                   |  191 kB |  191 kB |     0 |
| `/credit`                            |  143 kB |  143 kB |     0 |
| `/deepjump`                          |  191 kB |  191 kB |     0 |
| `/drunkard-game`                     |  123 kB |  123 kB |     0 |
| `/drunkard-game/privacy`             |  146 kB |  146 kB |     0 |
| `/icon.png`                          |     0 B |     0 B |     0 |
| `/mic-link`                          |  438 kB |  439 kB | +1 kB |
| `/mini-project`                      |  338 kB |  338 kB |     0 |
| `/mini-project/badminton/live`       |  290 kB |  290 kB |     0 |
| `/mini-project/badminton/scoreboard` |  174 kB |  174 kB |     0 |
| `/planning`                          |  466 kB |  466 kB |     0 |
| `/pokdeng`                           |  347 kB |  347 kB |     0 |
| `/prompt-pay`                        |  326 kB |  326 kB |     0 |
| `/resume`                            |  501 kB |  501 kB |     0 |
| `/robots.txt`                        |     0 B |     0 B |     0 |
| `/sitemap.xml`                       |     0 B |     0 B |     0 |
| `/threejs`                           |  331 kB |  331 kB |     0 |
