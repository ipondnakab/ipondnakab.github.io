# Portfolio API

The serverless endpoints behind the portfolio site's two interactive features.

| Endpoint            | Serves                                                                                               | Needs                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `POST /api/chat`    | The KhunKao assistant widget. Injects the résumé as a system prompt and proxies the completion back. | `GROQ_API_KEY`                              |
| `POST /api/contact` | The contact form at `/contact`. Sends each submission to Kittipat over LINE.                         | `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_USER_ID` |

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

**1b. Set up a LINE Messaging API channel** (for the contact form)

Contact-form submissions arrive as a LINE message. Roughly ten minutes, no
business verification and no message templates.

1. Go to [developers.line.biz](https://developers.line.biz/console/) and log in
   with your LINE account.
2. **Create a new provider** (any name — e.g. `kittipat.dev`).
3. Inside it, **Create a Messaging API channel**. Fill in the name, description,
   category and region.
4. Open the channel's **Messaging API** tab → issue a **Channel access token
   (long-lived)** → `LINE_CHANNEL_ACCESS_TOKEN`.
5. On the same tab, scan the **QR code** with your phone to add the bot as a
   friend. A bot cannot push to someone who has not added it.
6. Open the channel's **Basic settings** tab and copy **Your user ID** (starts
   with `U`) → `LINE_USER_ID`.

   That field is the LINE user ID of whoever owns the developer account — you —
   which is exactly the recipient we want. No webhook needed to discover it.

**Optional but recommended:** in the **Messaging API** tab, disable _Auto-reply
messages_ and _Greeting messages_, otherwise the bot answers your own pushes
with canned replies.

**Why LINE rather than WhatsApp.** Meta's Cloud API needs a Business account, a
separate WhatsApp Business number and a pre-approved message template whose
parameters cannot contain newlines — so a contact message had to be flattened
and capped at 700 characters. LINE pushes free-form text up to 5,000 characters
with no approval step, which is why the limit here is a comfortable 2,000.

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

| Name                        | Value                               | Required             |
| --------------------------- | ----------------------------------- | -------------------- |
| `GROQ_API_KEY`              | key from step 1                     | yes — `/api/chat`    |
| `LINE_CHANNEL_ACCESS_TOKEN` | long-lived channel access token     | yes — `/api/contact` |
| `LINE_USER_ID`              | your LINE user ID (starts with `U`) | yes — `/api/contact` |
| `CONTACT_RATE_LIMIT`        | submissions per hour per visitor    | no — `3`             |

Leave `CONTACT_RATE_LIMIT` unset in Vercel. It exists so local testing isn't
throttled after three submissions — see Local development below.

Set them for Production, Preview and Development. Each endpoint only checks its
own variables, so the chat widget keeps working if the LINE ones are missing,
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
LINE_CHANNEL_ACCESS_TOKEN=your_long_lived_token
LINE_USER_ID=U1234567890abcdef...
CONTACT_RATE_LIMIT=100
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

- **Provider:** LINE Messaging API, pushing to a single user (`LINE_USER_ID`).
  Free-form text, no templates, no approval step.
- **Push quota.** LINE Official Account free plans include a monthly push-message
  allowance that varies by region; a portfolio contact form uses a negligible
  share of it. Exhausting it returns 429, which this endpoint forwards as a
  retryable error so the form shows its "try again later" copy.
- **Per visitor:** 3 submissions/hour by default, overridable with
  `CONTACT_RATE_LIMIT`. Counted _after_ validation, so a typo doesn't burn quota
  — only genuine send attempts do. The counter lives in the serverless
  instance's memory, so restarting `yarn dev` also clears it locally.
- **Validation:** name ≤ 100, email ≤ 200, content ≤ 2,000 characters, and the
  email must parse. The content cap comes from LINE's 5,000-character text
  message and is enforced in the form too, so a visitor is told before
  submitting rather than losing the end of a long message.
- **Spam:** a hidden `website` honeypot field. When a bot fills it the endpoint
  logs and returns `200 {ok:true}` without sending — telling a bot it was caught
  just invites a retry with the field left blank.
- **Formatting:** the submission is sent as JSON in the request body, so
  newlines survive and nothing needs escaping or flattening.

Both endpoints are best-effort rate limited — see the comment in
`lib/rate-limit.ts` on why serverless in-memory counting isn't airtight and what
to swap in (Upstash Redis) if it ever needs to be. Neither forwards a provider's
error text to the browser: failures are logged server-side and surface as a
generic error.
