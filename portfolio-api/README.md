# Portfolio API

The serverless endpoints behind the portfolio site's two interactive features.

| Endpoint            | Serves                                                                                               | Needs                             |
| ------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------- |
| `POST /api/chat`    | The KhunKao assistant widget. Injects the résumé as a system prompt and proxies the completion back. | `GROQ_API_KEY`                    |
| `POST /api/contact` | The contact form at `/contact`. Emails each submission to Kittipat.                                  | `RESEND_API_KEY`, `CONTACT_EMAIL` |

Both share `lib/cors.ts` (origin allowlist, method and preflight handling) and
`lib/rate-limit.ts`, and each keeps its own credentials server-side so nothing
sensitive reaches the browser.

## Why this is a separate project

The main site is a Next.js **static export** (`output: "export"` in
`next.config.js`) deployed to GitHub Pages and Vercel. A static export has no
server, so it cannot host Next.js API routes — there is nowhere in that project
to keep an API key. This directory is therefore deployed as its **own Vercel
project** with its own `package.json` and no dependency on the parent.

That independence is why `lib/knowledge.ts` re-states the résumé instead of
importing `constants/work-experiences.ts` — see the warning at the top of that
file about keeping the two in sync.

## Deploy

**1. Get a Groq API key**

Sign up at [console.groq.com](https://console.groq.com) (no credit card) and
create an API key. The free tier comfortably covers portfolio traffic.

**1b. Get a Resend API key** (for the contact form)

Sign up at [resend.com](https://resend.com) and create an API key. The free tier
is 3,000 emails/month, far beyond what a portfolio contact form sends.

**You do not need to verify a domain.** The endpoint sends from Resend's shared
`onboarding@resend.dev` sender, which will only deliver to the address that owns
the Resend account — and the only recipient here is Kittipat. So sign up with
the same address you set as `CONTACT_EMAIL`.

To send from `contact@kittipat.dev` instead, verify the domain in Resend and set
`CONTACT_FROM` to e.g. `Portfolio <contact@kittipat.dev>`.

**2. Create the Vercel project**

In the Vercel dashboard, add a new project pointing at this repository, then —
before the first deploy — set:

| Setting          | Value           |
| ---------------- | --------------- |
| Root Directory   | `portfolio-api` |
| Framework Preset | Other           |

Root Directory is the important one. Leaving it at the repo root makes Vercel
build the Next.js site instead of this function.

**3. Add the environment variable**

In Project Settings → Environment Variables:

| Name             | Value                                  | Required                                |
| ---------------- | -------------------------------------- | --------------------------------------- |
| `GROQ_API_KEY`   | key from step 1                        | yes — `/api/chat`                       |
| `RESEND_API_KEY` | key from step 1b                       | yes — `/api/contact`                    |
| `CONTACT_EMAIL`  | where form submissions are sent        | yes — `/api/contact`                    |
| `CONTACT_FROM`   | custom sender, needs a verified domain | no — defaults to Resend's shared sender |

Set them for Production, Preview and Development. Each endpoint only checks its
own variables, so the chat widget keeps working if the Resend key is missing,
and vice versa — it returns `500 server_misconfigured` for that endpoint alone.

Deploy. The endpoint is then at `https://<project>.vercel.app/api/chat`.

**4. Point the site at it**

Add this to the main site's environment (locally in `.env`, and in the GitHub
Actions secrets/vars used by `.github/workflows/nextjs.yml`, and in the Vercel
project for `kittipat.dev`):

```
NEXT_PUBLIC_API_BASE_URL=https://<project>.vercel.app
```

Note this is the **origin only, with no path** — `core/environment.ts` appends
`/api/chat` and `/api/contact` itself, so adding an endpoint later never means
another variable to distribute.

When it is unset the chat widget hides itself entirely and the contact form
reports an error instead of a false success, so the site keeps building and
deploying normally before the endpoints exist.

## CORS

`ALLOWED_ORIGINS` in `lib/cors.ts` lists the origins permitted to call either
endpoint:

- `https://kittipat.dev` and `https://www.kittipat.dev`
- `https://ipondnakab.github.io`
- `http://localhost:3000`

Requests from anywhere else get a 403. **If you add a domain to the site, add it
here too** or the widget will fail on that host.

## Updating the résumé

`lib/knowledge.ts` is the assistant's only source of facts. When you change
`constants/work-experiences.ts`, `constants/outsource-projects.ts`,
`constants/resume-skills.ts` or `constants/mini-project.ts` in the main repo,
mirror the change here and redeploy — otherwise the assistant will state stale
facts confidently.

## Local development

```bash
cd portfolio-api
yarn install
cat > .env.local <<'EOF'
GROQ_API_KEY=gsk_your_key
RESEND_API_KEY=re_your_key
CONTACT_EMAIL=you@example.com
EOF
yarn dev          # serves /api/chat and /api/contact on :3001
yarn typecheck    # tsc --noEmit
```

`.env.local` is gitignored. `yarn dev` prints which variables it found, so a
missing one is obvious at startup rather than as a 500 later.

Then point the site at it — `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`
in the main repo's `.env`. The CORS allowlist already permits
`http://localhost:3000`, which is the origin `next dev` serves from.

Override the port with `PORT=3099 yarn dev` if 3001 is taken.

Smoke-test without the browser:

```bash
curl -s -X POST http://localhost:3001/api/chat \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Where does Kittipat work?"}]}'
```

`500 server_misconfigured` means `GROQ_API_KEY` didn't load; `403
origin_not_allowed` means the `Origin` header was missing.

### Why not `vercel dev`

`vercel dev` resolves its project by walking **up** the directory tree. The
repository root has a `.vercel/repo.json` linking the main site (`kittipat`,
directory `.`), so running `vercel dev` from here finds that link, sees no entry
for `portfolio-api`, and serves the Next.js site instead of this function — every
request to `/api/chat` returns the site's 404 page.

`yarn dev` (see `dev-server.ts`) sidesteps this by importing the handler
directly. If you do want `vercel dev`, run `npx vercel link` in this directory
first and answer **No** to "link to existing project" — that writes a
`portfolio-api/.vercel/project.json`, which stops the upward walk.

## Limits and cost

### `/api/chat`

- **Model:** `llama-3.3-70b-versatile` (open weights, served by Groq).
- **Per reply:** capped at 400 completion tokens.
- **Per visitor:** 10 requests/minute.
- **Validation:** max 20 turns, max 1,000 characters per message; the transcript
  must end on a visitor turn.
- **Watch the TPM ceiling.** Groq's free tier allows 12,000 tokens/minute and
  each request carries the ~2,700-token system prompt, so roughly 4 messages per
  minute across all visitors. Beyond that the endpoint returns 429 and the widget
  shows its "too many messages" copy.

### `/api/contact`

- **Provider:** Resend, 3,000 emails/month on the free tier.
- **Per visitor:** 3 submissions/hour. Counted _after_ validation, so a typo
  doesn't burn quota — only genuine send attempts do.
- **Validation:** name ≤ 100, email ≤ 200, content ≤ 5,000 characters, and the
  email must parse.
- **Spam:** a hidden `website` honeypot field. When a bot fills it the endpoint
  logs and returns `200 {ok:true}` without sending — telling a bot it was caught
  just invites a retry with the field left blank.
- **Header injection:** newlines are stripped from the name before it goes into
  the subject line.

Both endpoints are best-effort rate limited — see the comment in
`lib/rate-limit.ts` on why serverless in-memory counting isn't airtight and what
to swap in (Upstash Redis) if it ever needs to be. Neither forwards a provider's
error text to the browser: failures are logged server-side and surface as a
generic error.
