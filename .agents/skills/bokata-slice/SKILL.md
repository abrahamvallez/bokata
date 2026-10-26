---
name: bokata-slice
description: Cut one vertical slice from 1-3 Features the user picks — decompose those Features into Increment options with the Product Trio (Walking Skeleton first), let the user choose which increments enter the slice, write concrete-depth Acceptance Criteria only for those, and write slices/<nn>-<name>.md (plus .html) with its scopes and checklist. Use it after bokata-feature-map or a pitch, when the user wants to slice, pick what to build next, or define a walking skeleton or release slice.
---

Cut a **vertical slice** from 1–3 Features of an existing Features Backbone: decompose those Features into a **Walking Skeleton + Increment options**, let the user choose which increments form the slice, and write **concrete-depth Acceptance Criteria** for the chosen increments only — using the **Product Trio**, with you as the neutral coordinator and PM, Designer, and Engineer reviewing from their lenses.

```
Slice      the Features the user picked → a usable flow, end to end
 └ Scope       the part of ONE Feature in this slice (new scopes may be discovered while building)
    └ Increment    functional on its own (the user can do or see something), big or small; must-have or ~nice-to-have
       └ Steps         written by bokata-plan, checked off by the executor
```

All outputs are saved under `<docs>/<initiative-slug>/` and include trio reconciliation notes where conflicts arose. **No time estimates**: if the slicer mentions time-based sizing (e.g. "buildable in 1-3 days"), read it as "the smallest functional option" and never write a duration.

---

## Configuration

Read `.bokata.json` at the project root if it exists. Defaults:

```json
{ "docs": "docs/initiatives",
  "memory": { "constitution": "CONSTITUTION.md", "glossary": "CONTEXT.md" },
  "templates": { "slice": null },
  "html": true,
  "story_map": true }
```

`<docs>` below is the `docs` value. `templates.slice: null` means [resources/slice-template.md](resources/slice-template.md). HTML rendering uses `bokata-feature-map`'s [html-template.md](../bokata-feature-map/resources/html-template.md) and [story-map-template.md](../bokata-feature-map/resources/story-map-template.md).

## Mode

- **Trio mode (large initiative)** — `<docs>/<initiative-slug>/features.md` exists. Reviews and Rules come from the three trio subagents, as below.
- **Single mode (one feature)** — there is only a pitch (or a plain description). The pitch is the one Feature. Run every trio step yourself, one lens at a time, without subagents, and skip `features.md` updates.

The user can force either mode.

---

## Input

Accept either:
1. **1–3 Feature names + existing initiative** (infer from `<docs>/<initiative-slug>/features.md`)
2. **A pitch** (`<docs>/<initiative-slug>/pitch.md`) — single mode
3. **Just the initiative** (show its Features and ask the user to pick)

---

## Step 1: Resolve Features & Folders

1. Read `features.md` (or the pitch), the constitution, and the slices that already exist in `<docs>/<initiative-slug>/slices/`.
2. Show the Features with what each existing slice already took, and ask the user to pick **1–3 Features that make sense together** if not provided via argument. For the first slice, recommend the group that makes the journey usable end to end.
3. Create folder: `<docs>/<initiative-slug>/slices/` (use `mkdir -p` via Bash)
4. Proceed with confirmed Features in subsequent steps

---

## Step 2: Consolidated Phase 0 Discovery (Interactive)

Instead of each skill asking its own Phase 0 questions, consolidate once here.

Ask clarifying questions about the **specific Features being sliced** that would affect Step Analysis (layer assignment), Incremental Options (viability/dependencies), or Walking Skeleton selection:
- **Technical Clarity**: Are User Tasks specific enough to decompose into layers? Any vague actions?
- **Layer Ambiguity**: Are any steps unclear about which layer they belong to (UI vs Logic vs Data)?
- **Increment Scope**: Are any User Tasks too large to slice meaningfully without clarification?
- **Dependencies**: Are there unspecified technical dependencies between User Tasks — or between the picked Features?
- **Constraints**: Are there architectural or performance constraints that affect which increment options are viable?

If the input is already rich (backbone + functional ACs provided), acknowledge that explicitly:
> "You provided the features + functional ACs for [initiative], which resolves scope and rules. Asking only about [missing technical clarity categories]."

Produce one `## Discovery Context — Slicer: [Feature Names]` block with sections: Technical Clarifications / Layer Decisions / Increment Boundaries / Dependencies Confirmed / Constraints Noted / Assumptions.

**Save this in memory for Step 3** — it will be passed to reviewers.

---

## Step 3: Stage 1 — Increment Options (Skill + Trio Review, You Coordinate)

### 3a. Invoke Feature Slicer Skill (once per picked Feature)

For each picked Feature **whose `Increment options` in `features.md` are still empty**, invoke the `bokata-feature-slicer` skill (Features already sliced in an earlier slice reuse their options — do not regenerate them):
```
bokata-feature-slicer
Input: [Feature name from features.md]
Backbone: [full features.md backbone]
Functional ACs: [functional ACs of this Feature, from features.md]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — the Discovery Context has been pre-resolved upstream. Proceed directly to Phase 1 (Steps) through Phase 3 (Walking Skeleton + Backlog). Return the ## Walking Skeleton and ## Increments Backlog sections."
```

You receive the draft slicing of each Feature.

### 3b. Trio Review via Parallel Subagents

**Execution constraint (critical):** Issue all three subagent calls together in a **single assistant message** (three tool-use blocks in one turn) — never separately. Use your harness's subagent tool (Task/Agent in Claude Code, `task` in OpenCode, `spawn_agents` in Codex, subagents in Cursor). Set **all three to foreground/blocking execution** (not background/async) so the turn does NOT end until all three results are in hand. Do not proceed, consolidate, or stop until every subagent has returned its result in this same exchange. Review all picked Features in this one round.

Spawn three subagents in parallel to review the slicing:

**Task 1: bokata-product-manager**
```
subagent_type: bokata-product-manager
prompt: "Review this Walking Skeleton + Increments Backlog for [Features] from the value/viability lens. You have:
- Draft slicing: [paste Walking Skeleton + Increments per Feature]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Do NOT ask the user questions. Focus on: Is the skeleton truly minimum-viable-VALUE? Does each skeleton item ship observable value? Are Increments ordered by business impact? Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off). Return your review in the format specified in your agent file."
```

**Task 2: bokata-product-designer**
```
subagent_type: bokata-product-designer
prompt: "Review this Walking Skeleton + Increments Backlog for [Features] from the UX/UI design lens. You have:
- Draft slicing: [paste Walking Skeleton + Increments per Feature]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Do NOT ask the user questions. Focus on: Does the skeleton compose into a coherent minimal UI experience across the picked Features? Are missing states isolated to increments or essential to skeleton? Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off). Return your review in the format specified in your agent file."
```

**Task 3: bokata-product-engineer**
```
subagent_type: bokata-product-engineer
prompt: "Review this Walking Skeleton + Increments Backlog for [Features] from the feasibility/technical-sustainability lens. You have:
- Draft slicing: [paste Walking Skeleton + Increments per Feature]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Do NOT ask the user questions. Focus on: Are layer assignments sound? Are increment boundaries technically viable? Any sustainability concerns with the skeleton choices? Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off). Return your review in the format specified in your agent file."
```

**Wait for all three to complete in this same turn.** Do not issue further instructions until you have all three results in hand.

### 3c. Reconcile Reviews (You Are the Neutral Coordinator)

You act as the **neutral coordinator** — you do not add a fourth opinion and you do not arbitrate product trade-offs yourself. Classify each finding from the PM, Designer, and Engineer reviews into one bucket (use each reviewer's `Type` tag, but verify it):

- **(a) Non-conflicting improvement** — incorporate directly into the slicing.
- **(b) Factual / scope conflict** — decidable against an existing artifact (`features.md`, the pitch, the Discovery Context, or the project `constitution`). Resolve it deterministically by checking that artifact, apply the fix, and record a one-line entry in `## Trio Reconciliation Notes` citing the artifact. Do not ask the user.
- **(c) Genuine product trade-off** — a value↔UX / value↔sustainability judgment with no ground truth in any artifact (e.g., PM: "defer Increment 3A"; Designer: "3A must ship in skeleton for coherent UX"). This is the human's decision.

**Handling bucket (c):** collect all trade-offs first (never a per-conflict drip). For each, prepare the two positions (attributed to their lens), the one-sentence crux, and a **recommended default** grounded in the `constitution` / Fast Feedback Principle.
- **Interactive mode (default):** present all trade-offs as a single numbered decision point and wait for the user's choice before writing. Use your harness's question tool if it provides one (`AskUserQuestion` in Claude Code, `question` in OpenCode; one question per conflict; options = each lens position plus your recommended default, marked as recommended). If your harness has no such tool, present the same as a numbered plain-text prompt and wait for the reply. Apply the user's selections.
- **Non-interactive mode** (`--no-interactive` flag present, or a headless/automation run): do not block — apply the recommended default for each and record every trade-off in `## Trio Reconciliation Notes` with its two positions, the applied default, and a `⚠ flagged for human review` marker.

### 3d. Store the Increment Options

Write each reconciled Feature's options into its `##### Increment options` section in `features.md`, one line each, describing what the user can do or see (never endpoints, fields or function names):
```
- [skeleton] {FEAT}-a: [Walking Skeleton item] **[User Task Name]**
- {FEAT}-b: [Increment] **[User Task Name]**
```
Keep the slicer's `**[User Task Name]**` tags: the story map needs them.

### 3e. Compose the Slice (Interactive)

Propose which options form **this** slice, grouped into **one scope per picked Feature**:
- **First slice of the initiative:** default to the Walking Skeleton — the `[skeleton]` options of each picked Feature, so the flow is usable end to end.
- **Later slices:** the options that unlock the most value on top of what earlier slices built.
- Mark each increment **must-have** or **~nice-to-have**. The slice is done when every must-have is done and verified; open `~` items go back to the options list.
- Every increment must be functional on its own. If an option only makes sense together with another (for example a data change with no visible effect), merge them.

Present the proposal and let the user add, drop or re-mark increments, and name the slice. **The user decides the slice.**

---

## Step 4: Stage 2 — Concrete Acceptance Criteria (Trio Contribution, chosen increments only)

### 4a. Trio Contributes Rules Scoped per Increment (Subagents, Parallel)

**Execution constraint (critical):** Issue all three subagent calls together in a **single assistant message** (three tool-use blocks in one turn) — never separately. Set **all three to foreground/blocking execution** (not background/async) so the turn does NOT end until all three results are in hand. Do not proceed, consolidate, or stop until every subagent has returned its result in this same exchange.

Spawn three subagents in parallel, each contributing Rules from their lens — scoped per chosen increment:

**Task 1: PM Contribution**
```
subagent_type: bokata-product-manager
prompt: "Contribute business-rule Rules for this slice, scoped per increment, from the viability/value lens. You have:
- Chosen increments (reconciled), grouped by Feature: [paste]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Instruction: Do NOT ask the user questions. For each Walking Skeleton item: priority/launch-blocking rules specific to that item. For each Increment: the value unlock it enables. Format per your agent file (Contributed Rules — PM Lens section). Scope each Rule to a specific item/increment."
```

**Task 2: Designer Contribution**
```
subagent_type: bokata-product-designer
prompt: "Contribute UX/UI Rules for this slice, scoped per increment, from the usability/craft lens. You have:
- Chosen increments (reconciled), grouped by Feature: [paste]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Instruction: Do NOT ask the user questions. For each skeleton item: the specific UI states, component reuse, interaction patterns. For each Increment: the UX capability it unlocks. Format per your agent file (Contributed Rules — Designer Lens section). Scope each Rule to a specific item/increment."
```

**Task 3: Engineer Contribution**
```
subagent_type: bokata-product-engineer
prompt: "Contribute technical Rules for this slice, scoped per increment, from the feasibility/sustainability lens. You have:
- Chosen increments (reconciled), grouped by Feature: [paste]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Instruction: Do NOT ask the user questions. For each skeleton item: data model shape, API contracts, concurrency/permission guards specific to that item. For each Increment: whether it can be built in isolation or if it reshapes skeleton choices. Format per your agent file (Contributed Rules — Engineer Lens section). Scope each Rule to a specific item/increment."
```

**Wait for all three to complete in this same turn.** Do not issue further instructions until you have all three results in hand.

### 4b. Consolidate & Invoke AC Skill (Interactive)

Read all three contributions. Merge them into a single enrichment block (equivalent to a pre-filled `## Discovery Context — Criteria`), de-duplicating overlapping Rules and grouping by increment.

Invoke `bokata-acceptance-criteria`:
```
bokata-acceptance-criteria --concrete
Input: [the chosen increments, grouped by Feature]
Enrichment: [consolidated Rules from PM/Designer/Engineer, grouped by increment]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — it has been resolved upstream. Use the provided Discovery Context and Enrichment (consolidated Rules from the Product Trio). Proceed directly to Phase 1 (Input Analysis) through Phase 3 (Generate Output), using the --concrete depth mode. Important: the input contains Walking Skeleton items and Increments — group your output by these items (use ## Walking Skeleton Item: [name] and ## Increment: [ID] headers as scoping delimiters). Return the ## Acceptance Criteria (Concrete) section."
```

You receive the concrete ACs.

---

## Step 5: Write the Slice & Render HTML

1. Number the slice (`01`, `02`, … after the existing ones) and **write** `<docs>/<initiative-slug>/slices/<nn>-<name>.md` from the slice template: the header, one `## Scope:` per picked Feature, and under each scope its chosen increments (must-have / `~`) with their concrete Gherkin ACs, an empty `Plan:` (filled by `bokata-plan`) and an empty `Tests:` (filled by the executor). Add `## Trio Reconciliation Notes`.

2. **Render & Write** `<docs>/<initiative-slug>/slices/<nn>-<name>.html` (if `html` is true):
   - Using the `html-template.md` conversion rules (markdown → semantic HTML)
   - Build title: `"Slice <nn> — <name>"`
   - Build subtitle: `"Trio-Reviewed Vertical Slice"`
   - Convert Walking Skeleton items and Increments per the template's table (`.skeleton-item`, `.increment-item`), and the Gherkin per its `.requirement`, `.scenario` rules
   - Footer: `"Slice <nn> — <name> | Generated [DATE] | Skill: bokata-slice | Source: features.md [Features]"`

3. In `features.md`, append `→ <nn>-<name>` to every option this slice took.

---

## Step 6: Update Story Map

If `<docs>/<initiative-slug>/story-map.html` exists:

1. **Read** it (created by `bokata-feature-map`)

2. **The addressable unit is the User Task (Step) column, not the Feature** — per `story-map-template.md`. Do NOT locate a single `.map-column[data-feature-id]` and swap one shared block; a Feature's Steps are updated individually, one column at a time.

3. **Use the `**[User Task Name]**` tags** of the chosen increments to group them by which User Task they belong to. Not every User Task in the picked Features will necessarily have a chosen increment — that's expected; a slice commonly touches only some Steps.

4. **For each tagged User Task**, locate its column: `querySelector('.step-card[data-task-id="{{TASK_ID}}"]')`, resolve its absolute grid-column position, and replace that Step's `.release-cell` placeholder (or append below the cards already there) with:
   - A `.skeleton-item-card` for its Walking Skeleton item, if any
   - `.increment-card` divs stacked below it for its Increments
   - Label each card with the slice name, so every slice reads as one release row

5. **Leave every other Step's column untouched** — including Steps this slice didn't tag, and every card from earlier slices

6. **Update footer** to show current slicing progress:
   - `"{{INITIATIVE_NAME}} Story Mapping | Generated [DATE] | Features: {{NUM_FEATURES}} | Steps: {{NUM_TASKS}} | Sliced: {{SLICED_COUNT}}/{{NUM_FEATURES}} | Slices: {{NUM_SLICES}} | Skills: bokata-feature-map → bokata-slice"`

7. **Write** back to `<docs>/<initiative-slug>/story-map.html` (same filename)

---

## Step 7: Verification Gate (No New Rendering Here)

- [ ] `<docs>/<initiative-slug>/slices/<nn>-<name>.md` exists and is final
- [ ] `<docs>/<initiative-slug>/slices/<nn>-<name>.html` exists (if `html`)
- [ ] `features.md` has the Increment options of every picked Feature, and the ones this slice took are marked
- [ ] `story-map.html` was updated (not recreated) with this slice's cards (if it exists)

---

## Step 8: Summary & Next Steps (Main Thread)

Print to user:
```
## ✓ Slice Ready

**Slice:** <nn>-<name> — Features: {{FEATURES}}
**Location:** <docs>/{{INITIATIVE_SLUG}}/slices/<nn>-<name>.md

**What the user can do when it's done:** {{ONE_LINE}}
**Increments:** {{NUM_MUST}} must-have, {{NUM_NICE}} nice-to-have · {{NUM_GHERKIN_BLOCKS}} concrete scenarios
**Left in the backlog:** {{NUM_OPTIONS_LEFT}} options in features.md

**Trio Review Notes:**
[If any reconciliation notes exist: "See the slice for [N] reconciliation notes flagged during PM/Designer/Engineer review."]

---

**Next step:** `bokata-plan <docs>/{{INITIATIVE_SLUG}}/slices/<nn>-<name>.md` — inside your harness's plan mode.
```

---

## Quality Checks (Before Writing)

- [ ] Discovery Context is present and complete (specific to the picked Features)
- [ ] The Walking Skeleton of each picked Feature covers ALL its User Tasks (verified against the backbone)
- [ ] Every Walking Skeleton item is genuinely the simplest viable option — functional on its own, no duration written
- [ ] Every Walking Skeleton item is reversible (especially Data layer)
- [ ] Increment options contain all remaining options, grouped by User Task, in `features.md`
- [ ] Every increment in the slice is functional on its own and marked must-have or `~`
- [ ] Trio reviews are visibly mentioned in the narrative
- [ ] Trio Reconciliation Notes section is present if any conflicts were resolved
- [ ] Concrete ACs exist only for the chosen increments, grouped by increment (not by whole Feature)
- [ ] Concrete AC uses full Gherkin Given/When/Then for every scenario
- [ ] All Gherkin has concrete example data (not abstract placeholders)
- [ ] Every `.html` was rendered and written immediately after its `.md` was finalized (not deferred to a final batch step)
- [ ] `story-map.html` update touched only the tagged Step columns — every other Step column and all cards from earlier slices were left untouched
- [ ] All parallel subagent fan-outs were issued together and completed before reconciliation began
