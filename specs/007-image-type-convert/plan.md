# Implementation plan

Use a thin static App Router page and isolated image-type-convert feature.
Canvas decodes and encodes locally; validate size/type before decode, dimensions
before canvas allocation, and actual Blob MIME after encoding. A generation token
protects replacement/unmount races. Object URLs are owned by the component and
revoked in effects. Use existing form wrapper and select fields for settings.
No dependencies added; route budget: 230 kB First Load JS. Catalogue budget:
less than 2 kB growth. Do not import analytics because it pulls Firestore.

Constitution review: static only; app → feature → shared; strict types and
feature-local models; tests written first; all five locales; theme tokens,
accessible labels/status; URL cleanup; metadata and catalogue entry. No exceptions.

## Validation results

- Test-first: conversion test failed on its missing implementation before the
  helper was added.
- `yarn typecheck`: passed.
- `yarn lint`: passed; existing badminton missing-`t` dependency warning remains.
- `yarn test`: 21 suites / 138 tests passed, including 8 converter tests.
- `yarn build`: passed static export. Existing Firebase initialization requires
  public build configuration; used non-production placeholder values locally.
- Baseline build at 2db5d23 also passed with the same placeholders.
- First Load JS: new converter 132 kB (3 kB route), below 230 kB budget;
  `/mini-project` 339 → 339 kB rounded (route 6.34 → 6.70 kB);
  sitemap remains 0 B. No material catalogue First Load JS change.
- Browser verification remains pending: installed Chromium cannot launch in this
  environment (`socket() failed: Operation not permitted`). Real encoder output,
  mobile layout and dark/light visual QA were attempted but not verified.
  Unit tests cover JPEG background, PNG alpha behavior, MIME fallback rejection,
  empty output/context, dimensions, file validation, naming and form controls.

## Manual browser check

Open `/mini-project/image-type-convert`, select a transparent PNG, and convert to
PNG, JPEG and WebP. Download each; confirm type, original dimensions, white JPEG
background, and preserved PNG/WebP alpha. Check corrupt-file errors, replacement
and reset during processing, keyboard file selection, mobile width, all five
languages and dark/light themes. WebP encoding depends on browser support; an
unsupported encoder must show an error instead of returning mislabeled PNG.
