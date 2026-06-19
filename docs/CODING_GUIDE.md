# Coding Guide & Templates

Concrete coding rules and copy-paste templates for this repo. For the high-level
overview and commands, see [CLAUDE.md](../CLAUDE.md).

These templates mirror patterns already in the codebase. When in doubt, copy an
existing file in the same folder and adapt it.

---

## 1. File & naming conventions

| Thing                     | Convention                          | Example                      |
| ------------------------- | ----------------------------------- | ---------------------------- |
| Component file            | `PascalCase.tsx`                    | `PlanningPokerHeader.tsx`    |
| Page file                 | always `page.tsx` in a route folder | `app/contact/page.tsx`       |
| Interface/type file       | `kebab-case.ts`                     | `field-controller.ts`        |
| Constant file             | `kebab-case.ts`                     | `nav-menu.ts`                |
| Utility file              | `kebab-case.ts`                     | `text-to-capital.ts`         |
| Component / type names    | `PascalCase`                        | `RoomData`, `InputString`    |
| Functions / variables     | `camelCase`                         | `textToCapital`              |
| Exported constants (data) | `UPPER_SNAKE_CASE`                  | `NAV_MENUS`, `DECKS`         |
| Folder per feature        | `kebab-case/`                       | `components/planning-poker/` |

Rules:

- One primary component per file; `export default` that component.
- Co-locate a feature's components in a single folder under `components/<feature>/`.
- Import repo-local modules with the `@/` alias; use relative `./` only for
  same-folder siblings.

---

## 2. Component template

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
- Omit `"use client"` only for pure server components (no hooks/handlers/browser
  APIs) — typically thin `page.tsx` wrappers.

---

## 3. Page template (App Router)

Pages are thin. Put logic in a client component under `components/` and keep the
page a server component that sets `metadata` and renders it. Wrap components that
read search params (e.g. `useSearchParams`) in `<Suspense>`.

```tsx
import { Suspense } from "react";

import FeatureName from "@/components/feature-name/FeatureName";

export const metadata = {
  title: "Feature Title",
  description: "Short description for SEO.",
};

const FeatureNamePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeatureName />
    </Suspense>
  );
};

export default FeatureNamePage;
```

A page may itself be `"use client"` when it owns the interactive logic (see
`app/contact/page.tsx`), but prefer pushing logic into a component.

---

## 4. Types & interfaces (`interfaces/`)

Data shapes are the source of truth and live in `interfaces/`, not inline in
components. Use unions for closed sets and export related constants alongside.

```ts
// interfaces/poker.ts
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

- Prefer `interface` for object shapes, `type` for unions/aliases.
- Use `Record<K, V>` for maps; mark optional fields with `?`.
- Avoid `any` — use `unknown` and narrow, or define a precise type.

---

## 5. Constants (`constants/`)

Static data tables live in `constants/`, typed against an interface, often
`as const`.

```ts
// constants/nav-menu.ts
import { Menu } from "@/interfaces/menu";

export const NAV_MENUS: Menu[] = [
  { name: "home", title: "README", href: "/" },
  { name: "mini-project", title: "MINI-PROJECT", href: "/mini-project" },
] as const;
```

Use `.tsx` only when the data contains JSX (e.g. `constants/social.tsx`).

---

## 6. Utilities (`functions/`) and SDK wrappers (`libs/` / `core/`)

- `functions/` — small, pure, framework-agnostic helpers (one named export each).

  ```ts
  // functions/text-to-capital.ts
  export const textToCapital = (text: string) =>
    text
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  ```

- `libs/` — wrap a third-party SDK and export a ready-to-use instance. Validate
  required env at module load (see `libs/firebase.ts`), and guard against
  re-init in the static/HMR environment (`getApps().length ? getApp() : init`).
- `core/environment.ts` — central place to read `process.env.NEXT_PUBLIC_*` with
  sane local fallbacks. Read env here, not scattered across components.

---

## 7. Forms

Build forms with `FormHookWrapper` (React Hook Form) and the `components/inputs/*`
field components. Validation is declarative via each field's `rules` prop; an
optional zod `validationSchema` can be passed to the wrapper.

```tsx
"use client";
import { Button } from "@nextui-org/react";
import React, { useRef } from "react";

import FormHookWrapper, {
  FormHookWrapperRef,
} from "@/components/form-hook-wrapper/FormHookWrapper";
import InputString from "@/components/inputs/InputString";
import { ContactForm } from "@/interfaces/contact";

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

- New input components extend `FieldController<TFieldValues, TName>` and render a
  NextUI control inside a RHF `<Controller>` (see `components/inputs/InputString.tsx`).
- Set `data-testid={name}` on inputs for future test targeting.
- Keep `FieldController` configs declarative — don't put value-transforming
  register options in them.

---

## 8. Styling

- Use Tailwind utility classes for layout and spacing.
- Use NextUI theme tokens (`primary`, `background`, `foreground`) from
  `tailwind.config.ts` instead of raw hex values.
- `darkMode: "class"`; default theme is `dark` (set in `app/providers.tsx`). Don't
  assume light mode — verify both.
- Use `clsx` for conditional class names.
- Extract repeated class strings into a small wrapper component rather than
  copy-pasting long class lists.

---

## 9. Static-export constraints (important)

The site is `output: "export"` — there is **no server at runtime**:

- ❌ No API routes (`app/api/...`), server actions, `getServerSideProps`, or
  middleware that needs a server.
- ❌ No server-only secrets — everything in the bundle is public.
- ✅ Data fetching happens client-side (Firebase, `axios`) inside `"use client"`
  components/hooks.
- ✅ `next/image` is set to `unoptimized` — plain `<img>`-style usage is fine.
- ✅ Guard browser-only code with `typeof window !== "undefined"` (see the
  `userId` init in `PlanningPoker.tsx`).

---

## 10. Firebase / Firestore patterns

- Import the shared `db` from `@/libs/firebase`; never re-initialize Firebase.
- Use collection-name constants from `@/constants/database-name`.
- Reference shapes in `interfaces/poker.ts` before reading/writing.
- Partial updates: `setDoc(ref, partial, { merge: true })` — be careful to
  preserve unrelated keys in nested maps.
- Remove a map entry with `deleteField()`.
- Clean up `onSnapshot` subscriptions in a `useEffect` cleanup.

---

## 11. Three.js patterns

- Mount the renderer into a `ref` DOM node.
- On unmount, fully clean up: `cancelAnimationFrame`, dispose geometries,
  materials, and textures, and stop the animation mixer. Reference the existing
  disposal logic in `components/threejs/ThreeScene.tsx` — memory leaks here are a
  known past bug.
- Use typed material/texture guards instead of `any`.

---

## 12. Enforced rules (ESLint errors)

These are wired into `.eslintrc.json` as **errors** — they fail `yarn lint` and
`next build`, so they're not optional:

| Rule                                             | What it enforces                                    |
| ------------------------------------------------ | --------------------------------------------------- |
| `@typescript-eslint/no-explicit-any`             | No `any`. Use `unknown` + narrowing or a real type. |
| `no-console`                                     | No `console.*` except `warn`/`error`.               |
| `unused-imports/no-unused-imports`               | No unused imports.                                  |
| `unused-imports/no-unused-vars`                  | No unused vars (prefix intentional with `_`).       |
| `no-restricted-imports`                          | No `../` parent imports — use the `@/` alias.       |
| `@typescript-eslint/consistent-type-definitions` | Object shapes use `interface`, not `type`.          |
| `eqeqeq` (smart)                                 | Use `===` / `!==` (allows `== null`).               |
| `no-var` / `prefer-const`                        | No `var`; `const` where not reassigned.             |
| `no-unneeded-ternary` / `object-shorthand`       | Cleaner expressions and object literals.            |

Conventions that aren't auto-enforceable but are still required: `"use client"`
on any file using hooks/browser APIs, `export default` for the primary component,
and the `React.FC` + `Props` interface shape. The `next build` step will fail if a
hook is used in a server component, which is the backstop for the `"use client"` rule.

## 13. Definition of done

Before considering a change complete:

1. `npx tsc --noEmit` passes (no type errors).
2. `yarn lint` passes (and `yarn lint:fix` applied).
3. `yarn format` applied (or formatting handled by the pre-commit hook).
4. `yarn build` succeeds if the change could affect the static export.
5. Verified in `yarn dev` (check both dark and light themes when UI changed).
6. No `any`, no stray `console.*`, no committed secrets.
