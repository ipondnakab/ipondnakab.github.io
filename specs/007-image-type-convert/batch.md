# Batch conversion extension

Select or drop multiple images (up to 20 files, 100 MiB combined input).
Selecting a new batch replaces the current one. Apply one output format and
quality to every file; process sequentially to limit decoded image memory.
Show per-file progress, failures, previews, individual downloads, and a single
ZIP download of successful results. One invalid file must not stop the batch.
Deduplicate output filenames, including collisions after extension changes.
Reset, replacement and unmount cancel pending work and release object URLs.
Cap combined encoded results at 100 MiB. No new dependencies: a small ZIP-store
writer with CRC32, UTF-8 filenames and ZIP directory records, covered by tests.

Plan: write failing archive and batch UI tests; implement ZIP and cancellable
file conversion helpers; replace single-file state with a sequential queue;
localize controls and update catalogue; run all four gates. Converter First Load
JS budget remains 230 kB. Browser QA is still required where Chromium can run.

## Results

- Typecheck passed; lint passed with the existing badminton hook warning.
- All 145 tests across 23 suites passed, including cancellation, replacement,
  partial failures, duplicate names, download-all creation, ZIP structure and
  cleanup. New helper tests were observed failing before implementation.
- Python's independent `zipfile` reader validated an actual generated archive:
  UTF-8 names, CRCs, directory offsets and both file contents passed.
- Static production export passed with the same local placeholder public
  Firebase settings as the original feature validation.
- No dependencies were added. Browser visual/encoder verification remains
  pending due to the previously observed Chromium socket restriction.

Manual additions: select/drop several files, include one corrupt image and two
matching basenames with different extensions; verify remaining files convert,
ZIP contains only successes with unique names, and individual downloads remain
available. Clear or replace a batch mid-conversion and while preparing ZIP;
confirm old results never reappear. Check the 20-file and 100 MiB limits.

Bundle result: converter First Load JS 132 → 133 kB (+1 kB rounded),
route code 3 → 4.24 kB; catalogue remains 339 kB and sitemap remains 0 B.
This stays within the 230 kB route budget.
