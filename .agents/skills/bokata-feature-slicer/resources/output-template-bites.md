<!-- Phase 4 output — pruned list and bites per User Task. Each live option in the trace also
     carries its bite (· F1-a) and each Step has one "→ target". Bite IDs are letters per
     Feature and never change; option IDs are never renumbered after pruning. -->

### Pruned
- F1-2.1 [Action] [Object] — `obsolete` | `dominated` | `filler` | `contradicts`: [one line why]

### Bites
- **[User Task name]**
  - F1-a · [title in user language, with a subject] (must-have) — F1-2.2, F1-4.3 · depends on: Inc 1 · value: [one line] · check: [one sentence a test can answer]
  - ~F1-b · [title] (nice-to-have) — F1-3.4 · depends on: F1-a · value: [one line] · check: [one sentence]
- **Deferred**
  - F1-x · [title] (deferred: [reason]) — F1-5.3, F1-6.1 · prune and split when recovered
