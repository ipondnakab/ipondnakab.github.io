# Coding Guide & Templates

Concrete coding rules and copy-paste templates for this repo. For the layering
and the reasoning behind it see [ARCHITECTURE.md](ARCHITECTURE.md); for the
non-negotiables see [the constitution](../.specify/memory/constitution.md).

These templates mirror patterns already in the codebase. When in doubt, copy an
existing file in the same folder and adapt it.

---

## 1. File & naming conventions

| Thing                     | Convention                          | Example                                 |
| ------------------------- | ----------------------------------- | --------------------------------------- |
| Component file            | `PascalCase.tsx`                    | `PlanningPokerHeader.tsx`               |
| Page file                 | always `page.tsx` in a route folder | `src/app/contact/page.tsx`              |
| Type / model file         | `kebab-case.ts`                     | `model/poker.ts`                        |
| Constant file             | `kebab-case.ts`                     | `constants.ts`, `constants/chapters.ts` |
| Helper file               | `kebab-case.ts`                     | `lib/group-vote-averages.ts`            |
| Test file                 | `<name>.test.ts(x)` beside the code | `lib/credit.test.ts`                    |
| Component / type names    | `PascalCase`                        | `RoomData`, `InputString`               |
| Functions / variables     | `camelCase`                         | `buildGroupAverages`                    |
| Exported constants (data) | `UPPER_SNAKE_CASE`                  | `NAV_MENUS`, `DECKS`                    |
| Feature folder            | `kebab-case/`                       | `src/features/planning-poker/`          |

Rules:

- One primary component per file; `export default` that component.
- A feature's code lives in one folder under `src/features/<name>/`.
- Import repo-local modules with the `@/` alias (→ `./src/`); use relative `./`
  only for same-folder siblings. `../` is banned by ESLint.

---

## 2. Where a new file goes

```
src/features/<name>/
├── components/     UI. PascalCase.tsx, one component per file.
├── lib/            Pure helpers. Framework-agnostic. Tests live here too.
├── model/          Types and interfaces.
├── constants.ts    Static data. Becomes constants/ when it grows.
└── index.ts        Public API: types, constants, helpers. NOT components.
```

Cross-cutting code goes to `src/shared/` instead:

| It is…                                    | Put it in           |
| ----------------------------------------- | ------------------- |
| A reusable input or form primitive        | `shared/ui/`        |
| Part of the app shell / navigation        | `shared/layouts/`   |
| A React context provider                  | `shared/providers/` |
| A third-party SDK wrapper                 | `shared/lib/`       |
| Env, site metadata, nav, collection names | `shared/config/`    |
| i18n setup or locale JSON                 | `shared/i18n/`      |
| A type used by more than one feature      | `shared/types/`     |

**Dependency direction** (lint-enforced): `app/` → `features/` → `shared/`.
`shared/` must never import `features/`. See [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 3. Component template

Every component: `"use client"` (if it uses hooks/browser/events), an exported
`Props` interface, an arrow function typed `React.FC`, and a default export.

```tsx
"use client";
import { Button } from "@nextui-org/react";
import React from "react";

export interface ExampleCardProps {
  title: string;
  onConfirm?: () => void;
}

const ExampleCard: React.FC<ExampleCardProps> = ({ title, onConfirm }) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Button color="primary" onPress={onConfirm}>
        Confirm
      </Button>
    </div>
  );
};

export default ExampleCard;
```

- Props with no fields still get an interface: `export interface FooProps {}`.
- Omit `"use client"` only for pure server components — typically `page.tsx`.

---

## 4. Page template (App Router)

Pages are thin: set `metadata`, render one feature component. Wrap components
that read search params (`useSearchParams`) in `<Suspense>`.

```tsx
import type { Metadata } from "next";

import FeatureName from "@/features/feature-name/components/FeatureName";

export const metadata: Metadata = {
  title: "Feature Title",
  description: "Short description for SEO.",
  alternates: { canonical: "/feature-name" },
};

const FeatureNamePage = () => {
  return <FeatureName />;
};

export default FeatureNamePage;
```

A route with no feature module behind it (static content like `/credit` or
`/drunkard-game/privacy`) may stay self-contained.

---

## 5. The barrel (`index.ts`)

Export **types, constants and pure helpers**. Never client components.

```ts
// src/features/planning-poker/index.ts
export { PLANNING_POKER_HISTORY_LIMIT } from "./constants";
export { buildGroupAverages } from "./lib/group-vote-averages";
export { DECKS } from "./model/poker";
export type { DeckType, RoomData } from "./model/poker";
```

Consumers:

```ts
import type { RoomData } from "@/features/planning-poker"; // ✅ barrel
import PlanningPoker from "@/features/planning-poker/components/PlanningPoker"; // ✅ component by path
import { DECKS } from "@/features/planning-poker/model/poker"; // ❌ private internal
```

**Why components are excluded:** in the App Router every client component
reachable from a barrel lands in that route's client-reference manifest, so
re-exporting them drags the whole feature into any route that imports the
barrel. This measurably doubled `/contact/success`'s First Load JS.

---

## 6. Types & models

Data shapes are the source of truth and live in `model/` (feature) or
`src/shared/types/` (cross-cutting), never inline in a component.

```ts
// src/features/planning-poker/model/poker.ts
export type DeckType = "fibonacci" | "tshirt" | "custom";

export interface PlayerVote {
  name: string;
  score: string | null;
  group?: string;
}

export interface RoomData {
  adminId: string;
  revealed: boolean;
  deckType: DeckType;
  customDeck?: string[];
  votes: Record<string, PlayerVote>;
}
```

- `interface` for object shapes (ESLint-enforced), `type` for unions/aliases.
- `Record<K, V>` for maps; optional fields with `?`.
- Avoid `any` — use `unknown` and narrow, or define a precise type.

---

## 7. Constants

Static data tables are typed against an interface, often `as const`.

```ts
// src/shared/config/nav-menu.ts
import { Menu } from "@/shared/types/menu";

export const NAV_MENUS: Menu[] = [
  { name: "home", title: "README", href: "/" },
  { name: "mini-project", title: "MINI-PROJECT", href: "/mini-project" },
] as const;
```

Use `.tsx` only when the data contains JSX (e.g. `shared/config/social.tsx`).

---

## 8. Helpers, SDK wrappers and config

- `features/<name>/lib/` — pure helpers for one feature, with tests beside them.
- `shared/lib/` — cross-cutting helpers and SDK wrappers. Validate required env
  at module load (see `shared/lib/firebase.ts`), and guard against re-init in
  the static/HMR environment (`getApps().length ? getApp() : init`).
- `shared/config/environment.ts` — the one place `process.env.NEXT_PUBLIC_*` is
  read. Read env here, not scattered across components.

---

## 9. Tests

Vitest + Testing Library with jsdom. `globals: false`, so import the API
explicitly. Tests import through `@/` exactly like production code.

```ts
// src/features/pokdeng/lib/credit.test.ts
import { describe, expect, it } from "vitest";

import { pokdengHostCredit } from "@/features/pokdeng/lib/credit";

describe("pokdengHostCredit", () => {
  it("mirrors the table so the game stays zero-sum", () => {
    const players = [
      { id: "a", name: "Ann", credit: 40, status: "active" as const },
      { id: "b", name: "Ben", credit: -100, status: "active" as const },
    ];
    expect(pokdengHostCredit(players)).toBe(60);
  });
});
```

```bash
yarn test           # once
yarn test:watch     # watch
yarn test:coverage  # v8 coverage
```

Rules:

- Write the test before the implementation and **see it fail first**.
- Prioritise pure logic in `lib/` — that is where the real invariants live.
- Name the behaviour, not the function: "mirrors the table so the game stays
  zero-sum" beats "returns a number".

---

## 10. Forms

Build forms with `FormHookWrapper` (React Hook Form) and the
`src/shared/ui/inputs/*` field components. Validation is declarative via each
field's `rules` prop; an optional zod `validationSchema` can be passed to the
wrapper.

```tsx
"use client";
import { Button } from "@nextui-org/react";
import React, { useRef } from "react";

import { ContactForm } from "@/features/contact";
import FormHookWrapper, {
  FormHookWrapperRef,
} from "@/shared/ui/form/FormHookWrapper";
import InputString from "@/shared/ui/inputs/InputString";

const defaultValues: ContactForm = { name: "", email: "", content: "" };

const ExampleForm: React.FC = () => {
  const formRef = useRef<FormHookWrapperRef<ContactForm>>(null);

  const onSubmit = async (data: ContactForm) => {
    // handle submit
  };

  return (
    <FormHookWrapper<ContactForm>
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      ref={formRef}
    >
      {() => (
        <div className="flex flex-col gap-4">
          <InputString
            name="name"
            label="Name"
            rules={{ required: "Name is required" }}
          />
          <Button type="submit" color="primary">
            Submit
          </Button>
        </div>
      )}
    </FormHookWrapper>
  );
};

export default ExampleForm;
```

Rules:

- New input components extend `FieldController<TFieldValues, TName>` and render
  a NextUI control inside a RHF `<Controller>` (see `shared/ui/inputs/InputString.tsx`).
- Set `data-testid={name}` on inputs so tests can target them.
- Keep `FieldController` configs declarative — no value-transforming register options.

---

## 11. Internationalisation

Every user-facing string goes through `react-i18next`, and every key must exist
in all five locales under `src/shared/i18n/locales/`: `en`, `th`, `ja`, `sv`, `zh`.

```tsx
const { t } = useTranslation();
return <h1>{t("miniProject.title")}</h1>;
```

For localised **data** (not UI copy), use `LocalizedText` and resolve it:

```ts
import { localize } from "@/shared/lib/localize";

localize(project.description, i18n.language); // falls back to en
```

English is the fallback. A missing key is a bug, not graceful degradation.

---

## 12. Styling

- Tailwind utility classes for layout and spacing.
- NextUI theme tokens (`primary`, `background`, `foreground`) from
  `tailwind.config.ts` instead of raw hex.
- `darkMode: "class"`; default theme is `dark` (set in `src/app/providers.tsx`).
  Don't assume light mode — verify both.
- `clsx` for conditional class names.
- Extract repeated class strings into a small wrapper component rather than
  copy-pasting long class lists.
- Respect `prefers-reduced-motion` via `useReducedMotion` wherever motion is used.

---

## 13. Static-export constraints (important)

The site is `output: "export"` — there is **no server at runtime**:

- ❌ No API routes (`app/api/...`), server actions, `getServerSideProps`, or
  middleware that needs a server.
- ❌ No server-only secrets — everything in the bundle is public.
- ✅ Data fetching happens client-side inside `"use client"` components/hooks.
- ✅ `next/image` is set to `unoptimized`.
- ✅ Guard browser-only code with `typeof window !== "undefined"`.
- ✅ A real backend goes in `portfolio-api/` and is reached over
  `NEXT_PUBLIC_API_BASE_URL`.

---

## 14. Firebase / Firestore patterns

- Import the shared `db` from `@/shared/lib/firebase`; never re-initialize.
- Use collection-name constants from `@/shared/config/database-name`.
- Reference shapes in the feature's `model/` before reading/writing.
- Partial updates: `setDoc(ref, partial, { merge: true })` — preserve unrelated
  keys in nested maps.
- Remove a map entry with `deleteField()`.
- Clean up `onSnapshot` subscriptions in a `useEffect` cleanup.

---

## 15. Three.js patterns

- Mount the renderer into a `ref` DOM node.
- On unmount, fully clean up: `cancelAnimationFrame`, dispose geometries,
  materials and textures, and stop the animation mixer. Reference the existing
  disposal logic in `src/features/threejs/components/ThreeScene.tsx` — memory
  leaks here are a known past bug.
- Use typed material/texture guards instead of `any`.

---

## 16. Enforced rules (ESLint errors)

Wired into `.eslintrc.json` as **errors** — they fail `yarn lint` and
`next build`, so they're not optional:

| Rule                                             | What it enforces                                          |
| ------------------------------------------------ | --------------------------------------------------------- |
| `@typescript-eslint/no-explicit-any`             | No `any`. Use `unknown` + narrowing or a real type.       |
| `no-console`                                     | No `console.*` except `warn`/`error`.                     |
| `unused-imports/no-unused-imports`               | No unused imports.                                        |
| `unused-imports/no-unused-vars`                  | No unused vars (prefix intentional with `_`).             |
| `no-restricted-imports`                          | No `../`; **and the `app`/`features`/`shared` layering**. |
| `@typescript-eslint/consistent-type-definitions` | Object shapes use `interface`, not `type`.                |
| `eqeqeq` (smart)                                 | Use `===` / `!==` (allows `== null`).                     |
| `no-var` / `prefer-const`                        | No `var`; `const` where not reassigned.                   |
| `no-unneeded-ternary` / `object-shorthand`       | Cleaner expressions and object literals.                  |

Conventions that aren't auto-enforceable but are still required: `"use client"`
on any file using hooks/browser APIs, `export default` for the primary
component, and the `React.FC` + `Props` interface shape.

---

## 17. Definition of done

```bash
yarn typecheck && yarn lint && yarn test && yarn build
```

1. `yarn typecheck` passes (no type errors).
2. `yarn lint` passes (`yarn lint:fix` applied).
3. `yarn test` passes, and new logic has tests that were red first.
4. `yarn build` succeeds, and the First Load JS delta for touched routes is
   understood and justified.
5. `yarn format` applied (or handled by the pre-commit hook).
6. Verified in `yarn dev` — both dark and light themes when UI changed.
7. Copy added to all five locales.
8. No `any`, no stray `console.*`, no committed secrets, no leaked resources.

Report real results. If a gate was skipped, say so.
