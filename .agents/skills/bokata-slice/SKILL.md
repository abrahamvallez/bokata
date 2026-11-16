---
name: bokata-slice
description: Create and grow a vertical slice of 1-4 Features — slice each Feature into Steps, options and INVEST bites (one feature-slicer subagent per Feature), have the Product Trio review the full trace and the bites, let the user compose the Walking Skeleton as the first increment, and write concrete Acceptance Criteria only for it. Later, add the next increment from the slice's own backlog of bites (--next) or mark the slice done (--done). Use it after bokata-feature-map or a pitch, when the user wants to slice, pick what to build next, or define a walking skeleton.
---

Create and grow a **vertical slice**: a group of 1–4 Features that together give the user a
usable flow. The slice file holds everything about it — how each Feature was sliced, the
increments built so far, and the backlog left — and grows one increment at a time, Walking
Skeleton first. You are the neutral coordinator; the slicing comes from `feature-slicer`
subagents, and the PM, Designer and Engineer review from their lenses.

```
Slice          1–4 Features → a usable flow, end to end; open until the user marks it done
 ├ Slicing        per Feature: User Task → Step → options (F1-2.3), pruned, with a target per Step
 ├ Increment      the Walking Skeleton (Inc 1) or one or more bites the user can see or use
 │  └ Plan steps     in the initiative's plan.md: written by bokata-plan, checked off by the executor
 └ Backlog        bites (F1-a …): INVEST groups of options, per User Task, each titled for the user
```

- **Option ≠ bite ≠ increment.** An option is one way to do one Step. A bite groups the
  options of one or several Steps that make sense together (small, INVEST). An increment is the
  Walking Skeleton or one or more bites — whatever lets the user see or do something new.
- **The backlog is a plan, not an index.** Options are explored widely, then the slicer prunes
  what is obsolete, dominated or filler (each with a reason) and groups the rest into bites.
  Nobody reads loose option IDs.
- **A Feature belongs to exactly one slice.** If another slice needs it, that slice lists it as
  a dependency.
- **Concrete ACs are written just in time**, only for the increment entering the slice.
  Functional ACs stay in `features.md`.
- **No time estimates.** Never write a duration.

All outputs live under `<docs>/<initiative-slug>/`.

---

## Configuration

Read `.bokata.json` at the project root if it exists. Defaults:

```json
{ "docs": "docs/initiatives",
  "memory": { "constitution": "CONSTITUTION.md", "glossary": "GLOSSARY.md", "adrs": "docs/adrs" },
  "methods": { "domain": "domain-modeling" },
  "templates": { "slice": null },
  "story_map": true }
```

`<docs>` below is the `docs` value. `templates.slice: null` means
[resources/slice-template.md](resources/slice-template.md). The story map is rendered by the
`story-map-renderer` subagent (skill `bokata-render`); this skill only dispatches it.

## Operations

| Call | Does |
|------|------|
| `bokata-slice [<features…>]` | **New slice**: Steps 1–6 below |
| `bokata-slice <nn> --next` | **Next increment** of an open slice — see [Next increment](#next-increment---next) |
| `bokata-slice <nn> --done` | Mark the slice **done** — see [Done](#done---done) |

## Mode

- **Trio mode (large initiative)** — `features.md` exists and was written by `bokata-feature-map`
  (no `<!-- Mode: single -->` marker). Reviews and Rules come from the three trio subagents.
- **Single mode (one feature)** — there is only a pitch (or a plain description), or a
  `features.md` carrying `<!-- Mode: single -->`. The pitch is the one Feature. Still dispatch
  one `feature-slicer` subagent; run every trio step yourself, one lens at a time. The first
  time, create `features.md` from the features template with **only** that Feature (name and
  `Purpose` from the pitch, its User Task names from the slicer) and its `**Slice:**` line, and
  put `<!-- Mode: single -->` under its header comment.

The user can force either mode.

**Feature codes.** `F1`, `F2`, … follow the order of the Features in `features.md` (the journey
order) and never change. Option IDs build on them: `F2-3.1` = Feature 2, Step 3, option 1.

---

## Step 1: Resolve Features & Folders

1. Read `features.md` and the pitch, the constitution, the glossary, and the existing slices in
   `<docs>/<initiative-slug>/slices/` (their header and `Status` are enough).
2. Show the Features: which already belong to a slice (from each Feature's `**Slice:**` line) and
   which are free. Ask the user to pick **1–4 free Features that make sense together** if not
   given. For the first slice, recommend the group that makes the journey usable end to end. A
   Feature that already has a slice cannot be picked again — offer `bokata-slice <nn> --next` on
   that slice instead.
3. `mkdir -p <docs>/<initiative-slug>/slices/`.

---

## Step 2: Consolidated Discovery (Interactive)

Ask clarifying questions in **rounds** (every question you can ask now, numbered, each with your
recommended answer and worded so "yes" accepts it; wait for the answers before the next round)
about the picked Features, only where the answer changes a Step or an option:
- **Technical Clarity** — User Tasks too vague to decompose into Steps?
- **Layer Ambiguity** — Steps unclear between UI, Logic and Data?
- **Increment Scope** — User Tasks too large to slice without clarification?
- **Dependencies** — between User Tasks, or between the picked Features?
- **Constraints** — architecture or performance limits on which options are viable?

**Scope decisions defer, they do not delete.** When the user cuts something ("preview only", "no
horn for now"), record it as a deferral: the slicers still list those options, marked `deferred`,
and they stay in the backlog.

If the input is already rich, say so and ask only about what is missing:
> "You provided the features + functional ACs for [initiative], which resolves scope and rules. Asking only about [missing categories]."

Produce one `## Discovery Context — Slicer: [Feature Names]` block: Technical Clarifications /
Layer Decisions / Increment Boundaries / Deferred (scope cuts) / Dependencies Confirmed /
Constraints Noted / Assumptions. Every subagent below receives it.

---

## Step 3: Slicing — Two Waves of Subagents

Subagents cannot launch subagents in every harness, so **you** launch both waves from the main
thread. Use your harness's subagent tool (Task/Agent in Claude Code, `task` in OpenCode,
`spawn_agents` in Codex, subagents in Cursor). In each wave, issue every call **in a single
assistant message**, all **foreground/blocking**, and do not continue until every result is in.

### 3a. Wave 1 — one `feature-slicer` per Feature (parallel)

**Never slice a Feature yourself**, even when it looks small: dispatch the `feature-slicer`
agent, which runs the `bokata-feature-slicer` skill with its resources.

```
subagent_type: feature-slicer
prompt: "Slice this Feature. Feature code: F<n>.
- Feature: [name, ID, Purpose, every User Task and System Task with its description — from features.md]
- Discovery Context: [from Step 2]
- Constitution / glossary paths: [from .bokata.json]
- Functional ACs — open ONLY for the Phase 3 coverage check: [this Feature's Requirements + Scenarios]
Read the skill and all its resources first. Run all four phases, including Phase 4 (prune with a
reason, a target per Step, INVEST bites). Return the full output (Slicing trace, Coverage,
Walking Skeleton proposal, Pruned, Bites, Self-check, Assumptions)."
```

### 3b. Gate — check each trace before anyone reviews it

For every returned trace, check mechanically (count, do not judge):
- [ ] Every User Task of the Feature has Steps, each with a layer
- [ ] Every Step has ≥3 options and a `strategies:` line with ≥2 strategies
- [ ] Every Step has a cheap-family option (crutch, fake/hardcoded data, zero/one/many, simplified
      workflow, basic utility) or a one-line reason why not
- [ ] Every Requirement of the Feature appears in `### Coverage`
- [ ] Every `Deferred` item from the Discovery Context appears as a `deferred` option
- [ ] The Walking Skeleton proposal uses option IDs and covers every User Task
- [ ] Every pruned option appears in `### Pruned` with one of the four reasons, is gone from the
      trace, and was not a skeleton or `deferred` option
- [ ] Every Step has one `→ target`
- [ ] Every live option (not skeleton, not pruned) is in **exactly one** bite; none is in two
- [ ] Every bite has an ID, a title with a subject, `must-have` or `~nice-to-have`, its options
      with Steps, `depends on`, a value line and a check; none has more than ~5 options
- [ ] `deferred` options sit in their own bites; no dependency cycle between bites
- [ ] The Self-check counts match the trace

If a trace fails, re-dispatch **that** slicer with the failed items listed ("S4 has 2 options;
S7 has no cheap option; R3 missing from Coverage; F5-6.4 is in no bite; Step S9 has no target"). Do not patch the trace yourself. At most two
retries; then show the user what is still missing.

### 3c. Wave 2 — Trio review of the full traces (parallel)

The trio reviews **the complete traces and the bites**, not a summary: they can only miss
options they can see, and only object to a pruning they can read.

**Task 1: bokata-product-manager**
```
subagent_type: bokata-product-manager
prompt: "Review the slicing of [Features] from the value/viability lens. You have:
- Full slicing traces (Steps, options, coverage, Walking Skeleton proposal, Pruned, Bites): [paste every trace as returned]
- Backbone + functional ACs: [paste]
- Discovery Context: [paste]
Do NOT ask the user questions. Focus on: Is the skeleton the minimum that still gives observable
value end to end? Is a cheaper option (fake data, manual crutch, one case only) missing for any
Step — propose it with its Step ID. Which options unlock the most value next? Also review the
Pruned list and the Bites. Is the must-have / nice-to-have split in value order, does any
pruning throw away value (name the option ID), is any bite too big or two bites really one?
Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off). Return
your review in the format specified in your agent file (Bites section included)."
```

**Task 2: bokata-product-designer**
```
subagent_type: bokata-product-designer
prompt: "Review the slicing of [Features] from the UX/UI lens. You have:
- Full slicing traces: [paste]
- Backbone + functional ACs: [paste]
- Discovery Context: [paste]
Do NOT ask the user questions. Focus on: Does the skeleton combine into a coherent minimal
experience across the Features? Which UI states are essential to the skeleton and which can wait?
Is a cheaper UI option (static screen, one state only, existing component) missing for any Step —
propose it with its Step ID. Also review the Bites. Do the titles read on their own, with no
Step context? Is each bite one coherent thing in the interface, or does it mix two screens or
two interactions? Does any pruning drop a UI state the skeleton needs? Tag every finding with
Severity (Critical|Suggested) and Type (factual/scope|trade-off). Return your review in the format
specified in your agent file (Bites section included)."
```

**Task 3: bokata-product-engineer**
```
subagent_type: bokata-product-engineer
prompt: "Review the slicing of [Features] from the feasibility/technical-sustainability lens. You have:
- Full slicing traces: [paste]
- Backbone + functional ACs: [paste]
- Discovery Context: [paste]
Do NOT ask the user questions. Focus on: Are Steps and layers sound? Is each skeleton option
reversible, and which shortcuts are safe to revisit vs dangerous? Is a cheaper technical option
(in-memory, hardcoded, existing service, manual step) missing for any Step — propose it with its
Step ID. Also review the Bites. Are the dependencies right and acyclic, is any bite too big
to size, and does any pruned option break a contract a later bite or Feature relies on (name
the option ID)? Tag every finding with Severity (Critical|Suggested) and Type
(factual/scope|trade-off). Return your review in the format specified in your agent file (Bites
section included)."
```

### 3d. Reconcile (You Are the Neutral Coordinator)

You add no fourth opinion and arbitrate no product trade-off. Classify each finding (use the
reviewer's `Type` tag, but verify it):

- **(a) Non-conflicting improvement** — apply it. A proposed missing option is added to its Step
  with the next free ID **and to exactly one bite** (an existing one, or a new one). Never
  remove an option because a reviewer prefers another — options are alternatives. What **is**
  pruned is the obsolete, the dominated and the filler, each with its reason. A reviewer finding
  can move options between bites, split a bite, or restore a pruned option (back into a
  bite, still with one bite only); the neutral coordinator makes the move.
- **(b) Factual / scope conflict** — decidable against an artifact (`features.md`, the pitch, the
  Discovery Context, the constitution). Resolve it against that artifact, apply the fix, and add a
  one-line `## Trio notes` entry citing it. Do not ask the user.
- **(c) Genuine product trade-off** — a value↔UX / value↔sustainability judgment with no ground
  truth in any artifact (e.g. PM: "F1-3.1 is enough for the skeleton"; Designer: "the skeleton
  needs F1-3.2 to be coherent"; PM: "F5-b is must-have"; Engineer: "it can wait"). This is the
  human's decision.

**Bucket (c):** collect them all first (never one at a time). For each: the two positions with
their lens, the one-sentence crux, and a **recommended default** grounded in the constitution /
Fast Feedback Principle.
- **Interactive (default):** present them as one numbered decision point and wait. Use your
  harness's question tool if it has one (`AskUserQuestion` in Claude Code, `question` in OpenCode;
  one question per conflict; options = each lens position plus your recommended default, marked
  recommended). Otherwise a numbered plain-text prompt. Apply the choices.
- **Non-interactive** (`--no-interactive`, or a headless run): apply the defaults and record each
  in `## Trio notes` with both positions, the applied default, and `⚠ flagged for human review`.

### 3e. Compose Inc 1 — the Walking Skeleton (Interactive)

Propose **Inc 1** as the union of the reconciled skeleton proposals: the option IDs per User Task
across the picked Features, so the flow works end to end. Then:
- Show it as one line of what the user can do, its option IDs, and its `**[User Task]**` tags.
- Every part must be functional on its own; if an option has no visible effect alone, it travels
  with the option that makes it visible.
- The user can swap options, add or drop them, and name the slice. **The user decides.**
- Options the user moves into Inc 1 leave their bite; if that empties a bite, remove it; if
  it breaks another bite's `depends on`, repoint it to `Inc 1`. The bites left stay the
  backlog.

### Proposed increments

After Inc 1 is fixed (3e) — and again after every `--next` — write the roadmap of the bites that are
left as a table in `## Backlog`, above the bites. It is a **proposal**, labelled as such; the owner
edits it. You compose it from what the trio already said (the PM's value order and "bites to build
next", the Engineer's dependencies); you add no new opinion on value.

- One row per Inc: `Inc <n> — <name>`, its bites (1–3, across User Tasks if they belong together),
  what the user gains (user language, one line), and **why this order** (the value it unlocks or the
  dependency it satisfies).
- Order: `depends on` first, then value, must-have before `~nice-to-have`. A row never takes a bite
  before the bite it depends on.
- Every must-have bite appears in exactly one row. The `~nice-to-have` and `deferred` bites go in a
  final `Later` row, with no order promised.
- Each Inc is a candidate for **INVEST**: small, independent of the rows after it, valuable, testable.
- If the owner states an order, use it and keep the reason.

---

## Step 4: Concrete Acceptance Criteria — chosen increment only

Used by a new slice (for Inc 1) and by `--next` (for the new increment). Never write concrete ACs
for options still in the backlog.

### 4a. Trio contributes Rules (Subagents, Parallel)

One message, three foreground calls, wait for all three:

**Task 1: PM Contribution**
```
subagent_type: bokata-product-manager
prompt: "Contribute business-rule Rules for increment [Inc n] of slice [nn], from the viability/value lens. You have:
- The increment: [name, option IDs with their one-line descriptions, User Task tags]
- Increments already in the slice (for context): [one line each]
- Backbone + functional ACs of the touched User Tasks: [paste]
- Discovery Context: [paste]
Do NOT ask the user questions. Give launch-blocking rules for this increment and the value it
unlocks. Respect its shortcuts: an option marked fake/hardcoded/manual gets rules for what the user
sees, not for the real thing. Format per your agent file (Contributed Rules — PM Lens)."
```

**Task 2: Designer Contribution**
```
subagent_type: bokata-product-designer
prompt: "Contribute UX/UI Rules for increment [Inc n] of slice [nn], from the usability/craft lens. You have:
- The increment: [name, option IDs with descriptions, User Task tags]
- Increments already in the slice: [one line each]
- Backbone + functional ACs of the touched User Tasks: [paste]
- Discovery Context: [paste]
Do NOT ask the user questions. Give the UI states, component reuse and interaction patterns this
increment needs — no more than its options promise. Format per your agent file (Contributed Rules — Designer Lens)."
```

**Task 3: Engineer Contribution**
```
subagent_type: bokata-product-engineer
prompt: "Contribute technical Rules for increment [Inc n] of slice [nn], from the feasibility/sustainability lens. You have:
- The increment: [name, option IDs with descriptions, User Task tags]
- Increments already in the slice: [one line each]
- Backbone + functional ACs of the touched User Tasks: [paste]
- Discovery Context: [paste]
Do NOT ask the user questions. Give data shape, contracts, guards and boundary rules for this
increment, and whether it builds on earlier increments or reshapes them. Format per your agent
file (Contributed Rules — Engineer Lens)."
```

### 4b. Consolidate & Invoke the AC Skill

Merge the three contributions into one enrichment block (de-duplicated). Then:
```
bokata-acceptance-criteria --concrete
Input: [the increment: name, option IDs and descriptions, User Task tags]
Enrichment: [consolidated Rules]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — it has been resolved upstream. Proceed directly to
Phase 1 (Input Analysis) through Phase 3 (Generate Output), using --concrete depth. Write
scenarios only for this increment, with concrete example data. Return the ## Acceptance Criteria
(Concrete) section."
```

### 4c. Domain Pass (Interactive)

Load the skill named in `methods.domain` (default `domain-modeling`; skip if `null` or not
installed) and run it over the concrete ACs against the glossary at `memory.glossary`:
- A term the glossary lists under _Avoid_ → replace it with the canonical term.
- Two words for one concept, or one word for two → ask the user, then use the answer everywhere.
- A new concept → settle its name with the user and add it to the glossary (terms only).
- An ADR only at `memory.adrs`, and only when hard to reverse, surprising without context, and the
  result of a real trade-off.

Ask every naming question in one round, numbered, each with your recommended answer. The paths
and formats in `.bokata.json` win over the domain skill's own.

---

## Step 5: Write the Slice & the Summary

1. Number the slice (`01`, `02`, … after the existing ones) and **write**
   `<docs>/<initiative-slug>/slices/<nn>-<name>.md` from the slice template:
   - header with `Status: open` and `Current increment: Inc 1 — sliced`;
   - `## Slicing`: one `<details>` block per Feature with its reconciled trace (Steps, options,
     strategies, targets, bite of each live option, Coverage) exactly as the slicer wrote it
     plus the trio's added options; append `→ Inc 1` to every option Inc 1 took (replacing the slicer's `skeleton` marker). The block is
     folded: the owner reads the Backlog, not the trace;
   - `## Increments`: `### Inc 1 — Walking skeleton: <…>  **[UT]** …` with `Options:`, `Bites:`,
     `Unknowns:`, an empty `Parallel-safe:`, the concrete Gherkin and the pointer line
     `Plan: → ../plan.md (Slice <nn> · Inc 1)` (the plan and the test mapping live in `plan.md`,
     written by `bokata-plan`; never put steps or `Tests:` in the slice);
   - `## Backlog`: **the bites**, grouped by User Task and ordered by value (must-have first,
     `~nice-to-have` after), each on one line in the template's shape (title, options, `depends on`, value,
     check) and — once an Inc takes it — `→ Inc n` after its priority tag; `deferred` bites in
     their own group. The story map draws every bite without `→ Inc n`. Never a flat list of
     option IDs. Put **`### Proposed increments`** above the bites: see
     [Proposed increments](#proposed-increments);
   - `## Notes`: include a `Pruned` line (count by reason) and keep the full `### Pruned` list
     there; `## Trio notes`.
2. In `features.md`, set each picked Feature's `**Slice:**` line:
   `**Slice:** → <nn>-<name> · <taken>/<total> options · next: <bite ID> <bite title>`.
   Nothing else about the slicing goes into `features.md`.
3. **Dispatch the story-map update** (if `story_map`): the `story-map-renderer` subagent, in
   background, without waiting — operation `slice-added` when `story-map.html` exists, otherwise
   `rebuild`:
   ```
   subagent → story-map-renderer (bokata-render)
   input: <docs>/<initiative-slug>/ — operation: slice-added — slice: slices/<nn>-<name>.md — increment: Inc 1
   ```

---

## Step 6: Verify & Summarize

- [ ] Every picked Feature was sliced by a `feature-slicer` subagent and passed the gate
- [ ] The trio reviewed the full traces and the bites; their added options are in the Slicing
      and each in exactly one bite
- [ ] The slice file has Slicing, Inc 1 with concrete Gherkin, Backlog of bites, Notes (with
      Pruned), Trio notes
- [ ] `features.md` gained only a `**Slice:**` line per picked Feature
- [ ] The renderer was dispatched (if `story_map`)

Print:
```
## ✓ Slice Ready

**Slice:** <nn>-<name> — Features: {{FEATURES}} · open
**Location:** <docs>/{{INITIATIVE_SLUG}}/slices/<nn>-<name>.md

**Inc 1 (Walking Skeleton):** {{ONE_LINE}} · {{NUM_OPTIONS}} options · {{NUM_GHERKIN_BLOCKS}} scenarios
**Slicing:** {{NUM_STEPS}} Steps · {{NUM_OPTIONS_TOTAL}} options ({{NUM_PRUNED}} pruned) · {{NUM_BITES}} bites in the backlog ({{NUM_MUST}} must-have · {{NUM_NICE}} nice-to-have · {{NUM_DEFERRED}} deferred)
**Trio notes:** {{N}} (see the slice)

**Proposed next increments:** {{INC_2_ONE_LINE}} · {{INC_3_ONE_LINE}} … (a proposal — edit it in the slice)

**Next step:** `bokata-plan <docs>/{{INITIATIVE_SLUG}}/slices/<nn>-<name>.md` — inside your harness's plan mode.
After Inc 1 is built: `bokata-slice <nn> --next`.
```

---

## Next increment (`--next`)

For an **open** slice whose current increment is built (or when the user wants to queue the next
one):

1. Read the slice file: Slicing, Increments, Backlog (the bites), Notes (built increments may
   have discovered work), and the functional ACs of its Features from `features.md`.
2. Propose the next increment as **one or several bites** (of one or several User Tasks) that
   unlock the most value on top of what is built; start from the first row of
   `### Proposed increments` and adjust it to what is built and pruned: respect `depends on`, take must-have before
   nice-to-have, keep it small. Show 2–3 candidates, each as one line of what the user can do +
   bite IDs and titles + `**[UT]**` tags, with your recommendation first. The user picks, edits
   or writes their own. One increment per call. Bites are already reviewed by the trio; you
   compose between them, you do not untie 180 loose options again.
3. If the user asks for something no bite has, add it as a new option to its Step (next free
   ID, with its strategy) **and to a bite** (new or existing) before using it — the Slicing
   stays the source of truth.
4. **Re-prune.** The increment just chosen raises the floor for its Steps: any live option, in any
   bite, that now sits below what the increment builds is `obsolete`. **Never prune an option an Inc
   has taken** (`→ Inc n`): the story map resolves each Inc's `Options:` through the Slicing; remove it, list it under
   `### Pruned` in `## Notes` with its reason. Bites left with no options go away; a bite
   whose value shrank is reworded or merged. A removal that would take value away from a bite
   goes to the user as one decision point, with your recommended default.
5. Run **Step 4** (trio Rules → concrete ACs → domain pass) for this increment only.
6. **Redo `### Proposed increments`** for the bites that are left (drop the row of the Inc just
   added, reorder the rest if the pruning or what was built changed it).
   Append `### Inc <n> — <…>` to `## Increments` (same shape as Inc 1: `Options:` lists the option IDs
   of the bites it takes — plan and executor read those — and a `Bites:` line names the bite IDs),
   append `→ Inc <n>` to the options and to the bites it took (in `## Backlog`, after the priority
   tag), and set `Current increment: Inc <n> — sliced`.
7. Update each touched Feature's `**Slice:**` line in `features.md` (`next: <bite ID> <title>`).
8. Dispatch the renderer with operation `slice-added` and `increment: Inc <n>`.
9. Print the Inc line, scenarios count, bites left in the backlog, what was pruned, and the next
   step (`bokata-plan`).

## Done (`--done`)

Only when the user asks — nothing marks a slice done by itself. Set `Status: done` in the slice
header, add a closing line to `## Notes` (what is built, which bites stay in the backlog), update
the `**Slice:**` lines in `features.md` with `· done`, and dispatch the renderer with
`state-sync`. The backlog stays in the slice file; to build more of these Features later, the user
reopens this slice (`Status: open`) — never a new slice for the same Feature. A done *slice* is not
a done *increment*: the header's `Current increment: Inc <n> — done` is set by the executor.

---

## Quality Checks (Before Writing)

- [ ] Discovery Context present; scope cuts recorded as Deferred, not removed
- [ ] Wave 1 issued in one message, one `feature-slicer` per Feature; no Feature sliced inline
- [ ] Every trace passed the gate (≥3 options and ≥2 strategies per Step, cheap option, full Coverage,
      pruned with a reason, a target per Step, every live option in exactly one bite)
- [ ] Wave 2 (trio) saw the full traces and the bites and completed before reconciliation
- [ ] The Backlog lists bites with user-language titles, never loose option IDs
- [ ] `### Proposed increments` exists: every must-have bite in exactly one row, dependencies respected, a reason per row
- [ ] Inc 1 covers every User Task of the picked Features, as option IDs
- [ ] Concrete ACs exist only for the increment being added, in full Gherkin with concrete data
- [ ] No duration written anywhere
- [ ] `features.md` holds only the summary `**Slice:**` line per Feature
- [ ] The renderer was dispatched right after the slice file was final
