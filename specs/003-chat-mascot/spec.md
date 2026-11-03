# KhunKao pixel mascot

Match the real KhunKao photograph: muted brown-grey/taupe fur, broad charcoal
marbled swirls and blotches, shoulder/neck/leg bands, tan underside, cream muzzle,
forehead M and ringed dark-tipped tail. Retain the sprite's green eyes and detailed
pixel-art finish. The transparent atlas has seated idle/blink, four-legged walk,
groom, stretch, roll and full-body expression frames. Each cat has two front
legs and two hind legs. Grooming raises one front paw while the other stays
planted; do not leave a third front paw on the ground.

Exactly one animated cat launcher appears on the page. The open chat header
shows the original small, decorative KhunKao photograph beside his name. After hydration, read session dismissal,
load the artwork and walk in once the first frame is ready. The cat itself is
the named, keyboard-accessible chat button. Opening/closing chat preserves the
same cat. Only Hide dismisses it: close chat, walk out, then remove it and remember
dismissal for the browsing session. Blocked storage must still allow local entry
and dismissal. No configured chat endpoint means no launcher.

Once the first entrance finishes and the cat sits, show the localized “Click to
chat” pixel-art speech bubble immediately for three seconds without requiring hover. Do
not show it during loading or travel. Opening chat or dismissing the cat cancels
this intro, with no replay on closing chat. Respect reduced motion and clear the
intro timer on unmount. Render a native inline speech bubble with stepped pixel
corners, a square tail and monospaced text; no tooltip component or portal.
Position above the cat outside its clipped travel strip, constrain its width on
mobile and use theme tokens in both themes. After the intro, hover/focus can show
the same pixel bubble. Associate the visible bubble with the chat button.

Default idle is sitting. Match seated/walking visible height within 2%, preserve
aspect ratio and a common ground line; a seated cat is naturally narrower than
a walking cat. Rolling/stretching have naturally lower/wider silhouettes and
must not be enlarged to fill the button. Preserve translucent whiskers and avoid
clipping all poses.

Pointer entry plays sitting/lowering once, then loops only the ground-level
side/back poses. Once per ground loop, rest on a randomly chosen relaxed side
pose for 1.2–3.2 seconds before rolling again. Leaving during this pause releases
the long wait and continues recovery at the normal frame cadence. Do not sit up
between rolls while the pointer remains over the
cat. Pointer leave plays recovery/get-up once and returns to sitting. Give the preparation/recovery poses longer
holds and a relaxed middle tumble: ground movement takes about one second per
cycle (half the previous speed), excluding the separate random rests. On pointer leave, finish the
current roll and settle before returning to the chat state; do not snap poses
or start another cycle. Re-entering during that roll continues the same motion. A click can temporarily
play its stretch, then resume rolling if still hovered. Leaving during a stretch returns to the
current chat state without starting another roll. Hover roll pauses during travel
and hidden tabs; reduced motion stays still. Keyboard focus plays one roll. Opening or closing the
chat panel plays one stretch, including either close control. Repeated events
restart their clip. A nonempty draft while the panel is open grooms, as does
waiting for the API. Play one grooming burst on entering typing/waiting, then
sit/blink for a random 1.5–4.5 seconds before each later grooming burst. Do not
loop grooming continuously or restart it for every keystroke. A successful reply
plays expressions. Clearing the draft
or closing the panel ends draft-driven grooming. Walking always takes priority.
New typing/request/reply state interrupts an earlier event clip; otherwise a
finite event finishes and returns to the current chat state. Reduced motion
remains still. Random actions wait until explicit events finish.

While idle, wait a random 8–16 seconds, play one random roll, groom, stretch or
expression, return to sitting, then wait again. Avoid consecutive repeats.
Walking, thinking and replying immediately interrupt random actions. Thinking
uses finite grooming bursts and random seated pauses; replying uses expressions. Do not run random activity while
loading, hidden, or with reduced motion. Pause active clips in background tabs
and start a fresh idle wait on return. Release all handlers, listeners and timers
on unmount. Reduced motion shows one still seated pose and skips travel.

Keep current API/chat/transcript/error behavior and all existing translated
controls. Asset or canvas failure uses one decorative pixel fallback that still
allows chat and dismissal. No new route, backend, dependency, copy, publication
or commit is required.
