# API document standard

Use this structure for new specs and meaningful updates. Keep the versioned HTTP
frontmatter unchanged; detailed contracts belong in Markdown. Adapt detail to the
endpoint rather than adding empty boilerplate. Preserve useful existing sections.

## Structure

| Section                          | What to establish from evidence                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Overview                         | Purpose, intended callers when known, and meaningful limitations                                             |
| Contract                         | Method, full route, request/response media types, API version if any                                         |
| Authentication and authorization | Credentials, roles/scopes, ownership checks, middleware and deployment boundaries                            |
| Request                          | Headers, path/query parameters, body fields, types, required/nullable rules, constraints, defaults, encoding |
| Responses                        | Status codes, headers, field shapes, nullability, pagination when applicable                                 |
| Errors                           | Triggering conditions, status, actual error code/message/shape, and supported retry guidance                 |
| Behavior                         | Business rules, side effects, idempotency/retry effects, ordering and consistency where relevant             |
| Relationships                    | Upstream callers, downstream APIs/services, events, triggers, and dependency failure behavior                |
| Request flow                     | Source-backed Mermaid sequence diagram; see sequence-diagrams.md                                             |
| Examples                         | Copyable request and representative success/failure responses with synthetic values                          |
| Limits and operations            | Rate/payload limits, timeouts, cancellation, relevant deployment constraints                                 |
| Evidence and verification        | Source files/symbols, uncertainties, structural checks, AI review and runtime test status                    |

Represent request and response fields with tables when useful:

| Field | Location | Type | Required / nullable | Constraints / default | Meaning |
| ----- | -------- | ---- | ------------------- | --------------------- | ------- |

For nested bodies, describe object/array structure and distinguish required from
nullable. A response field table may omit Location. Explain conditional fields
and avoid ambiguous values such as a bare dash for unknown constraints.

Use an error table with status, actual code/message, trigger, and caller action.
If no machine-readable error code exists, say so instead of inventing one. Do not
assume all framework-standard statuses are implemented. In particular, an
unsupported method may return a fallback 404 rather than 405.

Use a relationship table with target identity, interaction, trigger/condition,
and failure behavior. Distinguish an unknown dependency policy from a confirmed
absence of handling. Link only to known files; otherwise reference mapping IDs.

## Evidence rules

- Separate implemented behavior, user-intended behavior, inference, and unknowns.
  Do not turn an assumption into a contract because it is common practice.
- Distinguish absent from unknown: "No auth check in the inspected handler"
  does not prove a production gateway permits anonymous calls.
- State units, boundaries, defaults, formats and conditional rules when supported.
  Do not promise a timeout, performance target, retry policy, or rate limit without evidence.
- Use “Not applicable” with a reason for irrelevant sections. Use “Not established
  from inspected source” for unknowns and say which evidence is missing. Do not
  leave placeholders or fill gaps with fictional details.
- Keep examples aligned with documented fields, media types and status codes.
  Label local example base URLs and mock/illustrative responses. Never include
  real credentials or personal data. Copyable examples are not necessarily tested.
- Cite source paths and symbols for material behavior and uncertainty; prefer
  stable symbols to relying exclusively on line numbers. Record reviewed scope
  and revision when available, without absolute machine-specific paths in specs.

## Review checklist

Before handing off a document, check:

- Frontmatter parses, the endpoint ID stays stable, and source references exist.
- Method/path, auth, validation and status codes agree with routing/middleware.
- Required/default/nullable rules and nested body shapes are explicit where known.
- Errors explain when they occur; examples match success and failure contracts.
- Side effects, dependency failures and async behavior are covered where applicable.
- Relationships and the sequence diagram agree with source and each other.
- No unsupported fields, invented details, unresolved template placeholders or secrets.
- Unknowns and deployment gaps remain visible; unrelated handwritten content survives.
- Verification distinguishes CLI structural/reference checks, AI source review,
  Mermaid rendering, and runtime tests. Report not-run checks honestly. The CLI's
  semantic check remains `skipped`, even after an agent source review.

These are agent review criteria, not new deterministic CLI checks. Do not claim
the CLI enforces Markdown completeness, Mermaid syntax or API semantics.
