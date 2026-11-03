# Plan

Implement in src/features/chat. Keep the one dynamic ChatMascot inside the
launcher button and the existing loading/entering/active/exiting/closed phases
independent of chat-panel state. Safely read sessionStorage; never load the
mascot for an already-dismissed session. Readiness starts automatic entrance.
Only Hide persists dismissal and starts exit; unmount after its travel timer.
Existing Framer Motion clips travel to a fixed viewport strip. No duplicate
launcher artwork. Render a native PixelChatBubble above the launcher as a sibling
of the clipped travel strip. Build notched corners, a stepped tail and a 4px
outline from Tailwind rectangles; use monospace text and theme foreground/background
tokens. No tooltip dependency, portal, raster generation or extra font is needed.
Reuse all five localized chat.tooltip strings. Expose a polite status and associate
the visible bubble with the launcher using useId/aria-describedby.
Show immediately on arrival, hide after 3,000ms, and ignore pointer leave during
that intro. Opening chat/dismissal cancels it. Later hover/focus uses the same pixel
bubble, clearing on leave/blur. Keep it outside clipping and bound its mobile width.
Clear the one intro timeout on unmount. Restore the original
32px KhunKao photograph beside the open chat header name, using the existing
small avatar asset and decorative empty alt text.

## Artwork and frame layout

Built-in ImageGen creates the action atlas, then edits its coat against the real
photo. Active asset: public/images/khunkao/tabby-atlas-v5.png, 953 × 1651 RGBA.
Keep returned pixels unchanged; exact generation/edit prompts are in
sprite-art-v3.md, sprite-art-v4.md and sprite-art-v5.md. The v5 edit removes duplicate grooming forelegs. Feature constants hold measured visible
bounds, a common column anchor offset and each pose's opaque ground contact.

Render into a 112px canvas with nearest-neighbour sampling. Base scale is 0.44;
walking uses a uniform 1.09 calibration multiplier so its height matches sitting.
Both axes share the same scale. The pure frame helper adds transparent edge
padding, maps anchors to centre/ground line 108 and mirrors in the canvas for
inward/left-facing entrance or right-facing departure. No per-frame fill-to-fit
resizing. Keep lower rolling/stretching poses at their natural size.

Atlas slots: sit 0–3, walk 4–11, groom 12–15, stretch 16–19, roll 20–27,
expressions 28–31. Typed clip definitions set frame order, cadence and scale;
ambient clip sequences finish with the seated frame. Walking loops at 8 fps.

## Ambient actions and lifecycle

Keep interaction state separate from a nullable ambient action. Pure helpers
resolve priority (reduced motion -> sit; walking/thinking/replying override idle
activities), choose a non-repeating random action and an 8–16 second delay.
Schedule one timeout only while loaded, visible, idle and motion-enabled. Play
an ambient clip once, return to sitting and reschedule. Interactions clear ambient
state immediately. Hidden tabs clear pending idle waits and pause active frame
timers; resume active clips or start a fresh idle wait after return.

ChatWidget tracks pointer entry/leave independently of numbered action events.
Pointer hover latches a roll and prevents ambient scheduling. The pure hover-roll
helper plays clip indices 0–1 (sit/lower) once, loops indices 2–5 (side/back on
the ground), then advances through 6–8 (recover/get up/sit) when the pointer leaves.
Once per ground loop, choose a relaxed side pose (clip tick 2 or 5) and hold it
for a random 1.2–3.2 seconds using the existing frame timeout. Keep the chosen
frame delay on visibility pause/resume. A ref callback releases the long wait
on pointer leave, then recovery continues at normal cadence; clear that callback
and pending timeout on cleanup. One-shot/random rolls retain the complete clip. While hovered, never replay the
seated preparation or get-up between tumbles. Store pointer presence in a ref so leaving/re-entering does not
reset the drawing effect. Clear the latch at the cycle boundary, or immediately
for travel/reduced motion and leaving during a stretch. Derive active rolling
separately from the latch so clearing it during a stretch cannot rewind that clip.
Per-frame roll durations add anticipation, a slower tumble and a seated recovery
hold. Ground frame durations are 300/220/220/300ms (1,040ms per moving loop),
twice the prior durations. Preparation/recovery and random 1.2–3.2s rests retain
their timings. Use the same seated slot 0 at both roll boundaries to remove the size
pop from the alternate seated artwork in slot 20. A self-scheduling timeout selects each frame's duration; visibility pauses
and cleanup cancels the pending timeout. Other clips retain their original timing. A stretch temporarily overrides hover and
returns to roll if still hovered. Travel and reduced motion retain priority.
Keyboard focus and panel open/close issue numbered roll/stretch events. A nonempty visible draft selects
thinking/grooming; draft edits clear reply state and cancel an active event,
even when the draft was already nonempty. Keep event IDs increasing across
cancellations so the next hover cannot be mistaken for a consumed event. ChatMascot consumes each event
once, restarts the clip for a new event, and returns to the current chat state on
completion. Walking/reduced motion consume events without queuing them. New
thinking/replying states interrupt existing events. Random scheduling stops while
an event is active. Both launcher and header close controls share the handler.

Extend the existing one-shot activity scheduler to the thinking status. On entry,
start one grooming burst; after each completion sit/blink for a random 1.5–4.5s
before the next burst. Track the status in a ref so parent renders and continued
typing do not restart it. Render thinking through idle plus a finite groom action,
leaving the chat status label unchanged. Pause scheduling while hidden; cancel
and reset on travel, hover, explicit events, replies, reduced motion or failure.
A visible return starts a fresh wait. No extra timer or dependency is required.

Load the atlas once; signal ready after first draw, or after selecting the SVG
fallback on failure. Guard cached/late image events. Release image handlers,
visibility listeners, idle timeouts and frame timers on cleanup. Keep fallback
and canvas mutually visible so only one cat is drawn.

## Constitution and validation

Static client-only implementation, feature-private alias imports and model types,
no component barrels or server changes. Existing locale labels/theme surfaces and
keyboard button remain; artwork uses KhunKao's fixed photographed coat palette.
Respect reduced motion and complete resource cleanup. No dependencies added.
Tests are seen failing first for new action/priority/randomness behavior and size
regression. Verify real PNG dimensions, all crop/destination bounds, undistorted
scale, ground line, walking loop, one-shot activities, priority, hidden-tab timing,
reduced motion, asset/context failure and cleanup. Preserve existing single-cat
entry/dismissal/session regressions. Run root typecheck, lint, tests and build in
order; report every route against the last verified v5 build.

Budget: <= 5 kB initial JS growth per route and <= 2.5 MB active atlas. No hosting,
Git mutations or deployment requested. Browser QA remains pending if no browser
is connected.
