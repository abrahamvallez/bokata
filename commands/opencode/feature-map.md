---
name: "Bokata: Feature Map"
description: Generate a Features Backbone and Functional Acceptance Criteria using the Product Trio (PM, Designer, Engineer). Outputs as .md and .html under docs/initiatives/[name]/. PM leads feature mapping; all three roles contribute to functional-depth ACs after trio review.
allowed-tools: Read, Write, Skill, Task, AskUserQuestion, Bash
category: Workflow
tags: [bokata, product-trio, feature-mapping, acceptance-criteria]
---

Generate a Features Backbone (User Story Mapping) and Functional-Level Acceptance Criteria using the **Product Trio** — Product Manager (lead), Designer, and Engineer reviewing and contributing from their lenses.

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

**Save this in memory for Step 3** — it will be passed to all downstream skill invocations.

---

## Step 3: Stage 1 — Backbone (Trio Review)

### 3a. PM Leads Feature Mapper (Main Thread — Skill)

Invoke `bokata-feature-mapper` with:
```
/bokata:feature-mapper
Input: [initiative description / PRD / existing docs]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — the Discovery Context has been pre-resolved upstream. Proceed directly to Step 1 (Extract Requirements) through Step 6 (Organize Dependencies). Return the ## Features Backbone markdown section."
```

You receive the draft backbone.

### 3b. Designer & Engineer Review in Parallel (Task Subagents, Non-Interactive)

**Execution constraint (critical):** Issue both Task calls together in a **single assistant message** (two tool-use blocks in one turn) — never separately across different messages. Set **both to foreground/blocking execution** (not background/async) so the turn does NOT end until both results are in hand. Do not proceed, reconcile, or stop until every subagent has returned its result in this same exchange.

Spawn two Task subagents in parallel:

**Task 1: Designer Review**
```
subagent_type: bokata-product-designer
prompt: "Review this Features Backbone draft from the UX/UI design lens. You have:
- Draft backbone: [paste backbone]
- Discovery Context: [paste context]

Instruction: Do NOT ask the user questions. If anything is ambiguous, state an assumption in your Assumptions section. Return your review in the format specified in your agent file (Review — Product Designer section). Focus on: missing user-facing states, journey coherence, UI pattern consistency, custom component needs."
```

**Task 2: Engineer Review**
```
subagent_type: bokata-product-engineer
prompt: "Review this Features Backbone draft from the feasibility/technical-sustainability lens. You have:
- Draft backbone: [paste backbone]
- Discovery Context: [paste context]

Instruction: Do NOT ask the user questions. If anything is ambiguous, state an assumption in your Assumptions section. Return your review in the format specified in your agent file (Review — Product Engineer section). Focus on: Feature boundary coupling, data model implications, technical risk, architecture sustainability."
```

**Wait for both to complete in this same turn.** Do not issue further instructions until you have both results in hand.

### 3c. Reconcile Reviews (Main Thread)

Read both Designer and Engineer outputs. For each finding:
- **Non-conflicting**: incorporate into the backbone markdown (reword Feature descriptions, add missing User Tasks, refine Actor boundaries)
- **Conflicting** (e.g., Engineer says "split Feature A into two"; Designer says "keep as one for UX coherence"): write a `## Trio Reconciliation Notes` block in the final doc surface the conflict + your recommended resolution, flagged for user review if genuinely unresolved

**System Task guard (critical):** If a Designer or Engineer finding describes system/backend behavior (e.g. "add a reverse-geocoding step," "cache responses with this key shape," "make this write idempotent"), do NOT default to adding it as a new standalone System Task. First apply the System Task trigger test from `methodology.md` (also enforced by `bokata-feature-mapper`'s own audit table): is this triggered by a direct user action already covered by an existing User Task? If yes — the far more common case for engineering-review findings — embed it as a note on that User Task's description instead. Only create a new standalone System Task if the finding describes a genuine autonomous workflow transition. Re-run this check for every System Task added or reworded during reconciliation, not just the ones from the initial draft.

Produce final `backbone.md` with trio review integrated.

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

## Step 3c (Immediate After Reconciliation): Write Backbone Markdown & Render HTML

Right after reconciling Designer/Engineer reviews (Step 3c above):

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

## Step 4b (Immediate After AC Generation): Write AC Markdown & Render HTML

Right after consolidating trio contributions and invoking AC skill (Step 4b above):

1. **Write** `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.md` (the AC markdown)

2. **Render & Write** `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.html`:
   - Using the `html-template.md` conversion rules from the command's resources directory
   - Build title: `"{{INITIATIVE_NAME}} — Acceptance Criteria (Functional)"`
   - Build subtitle: `"Requirements + Scenarios (Product-Level)"`
   - Convert Requirements, Scenarios per the template's table (`.requirement`, `.scenario`, Gherkin keywords)
   - Footer: `"{{INITIATIVE_NAME}} Acceptance Criteria (Functional) | Generated [DATE] | Command: /bokata:feature-map | Depth: functional | Source: Features Backbone"`

---

## Step 5: Verification Gate (No New Rendering Here)

This step is now a **checklist verification** only — no new rendering work happens here:

- [ ] `docs/initiatives/<initiative-slug>/backbone.md` exists and is final
- [ ] `docs/initiatives/<initiative-slug>/backbone.html` exists
- [ ] `docs/initiatives/<initiative-slug>/story-map.html` exists
- [ ] `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.md` exists and is final
- [ ] `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.html` exists

(All HTML rendering now happens immediately after its corresponding .md is finalized, not deferred to Step 5.)

---

## Step 6: Summary & Next Steps (Main Thread)

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
- [ ] Designer/Engineer reviews are visibly mentioned in the narrative (or if they had no issues, explicitly state that)
- [ ] Trio Reconciliation Notes section is present if any conflicts were resolved
- [ ] Functional AC Requirements use SHALL/SHOULD language
- [ ] Functional AC Scenarios use WHEN/THEN (Given implicit/optional)
- [ ] Every `.html` was rendered and written immediately after its `.md` was finalized (not deferred to a final batch step)
- [ ] `story-map.html` exists, with Features spanning the row-1 backbone header and each User Task as its own Step column underneath (not Features-as-columns with tasks listed inside)
- [ ] All parallel subagent fan-outs ran foreground, single-message, with all results present before reconciliation
