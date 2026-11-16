# Slice <nn> — <name>

- Initiative: [<initiative>](../pitch.md) · Features: F1 <name>, F2 <name>
- When it is done, the user can: <one or two sentences — the end-to-end flow>
- Rabbit holes that touch it: <from the pitch, or "none">
- Status: open | done                 <!-- set to done by the user: `bokata-slice <nn> --done` -->
- Current increment: Inc <n> — sliced | planned | building | done

<!-- How to read this file
  Slicing     = each Feature's User Tasks → Steps → options (written once, by the feature-slicer
                agents, reviewed by the Product Trio, then pruned). Each live option ends in its
                bite ("· F1-a"); options taken by an increment end in "→ Inc n"; each Step has one
                "→ target" = how far the slice should go in that Step. "deferred" options were cut by
                a discovery decision and can still be picked. Pruned options are not in the trace:
                they are listed, with their reason, in Notes.
  Increments  = added one at a time, in order. Inc 1 is the Walking Skeleton; every other Inc is one
                or several bites. Each one is functional on its own and gets concrete ACs only
                when it enters. "~" = nice-to-have inside that increment's scenarios.
                Unknowns not empty → still uphill (needs the owner); empty → only execution left.
  Plan, Tests = not in this file: they live in the initiative's `plan.md`, under "Slice <nn> · Inc <n>"
                (steps written by bokata-plan and checked off by the executor commit by commit;
                scenario → test mapping filled by the executor).
  Backlog     = the bites no Inc has taken: small INVEST groups of options, per User Task, titled
                in user language. `bokata-slice <nn> --next` picks from them and prunes what the new
                Inc makes obsolete. "~" = nice-to-have: the slice can be marked done without it.
  The slice stays open until the user marks it done (`bokata-slice <nn> --done`). A done slice is not a
  done increment: `Current increment: … — done` is about the Inc the executor just finished.
-->

## Slicing

<details>
<summary>F1 — <Feature name> · <n> User Tasks · <n> Steps · <n> options</summary>

### User Task: <name>
- **S1 <Action Object>** · UI — <what happens>
  - F1-1.1 <Action Object> — <what changes for the user; shortcut stated> · <strategy> · covers R1 fake → Inc 1
  - F1-1.2 <Action Object> — <…> · <strategy> · covers R1 total · F1-a → target
  - F1-1.3 <Action Object> — <…> · <strategy> · F1-b
  - strategies: <A>, <B>
- **S2 <Action Object>** · Data — <…>
  - …

#### Coverage
- R1 <requirement> — F1-1.1 fake, F1-1.2 total

</details>

<details>
<summary>F2 — <Feature name> · …</summary>

…

</details>

## Increments

### Inc 1 — Walking skeleton: <what the user can do or see>  **[<User Task>]** **[<User Task>]**

- Options: F1-1.1, F1-2.1, F2-1.1            <!-- always the option IDs; plan and executor read them -->
- Bites: —                                  <!-- Inc 1 = skeleton; from Inc 2 on: F1-a, F2-c (the bites it takes) -->
- Unknowns: <open questions, or "none">
- Parallel-safe: <yes | no — set by bokata-plan>

```gherkin
Scenario: <concrete name>
  Given <concrete data>
  When <action>
  Then <observable result>
```

Plan: → ../plan.md (Slice <nn> · Inc 1)     <!-- steps and Tests live there -->

### Inc 2 — <what the user can do or see>  **[<User Task>]**

<!-- Added by `bokata-slice <nn> --next`. -->

…

## Backlog

<!-- Bites (INVEST), per Feature and User Task, ordered by value. A bite = options of one or
     several Steps that make sense together; every live option is in exactly one. Titles say who
     does what, so they read without the Step. An Inc takes one or several bites. Kept in sync by
     bokata-slice; the Slicing section holds the options, this section is what you prioritize.
     The story map (bokata-render) draws every untaken bite: keep one bite per line, in this shape. -->

### Proposed increments

<!-- A PROPOSAL, not a decision: the order the coordinator suggests for the bites left, written after
     Inc 1 is fixed and redone by every `--next`. The owner edits it freely. Each row = one Inc
     (1–3 bites; must-have first, ~nice-to-have last, dependencies respected). The next row is what
     `--next` recommends first. Rows of built Incs are dropped; they live in ## Increments. -->

| Inc | Bites | What the user gains | Why this order |
|---|---|---|---|
| Inc 2 — <name> | F1-a · F2-b | <one line, in user language> | <value or dependency: "unlocks F1-c", "needs Inc 1 only"> |
| Inc 3 — <name> | F1-c | <…> | <…> |
| Later | ~F1-d · ~F1-e · deferred F1-x | <nice-to-have and deferred, no order promised> | — |

### F1 — <Feature name>

- **[<User Task>]**
  - **F1-a · <Who does or sees what>** (must-have) — F1-1.2, F1-3.3 · depends on: Inc 1 · value: <one line> · check: <one sentence a test can answer>
  - ~**F1-b · <Who does or sees what>** (nice-to-have) → Inc 2 — F1-2.3 · depends on: F1-a · value: <…> · check: <…>   <!-- "→ Inc n" = taken by that Inc; the story map draws only the untaken ones -->
- **[Deferred]**
  - F1-x · <title> (deferred: <reason, e.g. needs F9>) — F1-1.4, F1-5.2 · prune and split when recovered

## Notes

- <deviations, discovered work, decisions taken while building>
- **Pruned** (<n> · obsolete <n> · dominated <n> · filler <n> · contradicts <n>) — one line each, with its reason; added to after every `--next`:
  - F1-1.1 <name> — `obsolete`: <why>

## Trio notes

- <one line per reconciled conflict or trade-off>
