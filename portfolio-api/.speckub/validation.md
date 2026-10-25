# SpecKub AI source review

- Reviewed scope: all discovered specs under repository root, limited to the `portfolio-api` service
- Reviewed specs: `portfolio-api.chat.post`, `portfolio-api.contact.post`, `portfolio-api.drunkard-game.post`
- Revision: not available from repository metadata
- Sources inspected: endpoint handlers in `api/`, shared modules in `lib/`, `dev-server.ts`, `vercel.json`, `.speckub/scan.md`, `.speckub/relations.md`, project template/example, and API/diagram guidance
- AI review result: discrepancies found; this is a source review, not a runtime or security test

## Findings

### Finding 1: Contact response table omits the upstream 429 case

- Spec / ID: `docs/api/contact.md` / `portfolio-api.contact.post`
- Severity: Medium
- Documented claim: `Responses` lists 429 as `rate_limited`, while the `Errors` table says LINE HTTP 429 is returned as `upstream_error`; the responses table only describes LINE failures as 502.
- Source evidence: `api/contact.ts`, handler's `!lineResponse.ok` branch maps LINE status 429 to HTTP 429 and returns `{ "error": "upstream_error" }`.
- Mismatch: The response table does not include a real response shape for upstream LINE 429, despite documenting it in Errors. This makes the status-to-body contract inconsistent.
- Suggested correction: Split the 429 response row into local `rate_limited` with `retryAfterSeconds` and upstream `upstream_error` without that field; keep the 502 row for other LINE failures.

### Finding 2: Contact sequence diagram's shared guard response flow is inaccurate

- Spec / ID: `docs/api/contact.md` / `portfolio-api.contact.post`
- Severity: Medium
- Documented claim: The diagram shows `Guard-->>API: allow / reject`, then groups invalid origin or method under an API-to-client response; it also places LINE configuration checking before the honeypot and payload validation.
- Source evidence: `api/contact.ts`, `handler`; `lib/cors.ts`, `guardRequest`. The handler returns immediately when `guardRequest` returns false. It checks LINE configuration before honeypot detection, then payload validation, then rate limiting.
- Mismatch: The diagram represents the response ownership ambiguously and does not accurately distinguish guard-generated terminal responses from successful guard return. The configuration/honeypot/validation order itself matches the handler, but the `Valid submission` branch label may imply payload validity before validation has occurred.
- Suggested correction: Show `Guard-->>Client: 204/403/405` on rejected/preflight branches, and `Guard-->>API: allow` only on success. Label the post-configuration branch neutrally before testing honeypot and payload.

### Finding 3: Chat says other message properties are unused, but allowed by validation

- Spec / ID: `docs/api/chat.md` / `portfolio-api.chat.post`
- Severity: Low
- Documented claim: Request prose says, “Other message properties are not used by the handler,” and later says the handler permits only the listed fields and constraints.
- Source evidence: `api/chat.ts`, `isChatMessage` and `parseMessages`. Validation extracts `role` and `content` from a record and checks those values, but it does not reject additional properties. The original message objects are forwarded in the `messages` array to Groq.
- Mismatch: Additional fields are not read directly for validation, but they are not stripped and are included in the upstream JSON. “Permits only the fields” is therefore unsupported and materially misleading about forwarded input.
- Suggested correction: State that `role` and `content` are the only fields validated, extra properties are not rejected, and the submitted message objects are forwarded upstream. Alternatively, change implementation in a separate authorized code change if strict field rejection is intended.

### Finding 4: Drunkard-game OPTIONS is not established as a CORS preflight

- Spec / ID: `docs/api/drunkard-game.md` / `portfolio-api.drunkard-game.post`
- Severity: Medium
- Documented claim: The Authentication section says “`OPTIONS` receives `204`”; the Responses row labels that response “`OPTIONS` preflight.”
- Source evidence: `api/drunkard-game.ts`, handler returns 204 for `OPTIONS` directly. Unlike `api/contact.ts` and `api/chat.ts`, it does not call `guardRequest` or `applyCors` from `lib/cors.ts`, which set `Access-Control-Allow-*` headers.
- Mismatch: The handler returns 204, but no CORS headers are added by the inspected source. Calling this a CORS preflight suggests browser preflight support that source does not establish.
- Suggested correction: Describe it as an `OPTIONS` request returning empty 204 only. Clarify that CORS headers or browser cross-origin support are not established for this route unless deployment-layer behavior is verified.

## Relationship and diagram checks

- API identities in the specs match the three API nodes in `.speckub/relations.md` and the inventory in `.speckub/scan.md`.
- All documented dependency targets exist in the relationship map. The endpoint-to-module/service directions match observed calls; no API-to-API or event relation is invented.
- The chat diagram's guard helper flow is ambiguous about which participant emits terminal responses; see Finding 2.
- The drunkard-game diagram treats OPTIONS as preflight, which is not supported by handler behavior; see Finding 4.
- No retries or concurrency are drawn. The diagrams do not show all exception paths, but the omitted chat/contact/drunkard internal-exception branches are identified in the specs or tables and are not claimed as exhaustive flows.

## Confirmed checks

- `speckub list --root . --json`: passed; discovered 3 endpoint specs and reported no discovery issues.
- `speckub validate --id portfolio-api.chat.post --root . --json`: passed; structural and references passed, 0 errors and warnings; semantic skipped.
- `speckub validate --id portfolio-api.contact.post --root . --json`: passed; structural and references passed, 0 errors and warnings; semantic skipped.
- `speckub validate --id portfolio-api.drunkard-game.post --root . --json`: passed; structural and references passed, 0 errors and warnings; semantic skipped.

CLI checks are deterministic frontmatter/source-reference checks. They do not verify the findings above, API semantics, or Mermaid diagrams.

## Skipped checks and coverage gaps

- Mermaid rendering: not run; no renderer was exercised during this review.
- Runtime tests and external API calls: not run, as the review task excludes them.
- Production Vercel routing and middleware configuration: not independently inspected at deployment time.
- Caller-side frontend integrations: the separate portfolio frontend repository is outside this workspace.
- Revision comparison: unavailable because no revision was established in the inventory.

Use `/speckub.clarify` to apply these documentation corrections after review. No endpoint specs or application code were changed as part of this review.
