# Recursive folder imports

Dropped folders currently arrive through DataTransfer.files, which does not
recursively enumerate their contents. Capture filesystem entries during the drop
event, traverse all directory-reader pages and nested folders, and collect PNG,
JPEG and WebP images. Also provide a folder picker using webkitdirectory.
Display each image's relative path. Keep normal file selection working.
Skip unsupported files in folder mode; report empty folders and read errors.
Existing 20-image / 100 MiB batch limits still apply; never silently truncate.
Reset, replacement and unmount cancel scans and ignore late callbacks.
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
check downloads; repeat via Choose folder. Clear or replace the selection while
scanning. Confirm empty/unreadable and oversized folders display clear errors.
