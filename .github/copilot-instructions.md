# Copilot instructions

Personal portfolio + playground for Kittipat Daengdee: **Next.js 14 App Router,
TypeScript strict, NextUI + Tailwind, deployed to GitHub Pages as a static
export** (`output: "export"`). Package manager is **yarn**.

The authoritative rules are in [`.specify/memory/constitution.md`](../.specify/memory/constitution.md);
[`CLAUDE.md`](../CLAUDE.md), [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) and
[`docs/CODING_GUIDE.md`](../docs/CODING_GUIDE.md) expand on them. The essentials:

## There is no server

The site is statically exported. Do **not** add API routes (`app/api/**`), server
actions, `getServerSideProps` or middleware. All config is `NEXT_PUBLIC_*` and
therefore public; read it via `src/shared/config/environment.ts`. Data access
happens in the browser. Anything needing a backend goes to the separate
`portfolio-api/` Vercel project over `NEXT_PUBLIC_API_BASE_URL`.

## Layout and dependency direction

```
src/app/        routes — thin pages: metadata + one feature component
src/features/   one folder per feature: components/ lib/ model/ constants index.ts
src/shared/     ui/ layouts/ providers/ seo/ lib/ config/ i18n/ types/
```

- `app/` may import `features/` and `shared/`.
- `features/` may import `shared/`, and another feature only via
  `@/features/<name>` or `@/features/<name>/components/<Component>`.
- `shared/` must **never** import `features/` or `app/` — invert with a slot
  prop instead (see `DefaultLayout`'s `overlay`).
- A feature's `lib/`, `model/` and `constants` are private.
- Barrels (`index.ts`) export **types, constants and pure helpers — never client
  components**. Re-exporting a client component inflates every route that
  touches the barrel.

`no-restricted-imports` overrides in `.eslintrc.json` enforce all of this.

## Conventions

- Import with the `@/` alias (→ `./src/`). Relative `./` only for same-folder siblings; `../` is banned.
- Components: arrow function typed `React.FC`, exported `XxxProps` interface, `export default`.
- `"use client"` at the top of any file using hooks, browser APIs or handlers.
- Types in `model/` (feature) or `src/shared/types/`. Static data in `constants`. Never inline either.
- No `any`. No `console.*` except `warn`/`error`. `interface` for object shapes. `===`, `const`, object shorthand.
- Tailwind + NextUI theme tokens (`primary`, `background`, `foreground`) — no raw hex. Dark is default; light must work too.
- All user-facing copy goes in **all five** locales under `src/shared/i18n/locales/` (`en`, `th`, `ja`, `sv`, `zh`).
- Forms use `src/shared/ui/form/FormHookWrapper` with `src/shared/ui/inputs/*`.
- Release every resource: `onSnapshot` unsubscribes, peer connections close, Three.js scenes `cancelAnimationFrame` and dispose geometries/materials/textures.

## Tests

Vitest + Testing Library (jsdom), `globals: false` — import `describe`/`it`/`expect`
from `vitest`. Tests sit beside the code as `<name>.test.ts`. Prioritise pure
logic in `lib/`; write the test first and see it fail.

## Definition of done

```bash
yarn typecheck && yarn lint && yarn test && yarn build
```

`next build` runs ESLint and the type-check, so any rule violation breaks the
GitHub Pages deploy. Fix the code — never downgrade a rule to make a build pass.
Watch the First Load JS numbers `yarn build` prints; they are user-facing.

## Firestore

Import the shared `db` from `@/shared/lib/firebase`; never re-initialize.
Collection names come from `@/shared/config/database-name`. Planning Poker room
state is one document keyed by `?room=`; `votes` is a `userId -> PlayerVote` map
(`src/features/planning-poker/model/poker.ts`). Use `setDoc(ref, partial, { merge: true })`
and `deleteField()` so unrelated keys survive.
