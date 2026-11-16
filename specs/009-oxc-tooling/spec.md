# Replace ESLint and Prettier with Oxlint and Oxfmt

## Requirements

- Use Oxlint for linting and Oxfmt for formatting across scripts, CI, staged files and editor recommendations.
- Remove direct ESLint/Prettier dependencies and obsolete configuration files.
- Preserve lint error severities, feature boundaries, React/Next.js checks, aliases and explicit unused-variable exemptions.
- Preserve the formatting policy (80 columns, two spaces, semicolons, trailing commas) and provide import sorting and unused-import diagnostics.
- Keep architecture checks and static export working without a Next.js ESLint dependency.
- Keep backend endpoints unchanged; exclude the independently configured portfolio-api project from frontend tooling.

## Acceptance

Real Oxlint rejection tests demonstrate that architecture violations and core coding violations still fail. Formatting is repeatable. All four gates pass, including formatting validation in the lint gate. No material production bundle growth.

## Clarifications

The user explicitly authorized full replacement rather than a trial running both stacks. Oxfmt sorting replaces import ordering; unused import removal belongs to lint fixes/editor actions, not formatter semantics.
