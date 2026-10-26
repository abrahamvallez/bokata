---
name: bokata-plan
description: Write the technical plan for a bokata slice as checklists under each increment of slices/<slice>.md, so an executor in another process can follow it and check it off. It is a contract to use inside your harness's own plan mode — it does not replace it. Use it when the user wants to plan a slice, or says "plan <slice>" after bokata-slice.
---

# bokata-plan

Your harness's plan mode does the planning. This skill only fixes **where the plan lands and
in what shape**, so that the executor (often another tool and another model) and
`bokata-status` can read it. Plan the whole slice at once.

## Configuration

Read `.bokata.json` at the project root if it exists (`docs` defaults to `docs/initiatives`).

## 1. Read

- The slice file `<docs>/<slug>/slices/<nn>-<name>.md` — its scopes, increments and scenarios.
- The pitch's rabbit holes and no-gos, the constitution, `AGENTS.md`, and the ADRs that touch
  the area.
- The code the slice touches. Use read-only explore subagents in parallel if your harness has
  them. Never assume an API exists: find it.

## 2. Plan

For every increment, write the steps that build it:

- **One step = one small, tested change** that ends in a commit: roughly one test file and
  one or two production files. Each step names the scenario (or part of it) it proves.
- Order the steps the way the project builds (see `AGENTS.md`; for example domain → use case
  → view model → component → copy).
- Order the increments: must-haves first, `~` last, dependencies before dependants.
- Mark each scope **`Parallel-safe: yes`** only if its steps touch no file that another
  scope's steps touch; otherwise `no`.
- Add to a scope's `Unknowns` anything you could not settle from the code.
- Decisions that only the user can make (two valid readings, a trade-off, a new pattern or
  dependency): **ask them now**, one at a time with your recommendation, and record each
  answer under `Notes` as `Owner decision: …`. A new pattern that needs an ADR is an owner
  decision too.

Do not write code. Do not change the acceptance criteria: if one is wrong or missing, stop and
tell the user — it goes back to `bokata-slice`.

## 3. Write it into the slice

Replace each increment's `Plan:` placeholder with checkboxes:

```markdown
Plan:
- [ ] Domain: `hasDrawings(clip)` pure rule — proves "legacy clip with draws counts"
- [ ] View model: filter flag in `useLibraryViewModel` — proves "chip filters the list"
- [ ] Chip in `LibraryToolbar` + copy in every locale — proves "chip shows its state"
```

Set the slice `Status: planned`.

If your plan mode does not let you edit files, present the plan for approval first and write
it into the slice right after the user approves.

## 4. Hand-off

End with the exact line the user can hand to an executor (by hand, or through an
orchestrator such as Orca):

```
Next: code-executor — build slice <docs>/<slug>/slices/<nn>-<name>.md
      (scopes marked Parallel-safe: yes may run in separate worktrees)
```
