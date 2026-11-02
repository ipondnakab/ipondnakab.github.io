# KhunKao tabby mascot

Use the supplied detailed pixel-art reference as the character direction: a warm
brown mackerel tabby with green eyes, a cream muzzle, pink inner ears, whiskers
and natural feline proportions. The transparent generated sprite atlas supplies
idle/blink poses, an eight-frame four-legged walk and paw grooming.

Exactly one cat appears on the page. On page load, read session dismissal after
hydration, load the sprite and walk in automatically once the first frame is
ready. The cat itself is the keyboard-accessible chat button. Opening or closing
chat preserves the same cat and does not replay travel. Remove duplicate launcher
or header artwork. Waiting for a reply uses grooming; a reply uses a quicker idle
cycle. Keep the existing chat API, transcript, errors and translations.

Only the Hide/dismiss badge closes chat and sends the cat walking off-screen.
Keep it mounted until departure finishes, then remove it. Remember dismissal in
sessionStorage so refreshes and route changes do not bring it back in that
session. Blocked storage must not prevent entrance or dismissal for this mount.
No endpoint configured means no entry point, as before.

Acceptance:

- Frames retain one scale and ground line without clipping translucent whiskers.
- Entrance faces left; dismissal faces right; the default standing pose looks inward.
- The same one cat remains across repeated chat toggles.
- Reduced motion shows one still pose and skips travel.
- Animation pauses in background tabs; image handlers, listeners and timers are
  released on unmount. A failed asset or unavailable canvas uses one pixel SVG
  fallback and still allows chat to open and the cat to be dismissed.
- Controls use existing translated labels and theme tokens in all five locales.
- No new route, backend, dependency, publication or commit is required.

## Consistent pose size

Use regenerated atlas v2 with a standing idle pose and the same scale across
idle, walking and grooming. Visible height stays within 5% and width within 10%
of idle during the gait. Share the fixed renderer scale and ground line; never
stretch each frame to fit. Preserve the single-cat entrance/dismiss behavior.
