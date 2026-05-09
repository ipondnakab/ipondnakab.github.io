# copilot-instructions.md

## Project-specific instructions for Copilot AI assistant

This repository uses yarn as the package manager — prefer `yarn` commands in suggestions and automation.

## Purpose

Keep a single source of truth describing coding patterns, directory structure, and contributor conventions to make automated and human contributors consistent.

## High-level guidance

1. Be friendly and concise by default (≤100 words).
2. Ask one clarifying question at a time if a request is ambiguous.
3. Keep files small and focused; prefer many small components over large monoliths.

## Project structure

- app/ — Next.js app routes and page-level components
- components/ — shared presentational and container components
- interfaces/ — TypeScript interfaces and small docs (e.g., field-controller.ts)
- libs/ — utilities and SDK wrappers (firebase, etc.)
- constants/, public/, styles/ — static data and assets

## React component conventions

- Use arrow-function components + explicit Props interface:
  - export interface XxxProps { /_ props _/ }
  - const Xxx: React.FC<XxxProps> = ({}) => { ... }
  - export default Xxx;
- Prefer `unknown` instead of `any` where feasible.
- Prefer concrete generics for forms (TFieldValues, TContext).
- Keep components pure; lift state up when needed.

## Forms and field-controller

- Centralize form logic using components/form-hook-wrapper (React Hook Form + zod resolver).
- Use interfaces/field-controller.ts FieldController<T> for declarative field configs:
  - { name, rules }
- Avoid value-transforming register options in FieldController; keep field configs declarative.

## Styling

- Tailwind CSS is used — prefer utility classes for layout and small variations.
- Keep longer styles in small wrapping components or layout files when reuse is needed.

## Imports, linting, and formatting

- eslint-plugin-simple-import-sort enforces import groups and order.
- Run `yarn lint:fix` or save in VSCode to auto-sort imports. VSCode is preconfigured to run organizeImports + eslint fixes on save.
- ESLint + Prettier are integrated.
- Preferred commands:
  1. yarn lint
  2. yarn lint:fix
  3. yarn format
- Use `yarn lint:fix` before committing to apply auto-fixes and import sorting.

## Editor config (VSCode)

- .vscode/settings.json runs:
  - source.organizeImports: true
  - source.fixAll.eslint: true
  - formatOnSave: true
- Recommended extensions: ESLint, Prettier — listed in .vscode/extensions.json.

## Git and PR expectations

- Keep commits focused and small.
- Use present-tense, type-scoped messages (feat:, fix:, chore:, refactor:).
- When this assistant makes commits, include the Co-authored-by trailer:
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
- Run `yarn lint:fix` and `yarn format` before opening a PR.
- Keep changes minimal and document behavioral changes in the PR description.

## When to ask the user

- For large refactors affecting more than 3 files, ask for confirmation first.
- For design decisions such as validation strategy or state management approach.

## Troubleshooting tips

- If ESLint reports parserOptions project errors for non-TS files (e.g., next.config.js), add them to tsconfig.json `include` or adjust parserOptions.project.
- If Prettier doesn’t run, check package.json format script glob and use the repo-wide glob: `"**/*.{js,jsx,ts,tsx,json,css,md}"`.

## Keep this document updated

When patterns change, update this file so future automation and contributors follow the same conventions.
