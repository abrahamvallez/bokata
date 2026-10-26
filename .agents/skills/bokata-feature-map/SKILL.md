---
name: bokata-feature-map
description: Generate a Features Backbone and Functional Acceptance Criteria using the Product Trio (PM, Designer, Engineer), written as one features.md (plus .html and a Patton story map) under the initiative folder. Accepts any input — a bokata pitch, a PRD, notes — and only asks about the gaps it leaves. Use it when the user wants a feature map, a backbone, a story map, or to break a large initiative into features.
---

Generate a Features Backbone (User Story Mapping) and Functional-Level Acceptance Criteria using the **Product Trio** — you act as the neutral coordinator, with PM, Designer, and Engineer reviewing from their lenses.

All outputs are saved under `<docs>/<initiative-slug>/` and include trio reconciliation notes where conflicts arose.

---

## Configuration

Read `.bokata.json` at the project root if it exists. Defaults:

```json
{ "docs": "docs/initiatives",
  "memory": { "constitution": "CONSTITUTION.md", "glossary": "CONTEXT.md" },
  "templates": { "features": null },
  "html": true,
  "story_map": true }
```

`<docs>` below is the `docs` value. `templates.features: null` means [resources/features-template.md](resources/features-template.md). `html: false` skips the `.html` renders; `story_map: false` skips `story-map.html`. The `constitution` is the file at `memory.constitution`; use the glossary's terms in every name.

---

## Input

Accept either:
1. **A bokata pitch** (`<docs>/<initiative-slug>/pitch.md`, from `bokata-shape`)
2. **Free-form initiative description** (what you want to build)
3. **Path to existing docs** (PRD, proposal, features-backbone.md, etc.)
4. **Combination** (reference existing + add new context)

---

## Step 1: Resolve Initiative Slug & Create Folder

1. Ask the user for the initiative name / title if not provided via argument (a pitch already has one)
2. Derive `<initiative-slug>` (kebab-case, max 50 chars, no spaces)
3. Create folder: `<docs>/<initiative-slug>/` (use `mkdir -p` via Bash)
4. Proceed with confirmed slug in subsequent steps

---

## Step 2: Consolidated Phase 0 Discovery (Interactive)

Instead of each skill asking its own Phase 0 questions, consolidate once here.

Ask clarifying questions that would affect **Feature scope, actors, flows, or business constraints** — merge the categories from:
- `bokata-feature-mapper`'s categories: Scope, Actors, Flows, Constraints
- Later AC phases: Business rules that affect Feature framing (e.g., "must curator-verify stories before public visibility" — is that a Feature boundary or an internal rule?)

If the input is already rich (pitch, existing backbone/spec provided), acknowledge that explicitly and ask **only about the gaps**:
> "You provided [pitch.md], which resolves Scope and Constraints. Skipping those categories; asking only about [missing categories]."

**A pitch's decisions are not re-opened here** — its chosen approach, no-gos and cuts are settled. If the user wants to change one of them, point them back to `bokata-shape`.

Produce one `## Discovery Context — Backbone` block with sections: Actors Confirmed / Scope Boundaries / Flow Clarifications / Constraints Confirmed / Assumptions.

**Save this in memory for Step 3** — it will be passed to reviewers.

---

## Step 3: Stage 1 — Backbone (Skill + Trio Review, You Coordinate)

### 3a. Invoke Feature Mapper Skill

Invoke the `bokata-feature-mapper` skill:
```
bokata-feature-mapper
Input: [pitch / initiative description / PRD / existing docs]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — the Discovery Context has been pre-resolved upstream. Proceed directly to Step 1 (Extract Requirements) through Step 6 (Organize Dependencies). Return the ## Features Backbone markdown section."
```

You receive the draft backbone.

### 3b. Trio Review via Parallel Subagents

**Execution constraint (critical):** Issue all three subagent calls together in a **single assistant message** (three tool-use blocks in one turn) — never separately. Use your harness's subagent tool (Task/Agent in Claude Code, `task` in OpenCode, `spawn_agents` in Codex, subagents in Cursor). Set **all three to foreground/blocking execution** (not background/async) so the turn does NOT end until all three results are in hand. Do not proceed, consolidate, or stop until every subagent has returned its result in this same exchange. If your harness has no subagents, run the three lenses yourself one after another, each as a separate pass, and say so.

Spawn three subagents in parallel to review the backbone:

**Task 1: bokata-product-manager**
```
subagent_type: bokata-product-manager
prompt: "Review this Features Backbone draft from the viability/value lens. You have:
- Draft backbone: [paste backbone]
- Discovery Context: [paste context]

Do NOT ask the user questions. If anything is ambiguous, state an assumption. Focus on: scope right-sizing, User Task granularity for value, dependency justification, missing value. Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off). Return your review in the format specified in your agent file."
```

**Task 2: bokata-product-designer**
```
subagent_type: bokata-product-designer
prompt: "Review this Features Backbone draft from the UX/UI design lens. You have:
- Draft backbone: [paste backbone]
- Discovery Context: [paste context]

Do NOT ask the user questions. Focus on: missing user-facing states, journey coherence, UI pattern consistency, custom component needs. Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off). Return your review in the format specified in your agent file."
```

**Task 3: bokata-product-engineer**
```
subagent_type: bokata-product-engineer
prompt: "Review this Features Backbone draft from the feasibility/technical-sustainability lens. You have:
- Draft backbone: [paste backbone]
- Discovery Context: [paste context]

Do NOT ask the user questions. Focus on: Feature boundary coupling, data model implications, technical risk, architecture sustainability. Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off). Return your review in the format specified in your agent file."
```

**Wait for all three to complete in this same turn.** Do not issue further instructions until you have all three results in hand.

### 3c. Reconcile Reviews (You Are the Neutral Coordinator)

You act as the **neutral coordinator** — you do not add a fourth opinion and you do not arbitrate product trade-offs yourself. Classify each finding from the PM, Designer, and Engineer reviews into one bucket (use each reviewer's `Type` tag, but verify it):

- **(a) Non-conflicting improvement** — incorporate directly into the backbone markdown.
- **(b) Factual / scope conflict** — decidable against an existing artifact (the input pitch/spec/PRD, the Discovery Context, or the project `constitution`). Resolve it deterministically by checking that artifact, apply the fix, and record a one-line entry in `## Trio Reconciliation Notes` citing the artifact. Do not ask the user.
- **(c) Genuine product trade-off** — a scope/UX/sustainability judgment with no ground truth in any artifact (e.g., Engineer: "split Feature A into two"; Designer: "keep as one for UX coherence"). This is the human's decision.

**Handling bucket (c):** collect all trade-offs first (never a per-conflict drip). For each, prepare the two positions (attributed to their lens), the one-sentence crux, and a **recommended default** grounded in the `constitution` / Fast Feedback Principle.
- **Interactive mode (default):** present all trade-offs as a single numbered decision point and wait for the user's choice before writing. Use your harness's question tool if it provides one (`AskUserQuestion` in Claude Code, `question` in OpenCode; one question per conflict; options = each lens position plus your recommended default, marked as recommended). If your harness has no such tool, present the same as a numbered plain-text prompt and wait for the reply. Apply the user's selections.
- **Non-interactive mode** (`--no-interactive` flag present, or a headless/automation run): do not block — apply the recommended default for each and record every trade-off in `## Trio Reconciliation Notes` with its two positions, the applied default, and a `⚠ flagged for human review` marker.

**System Task guard (critical):** If a reviewer finding describes system/backend behavior, do NOT default to adding it as a new standalone System Task. Apply the System Task trigger test from `bokata-feature-mapper`'s `methodology.md`: is this triggered by a direct user action already covered by an existing User Task? If yes — embed it as a note on that User Task's description instead. Only create a new standalone System Task if the finding describes a genuine autonomous workflow transition.

Produce the final backbone with (a) incorporated, (b) resolved-and-cited, and (c) resolved-by-user-or-default — all (b)/(c) outcomes captured in `## Trio Reconciliation Notes`.

---

## Step 4: Stage 2 — Functional Acceptance Criteria (Trio Contribution)

### 4a. Trio Contributes Rules from Their Lenses (Subagents, Parallel)

**Execution constraint (critical):** Issue all three subagent calls together in a **single assistant message** (three tool-use blocks in one turn) — never separately. Set **all three to foreground/blocking execution** (not background/async) so the turn does NOT end until all three results are in hand. Do not proceed, consolidate, or stop until every subagent has returned its result in this same exchange.

Spawn three subagents in parallel, each contributing Rules from their lens — they do NOT generate Scenarios themselves, only Rules:

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

### 4b. Consolidate & Invoke AC Skill (Interactive)

Read all three contributions. Merge them into a single enrichment block (equivalent to a pre-filled `## Discovery Context — Criteria`), de-duplicating overlapping Rules.

Invoke `bokata-acceptance-criteria`:
```
bokata-acceptance-criteria --functional
Input: [final backbone]
Enrichment: [consolidated Rules from PM/Designer/Engineer]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — it has been resolved upstream. Use the provided Discovery Context and Enrichment (consolidated Rules from the Product Trio). Proceed directly to Phase 1 (Input Analysis) through Phase 3 (Generate Output), using the --functional depth mode. Return the ## Acceptance Criteria (Functional) section."
```

You receive the functional ACs.

---

## Step 5: Write features.md & Render HTML

One file holds the backbone and its functional ACs, so a slice can be chosen from a single place:

1. **Write** `<docs>/<initiative-slug>/features.md` from the features template: the final reconciled backbone, the functional ACs of each User Task placed **under that User Task**, an empty `### Increment options` section per Feature (filled later by `bokata-slice`), and `## Trio Reconciliation Notes`.

2. **Render & Write** `<docs>/<initiative-slug>/features.html` (if `html` is true):
   - Using the [html-template.md](resources/html-template.md) conversion rules (markdown → semantic HTML)
   - Build title: `"{{INITIATIVE_NAME}} — Features"`
   - Build subtitle: `"User Story Mapping + Functional ACs, Trio-Reviewed"`
   - Convert Features, User Tasks, System Tasks, Requirements and Scenarios per the template's table
   - Footer: `"{{INITIATIVE_NAME}} Features | Generated [DATE] | Skill: bokata-feature-map | Source: [input description]"`

3. **Create & Render** `<docs>/<initiative-slug>/story-map.html` (if `story_map` is true):
   - Using the [story-map-template.md](resources/story-map-template.md) — **the addressable/column unit is the User Task (Step), not the Feature.** Do not build a `.map-column` per Feature with tasks listed inside it; that structure is wrong (see the template file's own warning about this).
   - Build title: `"{{INITIATIVE_NAME}} — Story Mapping"`
   - Build subtitle: `"Backbone (Features) → Steps (User Tasks) → Releases (Slices)"`
   - Row 1: render each Feature as a `.feature-header` spanning its own User Task count (`grid-column: span N`), ordered by backbone journey — this is a header only, it holds no cards
   - Row 2: render each User Task as its own `.step-card` column (`data-task-id="{{TASK_ID}}"`), in the same order as listed under its parent Feature
   - Row 3: give every Step column exactly one `.release-cell` placeholder ("Not yet sliced") — one per User Task, not one per Feature
   - Set `{{TOTAL_STEP_COUNT}}` = total User Tasks across all Features (the grid's column count)
   - Footer: `"{{INITIATIVE_NAME}} Story Mapping | Generated [DATE] | Skill: bokata-feature-map | Features: {{NUM_FEATURES}} | Steps: {{NUM_TASKS}} | Sliced: 0/{{NUM_FEATURES}}"`

---

## Step 6: Verification Gate (No New Rendering Here)

This step is a **checklist verification** only — no new rendering work happens here:

- [ ] `<docs>/<initiative-slug>/features.md` exists and is final (backbone + functional ACs + empty Increment options per Feature)
- [ ] `<docs>/<initiative-slug>/features.html` exists (if `html`)
- [ ] `<docs>/<initiative-slug>/story-map.html` exists (if `story_map`)

---

## Step 7: Summary & Next Steps (Main Thread)

Print to user:
```
## ✓ Feature Mapping Complete

**Initiative:** {{INITIATIVE_NAME}}
**Location:** <docs>/{{INITIATIVE_SLUG}}/

**Artifacts created:**
- features.md / .html ✅ — {{NUM_FEATURES}} Features, {{NUM_TASKS}} User Tasks, {{NUM_REQUIREMENTS}} Requirements, {{NUM_SCENARIOS}} Scenarios (functional depth)
- story-map.html ✅ — Patton-style board (Features spanning the backbone header, User Tasks as individual Step columns, release rows filled by each slice)

**Trio Review Notes:**
[If any reconciliation notes exist: "See features.md for [N] reconciliation notes flagged during PM/Designer/Engineer review."]

---

**Next step:** Run `bokata-slice {{INITIATIVE_SLUG}}` and pick 1–3 Features that make sense together. Suggested first slice: [the thinnest group of Features that makes the journey usable end to end].
```

---

## Quality Checks (Before Writing)

- [ ] Discovery Context is present and complete
- [ ] Final backbone identifies all Features in [Actor] [Verb] [Object] format
- [ ] All User Tasks are in [Verb] [Object] format (no Actor)
- [ ] **All System Tasks follow the workflow-transition test from methodology.md** (only autonomous state transitions remain standalone; all direct-user-action responses are embedded in User Task descriptions)
- [ ] **System Tasks use naming format `System Task {N}.{M}: [Verb] [Object]`** (with explicit Trigger field)
- [ ] **Features/User Tasks/System Tasks use correct heading levels** as in the features template (not bold text)
- [ ] Trio reviews are visibly mentioned in the narrative (or if they had no issues, explicitly state that)
- [ ] Trio Reconciliation Notes section is present if any conflicts were resolved
- [ ] Functional AC Requirements use SHALL/SHOULD language
- [ ] Functional AC Scenarios use WHEN/THEN (Given implicit/optional)
- [ ] Every `.html` was rendered and written immediately after its `.md` was finalized (not deferred to a final batch step)
- [ ] `story-map.html` exists, with Features spanning the row-1 backbone header and each User Task as its own Step column underneath (not Features-as-columns with tasks listed inside)
- [ ] All parallel subagent reviews were issued together and completed before reconciliation began
