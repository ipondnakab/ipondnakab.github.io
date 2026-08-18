# Feature Specification: [FEATURE NAME]

**Feature branch:** `[###-feature-slug]`
**Created:** [DATE]
**Status:** Draft
**Input:** "[the user's original description]"

## Execution flow

```
1. Parse the user description. If empty -> ERROR "No feature description provided".
2. Extract the actors, actions, data and constraints.
3. Mark every ambiguity with [NEEDS CLARIFICATION: <the specific question>].
4. Write the user scenarios. If there is no clear user flow -> ERROR.
5. Write functional requirements. Every one must be testable.
6. Identify the key entities if the feature stores or shapes data.
7. Run the review checklist. Unresolved [NEEDS CLARIFICATION] -> WARN.
```

---

## ⚡ Guidelines

- ✅ Describe WHAT users need and WHY.
- ❌ No HOW: no file paths, component names, library choices or schemas.
- 👥 Written for the person deciding what to build, not for the implementer.

---

## User scenarios & testing _(mandatory)_

### Primary user story

[One paragraph, plain language: who does what, and what they get.]

### Acceptance scenarios

1. **Given** [initial state], **when** [action], **then** [observable outcome].
2. **Given** [initial state], **when** [action], **then** [observable outcome].

### Edge cases

- What happens when [boundary condition]?
- How does the feature behave when [error / offline / empty state]?

---

## Requirements _(mandatory)_

### Functional requirements

- **FR-001:** The system MUST [specific, observable capability].
- **FR-002:** Users MUST be able to [specific interaction].
- **FR-003:** The system MUST [behaviour under a named constraint].

_Mark anything underspecified rather than guessing:_

- **FR-00X:** The system MUST [behaviour] [NEEDS CLARIFICATION: which limit applies?]

### Non-functional requirements

- **NFR-001 (static export):** The feature MUST work with no server at runtime —
  no API routes, no server actions, no server-only secrets.
- **NFR-002 (i18n):** All user-facing copy MUST be added to every locale in
  `src/shared/i18n/locales/`.
- **NFR-003 (themes):** The feature MUST be legible in both the dark (default)
  and light themes.
- **NFR-004 (accessibility):** Interactive elements MUST be reachable by
  keyboard and carry accessible names.

### Key entities _(only if the feature stores or shapes data)_

- **[Entity]:** what it represents, and the attributes that matter to users.

---

## Review & acceptance checklist

### Content quality

- [ ] No implementation detail (no libraries, file paths or component names)
- [ ] Written for a non-technical stakeholder
- [ ] Every mandatory section is filled in

### Requirement completeness

- [ ] No `[NEEDS CLARIFICATION]` markers remain
- [ ] Every requirement is testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope has an explicit boundary (what is _not_ included)

---

## Execution status

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed
