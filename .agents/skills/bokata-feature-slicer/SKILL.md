---
name: bokata-feature-slicer
description: Slices one Feature into Steps per User Task and 3+ Incremental Options per Step (named breakdown strategies, cheapest options included), checks them against the functional ACs, proposes a Walking Skeleton as a combination of option IDs, then prunes the options (with a reason), sets a target per Step and groups what is left into small INVEST bites per User Task. The full trace is always the output, so the work can be audited. Use it to break down a Feature into implementable work — from bokata-slice (through the feature-slicer agent), when planning a sprint, or when a user asks to slice or decompose a feature.
---

# Bokata Feature Slicer

Takes **one Feature** and produces its **Slicing**: every User Task → its Steps → 3+ Incremental
Options per Step, each with the breakdown strategy that produced it and the functional
requirement it covers, plus a **Walking Skeleton proposal** built from those options, and a
**bite-sized backlog**: the options pruned (with a reason), a target per Step, and the rest grouped
into small bites a person can read and prioritize at a glance.

**The trace is the output.** Phases 1 and 2 are not internal reasoning: they are written out,
because whoever reviews the slicing (the Product Trio, the user) can only miss options they can
see, and a skipped phase has to show.

```
Feature
 └ User Task                      (from the backbone)
    └ Step     F1-S2 · Data       (Phase 1 — one functional responsibility, one layer)
       └ Option   F1-2.1 … F1-2.n (Phase 2 — alternative ways to do that Step, cheapest first)

Bite   F1-a … (Phase 4 — options of one or several Steps that make sense together; INVEST)

Increment = one or several bites (or the Walking Skeleton) that the user can see or use.
Increments are composed later (bokata-slice); this skill proposes the first one, the Walking
Skeleton, and the bites the later ones are picked from.
```

**Exploring is wide, the backlog is narrow.** Phase 2 produces many options on purpose (quotas,
several strategies) so nothing cheap is missed. Phase 4 then prunes and groups them, so the
owner reads a handful of bites instead of a hundred loose options.

**No durations.** Never write time-based sizing ("1-3 days"). "Simplest" means fewest
dependencies, least infrastructure, most reversible.

---

## Read first

Before slicing, read **all** of these. They hold the worked examples and the failure modes the
summary below only names:

| Resource | Use it for |
|----------|-----------|
| [phase-1-steps.md](resources/phase-1-steps.md) | Step analysis, layers, good/bad Steps |
| [phase-2-increments.md](resources/phase-2-increments.md) | Option generation, examples, common issues |
| [breakdown-strategies.md](resources/breakdown-strategies.md) | The strategy toolkit and linguistic patterns |
| [phase-3-baby-steps.md](resources/phase-3-baby-steps.md) | Walking Skeleton selection and validation |
| [phase-4-bites.md](resources/phase-4-bites.md) | Pruning reasons, Step targets, INVEST bites, bite titles |
| [output-template-steps.md](resources/output-template-steps.md), [output-template-increments.md](resources/output-template-increments.md), [output-template-bites.md](resources/output-template-bites.md) | The output format |

---

## Input

- The Feature: name, Purpose, User Tasks (and System Tasks), from the backbone in any form.
- A **Feature code** for the IDs (`F1`, `F2`, …). If none is given, use `F1`.
- Optional: Discovery Context, constitution, glossary, codebase notes.
- Optional: functional ACs (Requirements + Scenarios). **Kept aside until the coverage check.**

## Phase 0 — Discovery (standalone use only)

**Skip it** if a `## Discovery Context — Slicer` (or an orchestrator's equivalent) is in the
input. Otherwise, scan the User Tasks for gaps whose answer would change a Step or an option
(technical clarity, layer ambiguity, increment scope, dependencies, constraints). Ask them in one
round, numbered, each with your recommended answer, and **wait for the answers**. State the
assumptions you make for everything you do not ask.

A scope decision ("only preview, no horn") **defers** options; it never deletes them. Deferred
options are still listed, marked `deferred`, so a later increment can pick them up.

## Phase 1 — Steps

For each User Task, decompose the flow into **Steps**: one functional responsibility each
(WHAT, never HOW), named `[Action] [Object]`, with one layer:

- **UI** — what the user sees or does · **Logic** — decisions, calculations, validation ·
  **Data** — storage and retrieval · **Integration** — external systems, sync.

Aim for 4+ Steps per User Task; 3 is fine when the task is genuinely narrow — say why. Number
Steps across the whole Feature (`S1`, `S2`, … — not restarting per User Task). Add a short
technical note when the code or the constraints settle something (an existing service, a
pattern to follow).

## Phase 2 — Incremental Options

For **every** Step, produce **3+ options** (aim for 4), ordered simplest → most complete:

1. Pick **at least 2 strategies** from [breakdown-strategies.md](resources/breakdown-strategies.md)
   (start from the linguistic patterns; fall back to the Automation Gradient).
2. **At least one option per Step comes from the cheap family**: Walking Skeleton on Crutches
   (manual step behind the scenes), Dummy to Dynamic (hardcoded or fake data first), Zero/One/Many,
   Workflow Simplification, Extract Basic Utility. If none applies, write one line saying why.
3. Each option is specific and deployable on its own; its description says what changes for the
   user **and states the shortcut openly** ("list is hardcoded", "the coach approves by hand").
   Technology names are fine; endpoints, fields and function names are not.

The quotas are for exploring. Do not hold back a weak option to keep the trace tidy: Phase 4
prunes what turns out to be filler, with a reason.

## Phase 3 — Coverage check and Walking Skeleton

1. **Coverage check.** Now open the functional ACs. For each Requirement, list which options
   cover it and how: `total`, `partial` or `fake` (works with fake data or a manual crutch). A
   Requirement no option covers is a gap: add the option it needs. **Do not rewrite options to
   mirror the requirements** — an option that covers a requirement partially is the point.
2. **Walking Skeleton proposal.** For each User Task, choose the option per Step that makes the
   whole flow work end to end with the least: "if we had to ship tomorrow, which one?" It should
   feel uncomfortably minimal. Compare every option, not just `.1`; prefer reversible ones,
   especially in the Data layer. Every User Task must be covered; System Tasks that User Tasks
   depend on come first. Write it as option IDs per User Task plus what the user can do.

## Phase 4 — Bite-sizing

Run it on the whole trace, after the Walking Skeleton. Read [phase-4-bites.md](resources/phase-4-bites.md).

1. **Prune, with a reason.** Every option you discard (not the skeleton's, not `deferred`) gets
   one of: `obsolete` (below the option the skeleton took in the same Step), `dominated` (another
   gives more for a similar cost), `filler` (exists only for the quota), `contradicts` (against
   the PRD, an ADR, the constitution or the Discovery Context). **Delete it from the trace**; the
   output keeps only the `### Pruned` list with each reason. Never renumber IDs.
2. **A target per Step**: the option the slice should reach in that Step. Mark it `→ target`.
3. **INVEST bites per User Task.** Every live option that is not in the skeleton goes in
   **exactly one** bite, with: an ID (`F1-a`), a title **in user language with a subject**,
   `must-have` or `~nice-to-have`, its options and Steps, what it depends on, one line of value,
   and a one-sentence check. A bite over ~5 options is split. `deferred` options form their
   own bites.
4. **Self-check** the new counts (pruned by reason, options in bites, none without a bite,
   none in two, Steps with a target, bites by kind).

## Output

Return exactly this (the `bokata-slice` coordinator pastes it into the slice file):

```markdown
## Slicing: <Feature name>
<!-- Feature: <Feature ID> · code F1 -->

### User Task: <name>
- **S1 <Action Object>** · UI — <what happens, one line> · note: <technical note, optional>
  - F1-1.1 <Action Object> — <what changes for the user; shortcut stated> · <strategy> · covers R1 fake · skeleton
  - F1-1.2 <Action Object> — <…> · <strategy> · covers R1 total · F1-a → target
  - F1-1.3 <Action Object> — <…> · <strategy> · F1-b
  - F1-1.4 <Action Object> — <…> · <strategy> · deferred (<discovery decision>) · F1-x
  - strategies: <strategy A>, <strategy B>
- **S2 <Action Object>** · Data — <…>
  - F1-2.1 …

### User Task: <name>
…

### Coverage
- R1 <requirement summary> — F1-1.1 fake, F1-1.2 total
- R2 <requirement summary> — F1-3.1 partial, F1-3.3 total

### Walking Skeleton proposal
- **[<User Task name>]** F1-1.1 + F1-2.1 + F1-3.2 — <what the user can do end to end>
- **[<User Task name>]** F1-4.1 + F1-5.1 — <…>
- Why: <one line per non-obvious pick, e.g. "F1-3.2 over F1-3.1: reversible, no migration">

### Pruned
- F1-1.5 <Action Object> — `obsolete` | `dominated` | `filler` | `contradicts`: <one line why>

### Bites
- **[<User Task name>]**
  - F1-a · <title in user language, with a subject> (must-have) — F1-1.2, F1-3.3 · depends on: Inc 1 · value: <one line> · check: <one sentence>
  - ~F1-b · <title> (nice-to-have) — F1-2.3 · depends on: F1-a · value: <…> · check: <…>
- **Deferred**
  - F1-x · <title> (deferred: <reason>) — F1-1.4 · prune and split when recovered

### Self-check
User Tasks <n> · Steps <n> · Options before pruning <n> (min <n>/Step) · Steps with ≥2 strategies <n>/<n> ·
Steps with a cheap option <n>/<n> (<Step>: <why not>) · Deferred <n> · Requirements uncovered 0 ·
Pruned <n> (obsolete <n> · dominated <n> · filler <n> · contradicts <n>) · Live options <n> =
skeleton <n> + in bites <n> + deferred <n> · Without a bite 0 · In two bites 0 ·
Steps with a target <n>/<n> · Bites <n> (must-have <n> · nice-to-have <n> · deferred <n>), none over ~5 options

### Assumptions
- <assumption — why it is safe>
```

## Before returning — verify

- [ ] Every User Task has Steps; every Step has a layer and 3+ options
- [ ] Every Step lists ≥2 strategies and has a cheap-family option (or a one-line reason)
- [ ] Every option says what changes for the user and names its shortcut; no endpoints/fields/functions
- [ ] Options were generated before reading the functional ACs; every Requirement appears in Coverage
- [ ] Discovery scope cuts appear as `deferred` options, not as missing ones
- [ ] The Walking Skeleton covers every User Task, uses option IDs, and no duration is written anywhere
- [ ] Every pruned option has a reason from the four, is gone from the trace, and none was a skeleton or `deferred` option
- [ ] Every Step has exactly one `→ target`
- [ ] Every live option is in exactly one bite; every bite has all its fields, a title with a subject that reads without its Step, and no more than ~5 options
- [ ] `deferred` options are in their own bites; bite dependencies have no cycle
- [ ] The Self-check counts match the trace
