# Recursive folder imports

Dropped folders currently arrive through DataTransfer.files, which does not
recursively enumerate their contents. Capture filesystem entries during the drop
event, traverse all directory-reader pages and nested folders, and collect PNG,
JPEG and WebP images. Also provide a folder picker using webkitdirectory.
Display each image's relative path. Keep normal file selection working.
Skip unsupported files in folder mode; report empty folders and read errors.
Existing 20-image / 100 MiB batch limits still apply; never silently truncate.
Clear all and unmount cancel scans and ignore late callbacks. New selections append.
Output ZIP remains flat with collision-safe filenames.

Plan: failing traversal tests first (nested paths, paginated readers, non-images,
missing MIME, errors, cancellation, limits), then helper and UI integration,
localized messages, full gates. No new dependencies; route budget 230 kB.

Validation: typecheck passed; lint passed with the existing badminton hook
warning; all 153 tests in 24 suites passed; production static export passed with
local placeholder public Firebase settings. Traversal tests were observed
failing before implementation. Converter First Load JS 133 → 134 kB (+1 kB
rounded), route code 4.24 → 5.02 kB; catalogue remains 339 kB.

Browser drag/drop, native folder picker and visual checks remain unverified in
this environment due to the previously observed Chromium socket restriction.
Manual check: drop a root with images in multiple nested folders and a text
file, confirm every supported image's relative path is listed, convert and
check downloads; repeat via Choose folder. Clear the selection while scanning, then repeat with overlapping additions. Confirm empty/unreadable and oversized folders display clear errors.

## Append selection behavior

Additional files, folder-picker selections and folder drops append to the list.
Deduplicate by relative path, size and last-modified time; equal names in different
folders stay distinct. Apply count/byte limits to the combined list; rejected,
empty or unreadable additions leave existing images and results intact.
Use stable IDs and a synchronous item ref to merge overlapping asynchronous
scans without lost updates. Appending preserves active conversions and completed
results; newly appended files wait for the next Convert all action. Invalidate
only the cached/in-progress ZIP on a successful addition. Clear all remains the
explicit operation that removes images, results and pending scans.

Append validation: all 158 tests in 25 suites pass, typecheck and lint pass
(existing badminton warning only), static build passes using the same local
placeholder public Firebase settings. Tests cover preserving results and active
conversion, overlapping folder scans, duplicate selections, cumulative limits,
and invalidating the cached ZIP without revoking image downloads. New append
helper/UI tests were observed failing before implementation. Converter First
Load JS remains 134 kB rounded (route code 5.02 → 5.28 kB); catalogue 339 kB.
Browser verification remains pending as described above.
