# Architecture enforcement and folder consistency

## Requirements

- Enforce app → features → shared dependencies across every existing and future frontend feature.
- Keep feature internals private, component imports explicit, and public barrels free of client components.
- Standardize feature folders to components, lib, model and constants without creating empty folders.
- Keep component filenames PascalCase and supporting module filenames kebab-case.
- Run architecture tests with the existing test gate and provide a focused command.
- Preserve UI behavior, localization, static export and the independently deployed portfolio-api project.

## Acceptance

Architecture checks pass over the complete src tree, newly added feature folders are covered automatically, and invalid boundary/placement examples fail. All four project gates pass.

## Clarifications

ArchUnit means the TypeScript package archunit (ArchUnitTS). Scope is the frontend src tree; portfolio-api retains its separate deployment and conventions.
