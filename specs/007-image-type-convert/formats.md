# Expanded image formats

## Specification

Accept image MIME types and recognize common image extensions when MIME is
missing, consistently across files, folders and drops. Export PNG, JPEG, WebP,
GIF, BMP, TIFF, ICO and SVG. Browser-decoded input is required: unsupported
HEIC/HEIF, RAW or other images receive a localized decode error. GIF output is
a single frame with a fixed 256-color palette. SVG embeds a PNG raster, with no
vector tracing. ICO dimensions are constrained to 256×256 while preserving aspect
ratio; other outputs preserve dimensions. JPEG and BMP flatten onto white.
Keep size limits, sequential batches, cancellation and URL cleanup.

## Plan and constitution review

Use browser decoding and existing canvas encoding for PNG/JPEG/WebP. Add small
feature-local pure binary encoders for GIF, BMP, TIFF and PNG-backed ICO. SVG
wraps a base64 PNG, never interpolating source SVG markup. Preview custom formats
using a PNG object URL so previews do not depend on TIFF rendering support.
No dependencies, licence changes, network calls or backend. Keep output names
and MIME types explicit. Localize format notes and input guidance in all five
locales. Retain the 230 kB route budget; baseline is 181 kB after the UI refresh.

## Tasks and verification

- Write failing tests for broader validation and binary encoder contracts.
- Implement formats and shared input detection; retain existing resource cleanup.
- Update UI format labels, quality visibility, preview handling and five locales.
- Run typecheck, lint, tests and build in order; record bundle delta.

## Validation results

- Test-first: expanded validation/naming failed and the encoder suite failed on
  its missing module before implementation. UI regression tests also caught the
  old picker filter and missing preview wiring before integration was complete.
- `yarn typecheck`, `yarn lint`, `yarn test`, `yarn build`: passed in order.
- 27 suites / 233 tests passed. Coverage includes binary headers, PNG-backed ICO
  dimensions, safe SVG wrapping, broader folder input, quality controls, TIFF
  previews and object URL cleanup.
- Independent decoder checks: macOS `sips` decoded GIF, BMP and TIFF fixtures;
  FFmpeg decoded ICO. FFmpeg pixel checks verified 771 pixels for each GIF/BMP/TIFF
  fixture, including transparency, BMP white flattening and GIF palette accuracy.
- Browser UI verification remains unavailable: no browser is connected.
- First Load JS: converter 181 → 182 kB (+1 kB rounded), below 230 kB budget;
  mini-project catalogue 340 → 340 kB (no material change).
- No new dependencies or uploads.

## Format references

- [Canvas encoding and fallback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
- [Browser image support](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)
- [BMP storage](https://learn.microsoft.com/en-us/windows/win32/gdi/bitmap-storage)
