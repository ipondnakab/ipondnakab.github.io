# Architecture

How this repository is laid out, and the rules that keep it that way. The
non-negotiable version of these rules lives in
[.specify/memory/constitution.md](../.specify/memory/constitution.md).

## The shape

```
src/
├── app/                    # App Router routes — thin
│   ├── layout.tsx          # shell: metadata, providers, DefaultLayout + overlay
│   ├── providers.tsx
│   ├── globals.css
│   └── <route>/page.tsx    # metadata + one feature component
│
├── features/               # one folder per feature — the unit a spec maps to
│   └── <name>/
│       ├── components/     # PascalCase.tsx, one component per file
│       ├── lib/            # pure helpers + <name>.test.ts beside them
│       ├── model/          # types and interfaces
│       ├── constants.ts    # or constants/ once it grows
│       └── index.ts        # public API — types, constants, helpers
│
└── shared/                 # cross-cutting, feature-agnostic
    ├── ui/                 # inputs/, form/, WorkingInProgress
    ├── layouts/            # DefaultLayout, switchers, particles
    ├── providers/          # I18nProvider, AnalyticsProvider
    ├── seo/                # StructuredData
    ├── lib/                # firebase, analytics, localize, wake-lock
    ├── config/             # environment, site, nav-menu, social, database-name
    ├── i18n/               # config.ts, languages.ts, locales/*.json
    └── types/              # menu, social, localized-text, field-controller
```

The features today: `planning-poker`, `pokdeng`, `mic-link`, `resume`, `chat`,
`contact`, `prompt-pay`, `profile`, `mini-project`, `threejs`.

## Dependency direction

```
        app/  ──────────────┐
          │                 │
          ▼                 ▼
      features/  ───────►  shared/
          │                  ▲
          └──── barrel ──────┘   (features may read each other's public API only)
```

| From          | May import                                                            |
| ------------- | --------------------------------------------------------------------- |
| `app/`        | `features/`, `shared/`                                                |
| `features/X/` | `shared/`, own internals, `@/features/Y` (barrel) or `Y/components/Z` |
| `shared/`     | `shared/` only — **never** `features/` or `app/`                      |

This is enforced by `no-restricted-imports` overrides in `.eslintrc.json`, one
per feature, so a violation fails `yarn lint` and therefore the build.

**When `shared/` needs a feature**, invert it. `DefaultLayout` needs the chat
widget, so it takes an `overlay` slot and `app/layout.tsx` passes `<ChatWidget />`
in. The shell stays feature-agnostic and no feature leaks into every route.

## Barrels: what goes in, what stays out

`src/features/<name>/index.ts` exports **types, constants and pure helpers**.
It does **not** re-export client components.

This is not stylistic. In the App Router, every client component reachable from
a module the route imports is registered in that route's client-reference
manifest — tree-shaking does not remove it. Re-exporting `Contact` and
`ContactSuccess` from one barrel put both on both routes and took
`/contact/success` from 190 kB to 394 kB First Load JS. Components are therefore
imported by path:

```ts
// route or another feature
import ContactSuccess from "@/features/contact/components/ContactSuccess";
// types, constants, helpers
import type { ContactForm } from "@/features/contact";
```

`package.json` declares `"sideEffects": ["**/*.css"]` so webpack can tree-shake
through the barrels. Only `globals.css` is imported for its side effects; keep
it that way or the barrels start pulling their whole feature along.

## Routes are thin

A `page.tsx` sets `metadata` and renders one feature component. Logic lives in
the feature module, so the route stays a server component and the client bundle
starts at the component boundary.

The exception: a route with no feature module behind it — `credit`,
`drunkard-game/privacy`, `not-found` — is static content and stays
self-contained.

## Testing

Vitest with jsdom and Testing Library. Tests sit beside the code as
`<name>.test.ts` and import through `@/`, exactly like production code.

```bash
yarn test           # once
yarn test:watch     # watch
yarn test:coverage  # v8 coverage
```

Pure logic in `lib/` is the priority: it is where the real invariants live
(zero-sum credit math, vote averaging, locale fallback) and it tests without a
DOM.

## The gates

```bash
yarn typecheck && yarn lint && yarn test && yarn build
```

`next build` runs ESLint and the type-check too, so a violation of any rule
above breaks the GitHub Pages deploy. Fix the code rather than downgrading the
rule.

## What has no server

The site is `output: "export"`. There are no API routes, no server actions and
no server-only secrets. Anything that needs a backend lives in the separate
`portfolio-api/` Vercel project and is reached over `NEXT_PUBLIC_API_BASE_URL`
via `src/shared/config/environment.ts`.
