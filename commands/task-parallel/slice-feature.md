---
name: "Bokata: Slice Feature"
description: Decompose a Feature (from an existing backbone) into a Walking Skeleton + Increments Backlog, with concrete-depth Acceptance Criteria per skeleton item/increment. Outputs as .md and .html under docs/initiatives/[initiative]/[feature]/.
allowed-tools: Read, Write, Skill, Task, AskUserQuestion, Bash
category: Workflow
tags: [bokata, product-trio, feature-slicing, incremental-design]
---

Decompose a Feature from an existing Features Backbone into a **Walking Skeleton + Increments Backlog**, with **concrete-depth Acceptance Criteria** (per skeleton item and per increment) using the **Product Trio** — you act as the neutral coordinator, with PM, Designer, and Engineer reviewing from their lenses.

All outputs (.md + .html) are saved under `docs/initiatives/<initiative-slug>/<feature-slug>/` and include trio reconciliation notes where conflicts arose.

---

## Input

Accept either:
1. **Feature name + existing initiative** (infer from `docs/initiatives/<initiative-slug>/backbone.md`)
2. **Ad-hoc feature + backbone path** (user provides both)
3. **Just feature name** (ask user to select from existing initiatives)

---

## Step 1: Resolve Feature & Folders

1. Ask user for the Feature to slice if not provided via argument
2. Locate or ask for the initiative's `docs/initiatives/<initiative-slug>/backbone.md` + `acceptance-criteria-functional.md`
3. Derive `<feature-slug>` (kebab-case, max 50 chars)
4. Create folder: `docs/initiatives/<initiative-slug>/<feature-slug>/` (use `mkdir -p` via Bash)
5. Proceed with confirmed paths in subsequent steps

---

## Step 2: Consolidated Phase 0 Discovery (Interactive)

Instead of each skill asking its own Phase 0 questions, consolidate once here.

Ask clarifying questions about the **specific Feature being sliced** that would affect Step Analysis (layer assignment), Incremental Options (viability/dependencies), or Walking Skeleton selection:
- **Technical Clarity**: Are User Tasks specific enough to decompose into layers? Any vague actions?
- **Layer Ambiguity**: Are any steps unclear about which layer they belong to (UI vs Logic vs Data)?
- **Increment Scope**: Are any User Tasks too large to slice meaningfully without clarification?
- **Dependencies**: Are there unspecified technical dependencies between User Tasks?
- **Constraints**: Are there architectural or performance constraints that affect which increment options are viable?

If the input is already rich (existing backbone + functional ACs provided), acknowledge that explicitly:
> "You provided the backbone + functional ACs for [initiative], which resolves scope and rules. Asking only about [missing technical clarity categories]."

Produce one `## Discovery Context — Slicer: [Feature Name]` block with sections: Technical Clarifications / Layer Decisions / Increment Boundaries / Dependencies Confirmed / Constraints Noted / Assumptions.

**Save this in memory for Step 3** — it will be passed to reviewers.

---

## Step 3: Stage 1 — Slicing (Skill + Trio Review, You Coordinate)

### 3a. Invoke Feature Slicer Skill

Invoke the `bokata-feature-slicer` skill:
```
/bokata:feature-slicer
Input: [Feature name from backbone.md]
Backbone: [full backbone.md markdown]
Functional ACs: [acceptance-criteria-functional.md markdown for this Feature]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — the Discovery Context has been pre-resolved upstream. Proceed directly to Phase 1 (Steps) through Phase 3 (Walking Skeleton + Backlog). Return the ## Walking Skeleton and ## Increments Backlog sections."
```

You receive the draft slicing.

### 3b. Trio Review via Parallel Subagents

**Execution constraint (critical):** Issue all three Task calls together in a **single assistant message** (three tool-use blocks in one turn) — never separately. Set **all three to foreground/blocking execution** (not background/async) so the turn does NOT end until all three results are in hand. Do not proceed, consolidate, or stop until every subagent has returned its result in this same exchange.

Spawn three Task subagents in parallel to review the slicing:

**Task 1: bokata-product-manager**
```
subagent_type: bokata-product-manager
prompt: "Review this Walking Skeleton + Increments Backlog for [Feature] from the value/viability lens. You have:
- Draft slicing: [paste Walking Skeleton + Increments]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Do NOT ask the user questions. Focus on: Is the skeleton truly minimum-viable-VALUE? Does each skeleton item ship observable value? Are Increments ordered by business impact? Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off). Return your review in the format specified in your agent file."
```

**Task 2: bokata-product-designer**
```
subagent_type: bokata-product-designer
prompt: "Review this Walking Skeleton + Increments Backlog for [Feature] from the UX/UI design lens. You have:
- Draft slicing: [paste Walking Skeleton + Increments]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Do NOT ask the user questions. Focus on: Does the skeleton compose into a coherent minimal UI experience? Are missing states isolated to increments or essential to skeleton? Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off). Return your review in the format specified in your agent file."
```

**Task 3: bokata-product-engineer**
```
subagent_type: bokata-product-engineer
prompt: "Review this Walking Skeleton + Increments Backlog for [Feature] from the feasibility/technical-sustainability lens. You have:
- Draft slicing: [paste Walking Skeleton + Increments]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Do NOT ask the user questions. Focus on: Are layer assignments sound? Are increment boundaries technically viable? Any sustainability concerns with the skeleton choices? Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off). Return your review in the format specified in your agent file."
```

**Wait for all three to complete in this same turn.** Do not issue further instructions until you have all three results in hand.

### 3c. Reconcile Reviews (You Are the Neutral Coordinator)

You act as the **neutral coordinator** — you do not add a fourth opinion and you do not arbitrate product trade-offs yourself. Classify each finding from the PM, Designer, and Engineer reviews into one bucket (use each reviewer's `Type` tag, but verify it):

- **(a) Non-conflicting improvement** — incorporate directly into the slicing markdown.
- **(b) Factual / scope conflict** — decidable against an existing artifact (`backbone.md`, `acceptance-criteria-functional.md`, the Discovery Context, or the project `constitution`). Resolve it deterministically by checking that artifact, apply the fix, and record a one-line entry in `## Trio Reconciliation Notes` citing the artifact. Do not ask the user.
- **(c) Genuine product trade-off** — a value↔UX / value↔sustainability judgment with no ground truth in any artifact (e.g., PM: "defer Increment 3A"; Designer: "3A must ship in skeleton for coherent UX"). This is the human's decision.

**Handling bucket (c):** collect all trade-offs first (never a per-conflict drip). For each, prepare the two positions (attributed to their lens), the one-sentence crux, and a **recommended default** grounded in the `constitution` / Fast Feedback Principle.
- **Interactive mode (default):** present all trade-offs as a single numbered decision point and wait for the user's choice before writing. Use `AskUserQuestion` if your harness provides it (one question per conflict; options = each lens position plus your recommended default, marked as recommended). If your harness has no such tool, present the same as a numbered plain-text prompt and wait for the reply. Apply the user's selections.
- **Non-interactive mode** (`--no-interactive` flag present, or a headless/automation run): do not block — apply the recommended default for each and record every trade-off in `## Trio Reconciliation Notes` with its two positions, the applied default, and a `⚠ flagged for human review` marker.

Produce final `slicing.md` with (a) incorporated, (b) resolved-and-cited, and (c) resolved-by-user-or-default — all (b)/(c) outcomes captured in `## Trio Reconciliation Notes`.

---

## Step 4: Stage 2 — Concrete Acceptance Criteria (Trio Contribution)

### 4a. Trio Contributes Rules Scoped per Skeleton Item / Increment (Task Subagents, Parallel)

**Execution constraint (critical):** Issue all three Task calls together in a **single assistant message** (three tool-use blocks in one turn) — never separately. Set **all three to foreground/blocking execution** (not background/async) so the turn does NOT end until all three results are in hand. Do not proceed, consolidate, or stop until every subagent has returned its result in this same exchange.

Spawn three Task subagents in parallel, each contributing Rules from their lens — scoped per Walking Skeleton item / per Increment:

**Task 1: PM Contribution**
```
subagent_type: bokata-product-manager
prompt: "Contribute business-rule Rules for this [Feature] slicing, scoped per Walking Skeleton item and per Increment, from the viability/value lens. You have:
- Final slicing (reconciled): [paste]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Instruction: Do NOT ask the user questions. For each Walking Skeleton item: priority/launch-blocking rules specific to that item. For each Increment: the value unlock it enables. Format per your agent file (Contributed Rules — PM Lens section). Scope each Rule to a specific item/increment."
```

**Task 2: Designer Contribution**
```
subagent_type: bokata-product-designer
prompt: "Contribute UX/UI Rules for this [Feature] slicing, scoped per Walking Skeleton item and per Increment, from the usability/craft lens. You have:
- Final slicing (reconciled): [paste]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Instruction: Do NOT ask the user questions. For each skeleton item: the specific UI states, component reuse, interaction patterns. For each Increment: the UX capability it unlocks. Format per your agent file (Contributed Rules — Designer Lens section). Scope each Rule to a specific item/increment."
```

**Task 3: Engineer Contribution**
```
subagent_type: bokata-product-engineer
prompt: "Contribute technical Rules for this [Feature] slicing, scoped per Walking Skeleton item and per Increment, from the feasibility/sustainability lens. You have:
- Final slicing (reconciled): [paste]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Instruction: Do NOT ask the user questions. For each skeleton item: data model shape, API contracts, concurrency/permission guards specific to that item. For each Increment: whether it can be built in isolation or if it reshapes skeleton choices. Format per your agent file (Contributed Rules — Engineer Lens section). Scope each Rule to a specific item/increment."
```

**Wait for all three to complete in this same turn.** Do not issue further instructions until you have all three results in hand.

### 4b. Consolidate & Invoke AC Skill (Interactive)

Read all three contributions. Merge them into a single enrichment block (equivalent to a pre-filled `## Discovery Context — Criteria`), de-duplicating overlapping Rules and grouping by skeleton item / increment.

Invoke `bokata-acceptance-criteria`:
```
/bokata:acceptance-criteria --concrete
Input: [final slicing.md from Step 3c]
Enrichment: [consolidated Rules from PM/Designer/Engineer, grouped by skeleton item/increment]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — it has been resolved upstream. Use the provided Discovery Context and Enrichment (consolidated Rules from the Product Trio). Proceed directly to Phase 1 (Input Analysis) through Phase 3 (Generate Output), using the --concrete depth mode. Important: the input contains a Walking Skeleton + Increments Backlog — group your output by these items (use ## Walking Skeleton Item: [name] and ## Increment: [ID] headers as scoping delimiters). Return the ## Acceptance Criteria (Concrete) section."
```

You receive the concrete ACs.

---

## Step 5: Write Slicing Markdown & Render HTML

Right after reconciling (Step 3) and handling any trade-offs:

1. **Write** `docs/initiatives/<initiative-slug>/<feature-slug>/slicing.md` (final reconciled markdown)

2. **Render & Write** `docs/initiatives/<initiative-slug>/<feature-slug>/slicing.html`:
   - Using the `html-template.md` conversion rules from the command's resources directory (markdown → semantic HTML)
   - Build title: `"[Feature Name] — Walking Skeleton + Increments Backlog"`
   - Build subtitle: `"Trio-Reviewed Feature Slicing"`
   - Convert Walking Skeleton items and Increments per the template's table (`.skeleton-item`, `.increment-item`)
   - Footer: `"[Feature Name] Slicing | Generated [DATE] | Command: /bokata:slice-feature | Source: Backbone [initiative] + Functional ACs"`

---

## Step 6: Write Concrete AC Markdown & Render HTML

Right after consolidating trio contributions and invoking AC skill (Step 4b above):

1. **Write** `docs/initiatives/<initiative-slug>/<feature-slug>/acceptance-criteria-concrete.md` (the concrete AC markdown)

2. **Render & Write** `docs/initiatives/<initiative-slug>/<feature-slug>/acceptance-criteria-concrete.html`:
   - Using the `html-template.md` conversion rules from the command's resources directory
   - Build title: `"[Feature Name] — Acceptance Criteria (Concrete)"`
   - Build subtitle: `"Per-Item Gherkin + Scenarios"`
   - Convert Requirements and Gherkin scenarios per the template's table (`.requirement`, `.scenario`, Gherkin keywords)
   - Footer: `"[Feature Name] Acceptance Criteria (Concrete) | Generated [DATE] | Command: /bokata:slice-feature | Depth: concrete | Source: Walking Skeleton + Trio Contributions"`

---

## Step 7: Update Story Map

Right after writing the concrete ACs:

1. **Read** the existing `docs/initiatives/<initiative-slug>/story-map.html` (created by `/bokata:feature-map`)

2. **The addressable unit is the User Task (Step) column, not the Feature** — per `story-map-template.md`. Do NOT locate a single `.map-column[data-feature-id]` and swap one shared block; a Feature's Steps are updated individually, one column at a time.

3. **Parse `slicing.md`'s `**[User Task Name]**` tags** (already required of `bokata-feature-slicer`'s output — see its Output Checklist: "Backlog grouped by User Task", "All items use correct tag format") to group Walking Skeleton items and Increments by which User Task they belong to. Not every User Task in the sliced Feature will necessarily have a tagged item — that's expected; a Walking Skeleton commonly touches only some Steps.

4. **For each tagged User Task**, locate its column: `querySelector('.step-card[data-task-id="{{TASK_ID}}"]')`, resolve its absolute grid-column position, and replace that Step's `.release-cell` placeholder with:
   - A `.skeleton-item-card` (`grid-row: 3`, same `grid-column`) for its Walking Skeleton item, if any
   - `.increment-card` divs stacked below it (`grid-row: 4, 5, ...`, same `grid-column`) for its Increments, ordered by priority

5. **Leave every other Step's column untouched** — including Steps within this same Feature that this slicing pass didn't tag (they keep their "Not yet sliced" placeholder), and every column belonging to other Features (preserve previously-sliced features exactly as-is)

6. **Update footer** to show current slicing progress:
   - `"{{INITIATIVE_NAME}} Story Mapping | Generated [DATE] | Features: {{NUM_FEATURES}} | Steps: {{NUM_TASKS}} | Sliced: {{SLICED_COUNT}}/{{NUM_FEATURES}} | Command: /bokata:feature-map → /bokata:slice-feature"`

7. **Write** back to `docs/initiatives/<initiative-slug>/story-map.html` (same filename)

---

## Step 8: Verification Gate (No New Rendering Here)

This step is now a **checklist verification** only — no new rendering work happens here:

- [ ] `docs/initiatives/<initiative-slug>/<feature-slug>/slicing.md` exists and is final
- [ ] `docs/initiatives/<initiative-slug>/<feature-slug>/slicing.html` exists
- [ ] `docs/initiatives/<initiative-slug>/<feature-slug>/acceptance-criteria-concrete.md` exists and is final
- [ ] `docs/initiatives/<initiative-slug>/<feature-slug>/acceptance-criteria-concrete.html` exists
- [ ] `docs/initiatives/<initiative-slug>/story-map.html` was updated (not recreated) with this Feature's skeleton/increments

(All HTML rendering now happens immediately after its corresponding .md is finalized, not deferred to Step 8.)

---

## Step 9: Summary & Next Steps (Main Thread)

Print to user:
```
## ✓ Feature Slicing Complete

**Feature:** {{FEATURE_NAME}}
**Initiative:** {{INITIATIVE_NAME}}
**Location:** docs/initiatives/{{INITIATIVE_SLUG}}/{{FEATURE_SLUG}}/

**Artifacts created:**
- slicing.md / .html ✅ — {{NUM_SKELETON_ITEMS}} Walking Skeleton items, {{NUM_INCREMENTS}} Increments in Backlog
- acceptance-criteria-concrete.md / .html ✅ — {{NUM_GHERKIN_BLOCKS}} Gherkin scenarios (concrete depth, per-item grouped)
- story-map.html (updated) ✅ — {{FEATURE_NAME}}'s Step columns updated with skeleton + increments

**Trio Review Notes:**
[If any reconciliation notes exist: "See slicing.md for [N] reconciliation notes flagged during PM/Designer/Engineer review."]

---

**Next steps:**
1. **Start implementing:** Pick a Walking Skeleton item and use its Gherkin ACs (in acceptance-criteria-concrete.md) as acceptance criteria for development.
2. **Iterate by increment:** As each item ships, move to the next, or pick an Increment from the Backlog if you want to add capability before completing the full skeleton.
3. **Slice another feature:** Run `/bokata:slice-feature [next feature]` for the next Feature in the backbone. The story-map will auto-update.

**Example Walking Skeleton item:**
[Show first skeleton item title and its acceptance criteria from the concrete AC doc]

**Living Document:** Your story-map.html now shows {{FEATURE_NAME}} with its Walking Skeleton + Increments. Slice the next feature and the board keeps growing!
```

---

## Quality Checks (Before Writing)

- [ ] Discovery Context is present and complete (feature-specific)
- [ ] Walking Skeleton covers ALL User Tasks (verified against backbone)
- [ ] Every Walking Skeleton item is genuinely simplest viable option (buildable in 1-3 days)
- [ ] Every Walking Skeleton item is reversible (especially Data layer)
- [ ] Increments Backlog contains all remaining options, grouped by User Task
- [ ] Trio reviews are visibly mentioned in the narrative
- [ ] Trio Reconciliation Notes section is present if any conflicts were resolved
- [ ] Concrete AC Requirements are grouped by Walking Skeleton Item / Increment (not by whole Feature)
- [ ] Concrete AC uses full Gherkin Given/When/Then for every scenario
- [ ] All Gherkin has concrete example data (not abstract placeholders)
- [ ] Every `.html` was rendered and written immediately after its `.md` was finalized (not deferred to a final batch step)
- [ ] `story-map.html` update touched only the tagged Step columns for this Feature (`data-task-id` matches from `slicing.md`'s `**[User Task Name]**` tags) — every other Step column, including untagged Steps within this same Feature and all columns from previously-sliced Features, was left untouched
- [ ] All parallel subagent fan-outs were issued together and completed before reconciliation began
