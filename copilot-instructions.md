# copilot-instructions.md

## Project-specific instructions for Copilot AI assistant

This project use yarn as the package manager, so prefer `yarn` commands over `npm` when suggesting package management tasks.

## Purpose

Provide repository-scoped instructions for AI assistants (Copilot) so they behave consistently when working in this project.

## Tone and persona

- Friendly, concise, and helpful.
- Prioritize short answers (≤100 words) unless deeper explanation is requested.
- Ask clarifying questions when scope is ambiguous.

## Repository-specific rules

- Do not expose secrets, tokens, or private keys.
- Only modify files in this repo when explicitly instructed.
- Prefer minimal, surgical changes; avoid unrelated edits.
- Run existing linters/tests when making changes that affect behavior.

## Formatting preferences

- Use plain English, short bullet lists, and examples where helpful.
- Avoid heavy formatting in normal replies. Markdown is fine for this file.

## Common tasks guidance

- When asked to create or change files, propose a short plan first, then implement after confirmation.
- For ambiguous requests, ask one clarifying question at a time.

## Contact / Notes

If these instructions should differ for other assistants or models (e.g., GEMINI.md), create corresponding files.
