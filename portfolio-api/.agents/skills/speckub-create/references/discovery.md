# Identifying repository API documents

Discover endpoint documents anywhere under the selected project root, not just
`docs/api/`. Use the available CLI `speckub list --root ROOT --json`; only pass
`--docs-dir DIR` when the user explicitly limits document discovery to a directory.
Source/service scope is not automatically a document-location filter.

New or updated real specs use YAML `speckub: true`, `specVersion: 1`, and the
required HTTP endpoint fields. Optional `tags` is an array of nonempty strings.
Existing unmarked valid specs remain compatible; preserve their IDs and locations.
A `speckub: false` header opts a document out of discovery. Explicitly marked
invalid specs must be reported, not silently treated as ordinary Markdown.
A README or a fenced YAML example is not an endpoint document.

Use `.md` files (case-insensitive). CLI discovery skips symlinks, `.git`,
`node_modules`, `.pnpm-store`, `dist`, `build`, `coverage`, `.next`, `.nuxt`,
`.turbo`, `.cache`, `vendor`, `.venv`, `venv`, `.speckub`, `.agents`, `.claude`,
`.cursor`, and `.codex` directories. UI also skips its selected output directory.
These are directory-name exclusions, not full `.gitignore` interpretation.
Keep real endpoint specs outside excluded trees; use `--docs-dir` to explicitly
select an excluded directory as the search root if intentionally reviewing it.

`docs/api/` remains the default destination for NEW documents. First search the
whole root for an existing identity to avoid creating duplicates elsewhere.
Custom document locations are supported; source references stay project-relative,
and links between specs must be relative to their actual file locations.

Templates and illustrative examples use `speckub: false` and live in
`.speckub/templates/` and `.speckub/examples/`. When creating a real endpoint,
replace that marker with `speckub: true` and fill the contract from source evidence.
Inventory, relationship maps, and review reports must not carry the endpoint marker.
