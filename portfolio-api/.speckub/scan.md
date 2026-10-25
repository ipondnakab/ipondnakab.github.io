# API inventory scan

- Root: `.`
- Scope: portfolio-api service, Vercel-style file routing under `/api`
- Revision: not available from repo metadata
- Languages / frameworks inspected: TypeScript, Node.js, Vercel serverless functions
- Services inspected: portfolio-api
- Coverage summary: 3 confirmed routes; 0 unresolved candidates in the inspected service

## Confirmed endpoints

| Candidate ID | Service | Method | Full route | Source references | Existing spec | Confidence / unresolved details |
| ------------ | ------- | ------ | ---------- | ----------------- | ------------- | ------------------------------- |
| `portfolio-api.chat.post` | `portfolio-api` | `POST` | `/api/chat` | `dev-server.ts:28-35`, `api/chat.ts:65-140` | `docs/api/chat.md` (created; validated) | High. Local dev server registers `/api/chat` to `chatHandler`; the handler validates requests and calls Groq. No dynamic routing gap detected. |
| `portfolio-api.contact.post` | `portfolio-api` | `POST` | `/api/contact` | `dev-server.ts:28-35`, `api/contact.ts:83-154` | `docs/api/contact.md` (updated; validated) | High. Local dev server registers `/api/contact`; the handler validates a honeypot and LINE payload before sending a push. No dynamic routing gap detected. |
| `portfolio-api.drunkard-game.post` | `portfolio-api` | `POST` | `/api/drunkard-game` | `dev-server.ts:28-35`, `api/drunkard-game.ts:80-154` | `docs/api/drunkard-game.md` (created; validated) | High. Local dev server registers `/api/drunkard-game`; this endpoint requires the `x-secret-key` header and LINE credential setup. No dynamic routing gap detected. |

## Scope and evidence

The repository exposes serverless handlers from `api/*.ts` and a local shim in `dev-server.ts` that mirrors Vercel’s file-based routing. The route map is explicit and not generated dynamically:

- `dev-server.ts` registers:
  - `/api/chat` -> `chatHandler`
  - `/api/contact` -> `contactHandler`
  - `/api/drunkard-game` -> `drunkardGameHandler`
- Each handler is implemented in its matching file under `api/`.

## Routing notes

- The project is dedicated to API endpoints for the portfolio site and is deployed as a separate Vercel project from the static site.
- The local dev shim is a convenience wrapper; production runs through Vercel’s standard runtime.
- No unresolved or inferred route names were included in the confirmed list.
- No additional HTTP endpoint types were detected beyond these POST handlers in the inspected project scope.

## Coverage gaps

- No generated route table or framework router was present beyond the explicit file-based mapping in `dev-server.ts` and the `api/*.ts` handlers.
- Source inspection did not reveal a multi-service monorepo layout in this repo root; all inspected outbound API paths are in the same portfolio-api service.
- Semantic validation is not claimed here; this scan records source-backed routing only.

## Next step

Map service interactions before creating or updating endpoint docs with `/speckub.relations`.
