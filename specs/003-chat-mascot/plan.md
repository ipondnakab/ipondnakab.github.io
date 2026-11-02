# Plan

Implement in src/features/chat. Keep ChatWidget's loading/entering/active/exiting/
closed phases separate from chat-panel state. The one dynamic ChatMascot is inside
the launcher button, within a clipped fixed strip. Read sessionStorage safely;
never mount the mascot in an already-dismissed session. Readiness starts entrance.
Use existing Framer Motion for cancellable travel; cleanup phase timers. Only
Hide persists dismissal and starts exit; ordinary chat toggles keep the same
instance. The tooltip intro starts after arrival.

ChatMascot uses a 112px 2D canvas for the ImageGen atlas at
public/images/khunkao/tabby-atlas-v2.png. Preserve the original 1254px RGBA bitmap.
Feature constants hold measured visible source bounds, column-centre anchors and
row ground lines. The pure sprite-frame helper pads translucent edges and places
all frames at scale 0.35 with ground line 108. Nearest-neighbour rendering keeps
pixel detail crisp. Mirror for inward/left-facing entrance and right-facing exit.
Use eight walking frames at 8 fps, slower idle/blink, grooming when thinking and
quicker idle after replying. Reduced motion selects the same still idle frame.

Load the image once; signal ready only after drawing, or once the SVG fallback
is available after failure. Guard cached-image completion and late events. Pause
frame intervals while the document is hidden; release image event handlers,
visibility listeners and timers on unmount. PixelKhunKao is only a fallback, never
a second visible cat. Remove the old procedural geometry/pose modules; installed
Three.js remains used by unrelated site features.

No dependencies or copy added. Artwork uses the reference's fixed tabby palette;
controls and fallback use existing NextUI tokens. This replaces the earlier voxel
representation with a reference-style 2D sprite because its anatomy and coat
pattern are the requested visual result. Current regeneration prompt: sprite-art-v2.md; original prompt: sprite-art.md.

## Constitution review

- Static browser-only code, no server/runtime secrets or new routes.
- Feature-private code, alias imports, typed models, no component barrel exports.
- Tests observed failing first; four gates in order and measured bundle report.
- Existing translations in five locales; themed controls and accessible names.
- Reduced motion, background pause and complete acquired-resource cleanup.
- No new dependencies. Initial route JS increase budget <= 5 kB versus the last
  procedural-detail build; report the asynchronous sprite chunk and atlas bytes.
- Generated atlas budget <= 2 MB. No publication or Git mutation requested.

## Consistent scale regeneration

Regenerate with the original detailed tabby as identity reference and standing
idle/grooming poses matching the walking silhouette. Inspect alpha bounds using
read-only PNG decoding and separate real sprite columns at transparent gutters,
rather than assuming an exact grid. Use measured source bounds, row ground lines
and a common column anchor offset; keep scale 0.35 and canvas 112px. Add a failing
regression for height consistency (within 5% of idle) and width (within 10%).
Retain all existing frame bounds, baseline, lifecycle and accessibility tests.
No dependencies or UI copy. Initial JS budget <= 5 kB per route against the v1
sprite build; report active atlas bytes separately. Existing controls/motion stay
unchanged. Constitution check: same static feature architecture, theme surfaces,
translations, cleanup and verification gates.
