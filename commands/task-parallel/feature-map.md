---
name: "Bokata: Feature Map"
description: Generate a Features Backbone and Functional Acceptance Criteria using the Product Trio (PM, Designer, Engineer). Outputs as .md and .html under docs/initiatives/[name]/.
allowed-tools: Read, Write, Skill, Task, AskUserQuestion, Bash
category: Workflow
tags: [bokata, product-trio, feature-mapping, acceptance-criteria]
---

Generate a Features Backbone (User Story Mapping) and Functional-Level Acceptance Criteria using the **Product Trio** — coordinated by the neutral `bokata-product-coordinator`, with PM, Designer, and Engineer reviewing from their lenses.

All outputs (.md + .html) are saved under `docs/initiatives/<initiative-slug>/` and include trio reconciliation notes where conflicts arose.

---

## Input

Accept either:
1. **Free-form initiative description** (what you want to build)
2. **Path to existing docs** (PRD, openspec proposal, features-backbone.md, etc.)
3. **Combination** (reference existing + add new context)

---

## Step 1: Resolve Initiative Slug & Create Folder

1. Ask the user for the initiative name / title if not provided via argument
2. Derive `<initiative-slug>` (kebab-case, max 50 chars, no spaces)
3. Create folder: `docs/initiatives/<initiative-slug>/` (use `mkdir -p` via Bash)
4. Proceed with confirmed slug in subsequent steps

---

## Step 2: Consolidated Phase 0 Discovery (Main Thread, Interactive)

Instead of each skill asking its own Phase 0 questions, consolidate once here.

Ask clarifying questions that would affect **Feature scope, actors, flows, or business constraints** — merge the categories from:
- `bokata-feature-mapper`'s categories: Scope, Actors, Flows, Constraints
- Later AC phases: Business rules that affect Feature framing (e.g., "must curator-verify stories before public visibility" — is that a Feature boundary or an internal rule?)

If the input is already rich (existing backbone/spec provided), acknowledge that explicitly:
> "You provided [specs/geolocation-discovery/spec.md], which resolves Scope and Constraints. Skipping those categories; asking only about [missing categories]."

Produce one `## Discovery Context — Backbone` block with sections: Actors Confirmed / Scope Boundaries / Flow Clarifications / Constraints Confirmed / Assumptions.

**Save this in memory for Step 3** — it will be passed to the coordinator.

---

## Step 3: Stage 1 — Backbone (Coordinator Invokes Skill + Trio Review)

### 3a. Invoke Coordinator as Task Subagent

Spawn the coordinator to handle skill invocation, trio review, and reconciliation:

```
subagent_type: bokata-product-coordinator
prompt: "You are the Product Trio Coordinator. Your task:

1. **Invoke the skill:** Run `bokata-feature-mapper` with:
   Input: [initiative description / PRD / existing docs]
   Discovery Context: [paste from Step 2]
   Instruction: 'Skip your own Phase 0 discovery — the Discovery Context has been pre-resolved upstream. Proceed directly to Step 1 (Extract Requirements) through Step 6 (Organize Dependencies). Return the ## Features Backbone markdown section.'

2. **Launch 3 reviewers in parallel** against the draft backbone:
   - bokata-product-manager (viability/value lens)
   - bokata-product-designer (UX/UI craft lens)
   - bokata-product-engineer (feasibility/sustainability lens)
   
   Each reviewer receives: the draft backbone + Discovery Context. Instruction: 'Do NOT ask the user questions. Return your review in the format specified in your agent file.'

3. **Reconcile all findings** using the Routing Rules from your agent file:
   - (a) Non-conflicting → incorporate directly
   - (b) Factual/scope conflict → resolve against artifacts, cite source
   - (c) Genuine product trade-off → collect all, prepare positions + crux + recommended default

4. **System Task guard:** Apply the System Task trigger test before creating any standalone System Task.

5. **Return the final reconciled backbone markdown** with all (a)/(b)/(c) outcomes captured in a ## Trio Reconciliation Notes section. If in non-interactive mode, apply recommended defaults for (c) and flag with ⚠ flagged for human review."
```

**Wait for the coordinator to complete.** Do not proceed until you have the reconciled backbone.

### 3b. Handle Trade-Off Escalation (Main Thread, Interactive)

If the coordinator returned bucket-(c) trade-offs that need user input (interactive mode):

Present all trade-offs as a **single** decision point. For each trade-off, show:
- The positions from each lens
- The crux (one sentence)
- The coordinator's recommended default

Use `AskUserQuestion` if your harness provides it (one question per conflict; options = each lens position plus recommended default, marked as recommended). If your harness has no such tool, present as a numbered plain-text prompt and wait for the reply.

Apply the user's selections to the reconciled backbone.

---

## Step 4: Stage 2 — Functional Acceptance Criteria (Trio Contribution)

### 4a. Trio Contributes Rules from Their Lenses (Task Subagents, Parallel)

**Execution constraint (critical):** Issue all three Task calls together in a **single assistant message** (three tool-use blocks in one turn) — never separately. Set **all three to foreground/blocking execution** (not background/async) so the turn does NOT end until all three results are in hand. Do not proceed, consolidate, or stop until every subagent has returned its result in this same exchange.

Spawn three Task subagents in parallel, each contributing Rules from their lens — they do NOT generate Scenarios themselves, only Rules:

**Task 1: PM Contribution**
```
subagent_type: bokata-product-manager
prompt: "Contribute business-rule Rules for this Features Backbone, from the viability/value lens. You have:
- Final backbone (reconciled): [paste]
- Discovery Context: [paste]

Instruction: Do NOT ask the user questions. Generate a list of candidate Rules (not Scenarios) addressing: business rules, priority/launch-blocking vs deferred, value-triggering rules. Format per your agent file (Contributed Rules — PM Lens section). Keep each Rule scoped to a specific User Task and explain why it matters for value."
```

**Task 2: Designer Contribution**
```
subagent_type: bokata-product-designer
prompt: "Contribute UX/UI Rules for this Features Backbone, from the usability/craft lens. You have:
- Final backbone (reconciled): [paste]
- Discovery Context: [paste]

Instruction: Do NOT ask the user questions. Generate candidate Rules addressing: empty/loading/error states, interaction patterns, component reuse, permission-denied UX. Format per your agent file (Contributed Rules — Designer Lens section). Keep each Rule scoped to a specific User Task."
```

**Task 3: Engineer Contribution**
```
subagent_type: bokata-product-engineer
prompt: "Contribute technical Rules for this Features Backbone, from the feasibility/sustainability lens. You have:
- Final backbone (reconciled): [paste]
- Discovery Context: [paste]

Instruction: Do NOT ask the user questions. Generate candidate Rules addressing: data model constraints, permission/access rules, concurrency rules, offline/sync expectations, API contracts, sustainability/tech-debt concerns. Format per your agent file (Contributed Rules — Engineer Lens section). Keep each Rule scoped to a specific User Task."
```

**Wait for all three to complete in this same turn.** Do not issue further instructions until you have all three results in hand.

### 4b. Consolidate & Invoke AC Skill (Main Thread, Interactive)

Read all three contributions. Merge them into a single enrichment block (equivalent to a pre-filled `## Discovery Context — Criteria`), de-duplicating overlapping Rules.

Invoke `bokata-acceptance-criteria`:
```
/bokata:acceptance-criteria --functional
Input: [final backbone.md]
Enrichment: [consolidated Rules from PM/Designer/Engineer]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — it has been resolved upstream. Use the provided Discovery Context and Enrichment (consolidated Rules from the Product Trio). Proceed directly to Phase 1 (Input Analysis) through Phase 3 (Generate Output), using the --functional depth mode. Return the ## Acceptance Criteria (Functional) section."
```

You receive the functional ACs.

---

## Step 5: Write Backbone Markdown & Render HTML

Right after reconciling (Step 3) and handling any trade-offs:

1. **Write** `docs/initiatives/<initiative-slug>/backbone.md` (the final reconciled markdown)

2. **Render & Write** `docs/initiatives/<initiative-slug>/backbone.html`:
   - Using the `html-template.md` conversion rules from the command's resources directory (markdown → semantic HTML)
   - Build title: `"{{INITIATIVE_NAME}} — Features Backbone"`
   - Build subtitle: `"User Story Mapping + Trio-Reviewed"`
   - Convert Features, User Tasks, System Tasks, Dependencies per the template's table
   - Footer: `"{{INITIATIVE_NAME}} Features Backbone | Generated [DATE] | Command: /bokata:feature-map | Source: [input description]"`

3. **Create & Render** `docs/initiatives/<initiative-slug>/story-map.html`:
   - Using the `story-map-template.md` from the command's resources directory — **the addressable/column unit is the User Task (Step), not the Feature.** Do not build a `.map-column` per Feature with tasks listed inside it; that structure is wrong (see the template file's own warning about this).
   - Build title: `"{{INITIATIVE_NAME}} — Story Mapping"`
   - Build subtitle: `"Backbone (Features) → Steps (User Tasks) → Releases (Increments, by priority)"`
   - Row 1: render each Feature as a `.feature-header` spanning its own User Task count (`grid-column: span N`), ordered by backbone journey — this is a header only, it holds no cards
   - Row 2: render each User Task as its own `.step-card` column (`data-task-id="{{TASK_ID}}"`), in the same order as listed under its parent Feature
   - Row 3: give every Step column exactly one `.release-cell` placeholder ("Not yet sliced") — one per User Task, not one per Feature
   - Set `{{TOTAL_STEP_COUNT}}` = total User Tasks across all Features (the grid's column count)
   - Footer: `"{{INITIATIVE_NAME}} Story Mapping | Generated [DATE] | Command: /bokata:feature-map | Features: {{NUM_FEATURES}} | Steps: {{NUM_TASKS}} | Sliced: 0/{{NUM_FEATURES}}"`

---

## Step 6: Write AC Markdown & Render HTML

Right after consolidating trio contributions and invoking AC skill (Step 4b above):

1. **Write** `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.md` (the AC markdown)

2. **Render & Write** `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.html`:
   - Using the `html-template.md` conversion rules from the command's resources directory
   - Build title: `"{{INITIATIVE_NAME}} — Acceptance Criteria (Functional)"`
   - Build subtitle: `"Requirements + Scenarios (Product-Level)"`
   - Convert Requirements, Scenarios per the template's table (`.requirement`, `.scenario`, Gherkin keywords)
   - Footer: `"{{INITIATIVE_NAME}} Acceptance Criteria (Functional) | Generated [DATE] | Command: /bokata:feature-map | Depth: functional | Source: Features Backbone"`

---

## Step 7: Verification Gate (No New Rendering Here)

This step is now a **checklist verification** only — no new rendering work happens here:

- [ ] `docs/initiatives/<initiative-slug>/backbone.md` exists and is final
- [ ] `docs/initiatives/<initiative-slug>/backbone.html` exists
- [ ] `docs/initiatives/<initiative-slug>/story-map.html` exists
- [ ] `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.md` exists and is final
- [ ] `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.html` exists

(All HTML rendering now happens immediately after its corresponding .md is finalized, not deferred to Step 7.)

---

## Step 8: Summary & Next Steps (Main Thread)

Print to user:
```
## ✓ Feature Mapping Complete

**Initiative:** {{INITIATIVE_NAME}}
**Location:** docs/initiatives/{{INITIATIVE_SLUG}}/

**Artifacts created:**
- backbone.md / .html ✅ — {{NUM_FEATURES}} Features, {{NUM_TASKS}} User Tasks
- acceptance-criteria-functional.md / .html ✅ — {{NUM_REQUIREMENTS}} Requirements, {{NUM_SCENARIOS}} Scenarios (functional depth)
- story-map.html ✅ — Patton-style board (Features spanning the backbone header, User Tasks as individual Step columns, release tiers to be filled per-Step by slicing)

**Trio Review Notes:**
[If any reconciliation notes exist: "See backbone.md for [N] reconciliation notes flagged during PM/Designer/Engineer review."]

---

**Next step:** Run `/bokata:slice-feature [feature name]` to decompose a Feature into a Walking Skeleton + Increments Backlog. The story-map will auto-update with each feature you slice.

**Example:** `/bokata:slice-feature "Tourist Discovers Nearby Places"`

**Story Map Note:** The story-map.html board will accumulate each feature's Walking Skeleton and Increments as you slice them — all in one living document. No need to manage multiple files.
```

---

## Quality Checks (Before Writing)

- [ ] Discovery Context is present and complete
- [ ] Final backbone identifies all Features in [Actor] [Verb] [Object] format
- [ ] All User Tasks are in [Verb] [Object] format (no Actor)
- [ ] **All System Tasks follow the workflow-transition test from methodology.md** (only autonomous state transitions remain standalone; all direct-user-action responses are embedded in User Task descriptions)
- [ ] **System Tasks use naming format `System Task {N}.{M}: [Verb] [Object]`** (with explicit Trigger field)
- [ ] **Features/User Tasks/System Tasks use correct heading levels:** `#### Feature`, `##### User Task`, `##### System Task` (not bold text)
- [ ] Trio reviews are visibly mentioned in the narrative (or if they had no issues, explicitly state that)
- [ ] Trio Reconciliation Notes section is present if any conflicts were resolved
- [ ] Functional AC Requirements use SHALL/SHOULD language
- [ ] Functional AC Scenarios use WHEN/THEN (Given implicit/optional)
- [ ] Every `.html` was rendered and written immediately after its `.md` was finalized (not deferred to a final batch step)
- [ ] `story-map.html` exists, with Features spanning the row-1 backbone header and each User Task as its own Step column underneath (not Features-as-columns with tasks listed inside)
- [ ] Coordinator subagent completed before any downstream work began; all parallel subagent fan-outs ran foreground, single-message, with all results present before reconciliation
