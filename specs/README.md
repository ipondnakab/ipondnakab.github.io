# Specs

One folder per feature, created by `/speckit.specify`:

```
specs/###-feature-slug/
├── spec.md          # WHAT and WHY  (/speckit.specify)
├── plan.md          # HOW           (/speckit.plan)
├── research.md      # decisions and rejected alternatives
├── data-model.md    # entities and their types
├── contracts/       # Firestore document shapes, portfolio-api request/response
├── quickstart.md    # how to run and exercise the feature
├── checklists/      # focused review checklists (/speckit.checklist)
└── tasks.md         # ordered, file-specific task list (/speckit.tasks)
```

Specs are committed alongside the code they describe. See
[docs/SPEC_DRIVEN_DEVELOPMENT.md](../docs/SPEC_DRIVEN_DEVELOPMENT.md) for the
workflow and [.specify/memory/constitution.md](../.specify/memory/constitution.md)
for the rules every plan is checked against.
