---
name: "Bokata: Feature Map"
description: Generate a Features Backbone and Functional Acceptance Criteria using the Product Trio (PM, Designer, Engineer). Outputs as .md and .html under docs/initiatives/[name]/.
---

Generate a Features Backbone (User Story Mapping) and Functional-Level Acceptance Criteria using the **Product Trio** — Product Manager (lead), Designer, and Engineer reviewing and contributing from their lenses.

All outputs (.md + .html) are saved under `docs/initiatives/<initiative-slug>/`.

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
3. Create folder: `docs/initiatives/<initiative-slug>/` (use `mkdir -p`)
4. Proceed with confirmed slug in subsequent steps

---

## Step 2: Consolidated Phase 0 Discovery

Ask clarifying questions that would affect **Feature scope, actors, flows, or business constraints**:
- Scope, Actors, Flows, Constraints

If the input is already rich (existing backbone/spec provided), acknowledge that explicitly and skip resolved categories.

Produce one `## Discovery Context — Backbone` block with sections: Actors Confirmed / Scope Boundaries / Flow Clarifications / Constraints Confirmed / Assumptions.

---

## Step 3: Stage 1 — Backbone (Trio Review)

### 3a. Invoke Feature Mapper Skill

Invoke the `bokata-feature-mapper` skill:
```
$ bokata-feature-mapper
Input: [initiative description / PRD / existing docs]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — the Discovery Context has been pre-resolved upstream. Proceed directly to feature identification and User Task mapping. Return the ## Features Backbone markdown section."
```

You receive the draft backbone.

### 3b. Trio Review via Parallel Subagents

Spawn three subagents in parallel to review the backbone:

**Subagent 1: bokata-product-manager**
```
Review this Features Backbone draft from the viability/value lens. You have:
- Draft backbone: [paste backbone]
- Discovery Context: [paste context]

Do NOT ask the user questions. If anything is ambiguous, state an assumption. Focus on: scope right-sizing, User Task granularity for value, dependency justification, missing value.
```

**Subagent 2: bokata-product-designer**
```
Review this Features Backbone draft from the UX/UI design lens. You have:
- Draft backbone: [paste backbone]
- Discovery Context: [paste context]

Do NOT ask the user questions. Focus on: missing user-facing states, journey coherence, UI pattern consistency, custom component needs.
```

**Subagent 3: bokata-product-engineer**
```
Review this Features Backbone draft from the feasibility/technical-sustainability lens. You have:
- Draft backbone: [paste backbone]
- Discovery Context: [paste context]

Do NOT ask the user questions. Focus on: Feature boundary coupling, data model implications, technical risk, architecture sustainability.
```

Wait for all three to complete.

### 3c. Reconcile Reviews

Read all three outputs. For each finding:
- **Non-conflicting**: incorporate into the backbone markdown
- **Conflicting**: write a `## Trio Reconciliation Notes` block

Produce final `backbone.md` with trio review integrated.

---

## Step 4: Stage 2 — Functional Acceptance Criteria

### 4a. Trio Contributes Rules

Spawn three subagents in parallel, each contributing Rules from their lens:

**Subagent 1: bokata-product-manager**
```
Contribute business-rule Rules for this Features Backbone, from the viability/value lens. You have:
- Final backbone (reconciled): [paste]
- Discovery Context: [paste]

Do NOT ask the user questions. Generate Rules addressing: business rules, priority/launch-blocking vs deferred, value-triggering rules. Scope each Rule to a specific User Task.
```

**Subagent 2: bokata-product-designer**
```
Contribute UX/UI Rules for this Features Backbone, from the usability/craft lens. You have:
- Final backbone (reconciled): [paste]
- Discovery Context: [paste]

Do NOT ask the user questions. Generate Rules addressing: empty/loading/error states, interaction patterns, component reuse. Scope each Rule to a specific User Task.
```

**Subagent 3: bokata-product-engineer**
```
Contribute technical Rules for this Features Backbone, from the feasibility/sustainability lens. You have:
- Final backbone (reconciled): [paste]
- Discovery Context: [paste]

Do NOT ask the user questions. Generate Rules addressing: data model constraints, permission/access rules, concurrency rules, API contracts. Scope each Rule to a specific User Task.
```

Wait for all three to complete.

### 4b. Consolidate & Invoke AC Skill

Read all three contributions. Merge them into a single enrichment block, de-duplicating overlapping Rules.

Invoke the `bokata-acceptance-criteria` skill:
```
$ bokata-acceptance-criteria --functional
Input: [final backbone.md]
Enrichment: [consolidated Rules from PM/Designer/Engineer]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — it has been resolved upstream. Use the provided Discovery Context and Enrichment. Proceed directly to Phase 1 through Phase 3, using the --functional depth mode. Return the ## Acceptance Criteria (Functional) section."
```

You receive the functional ACs.

---

## Step 5: Write Outputs

1. **Write** `docs/initiatives/<initiative-slug>/backbone.md` (the final reconciled markdown)

2. **Render & Write** `docs/initiatives/<initiative-slug>/backbone.html`:
   - Using the `html-template.md` conversion rules from the command's resources directory
   - Build title: `"{{INITIATIVE_NAME}} — Features Backbone"`
   - Build subtitle: `"User Story Mapping + Trio-Reviewed"`
   - Footer: `"{{INITIATIVE_NAME}} Features Backbone | Generated [DATE] | Command: /bokata:feature-map | Source: [input description]"`

3. **Create & Render** `docs/initiatives/<initiative-slug>/story-map.html`:
   - Using the `story-map-template.md` from the command's resources directory
   - Row 1: render each Feature as a `.feature-header` spanning its User Task count
   - Row 2: render each User Task as its own `.step-card` column
   - Row 3: give every Step column exactly one `.release-cell` placeholder ("Not yet sliced")
   - Footer: `"{{INITIATIVE_NAME}} Story Mapping | Generated [DATE] | Command: /bokata:feature-map | Features: {{NUM_FEATURES}} | Steps: {{NUM_TASKS}} | Sliced: 0/{{NUM_FEATURES}}"`

4. **Write** `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.md` (the AC markdown)

5. **Render & Write** `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.html`:
   - Using the `html-template.md` conversion rules
   - Build title: `"{{INITIATIVE_NAME}} — Acceptance Criteria (Functional)"`
   - Footer: `"{{INITIATIVE_NAME}} Acceptance Criteria (Functional) | Generated [DATE] | Command: /bokata:feature-map | Depth: functional | Source: Features Backbone"`

---

## Step 6: Verification

- [ ] `docs/initiatives/<initiative-slug>/backbone.md` exists and is final
- [ ] `docs/initiatives/<initiative-slug>/backbone.html` exists
- [ ] `docs/initiatives/<initiative-slug>/story-map.html` exists
- [ ] `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.md` exists and is final
- [ ] `docs/initiatives/<initiative-slug>/acceptance-criteria-functional.html` exists

---

## Step 7: Summary

Print to user:
```
## ✓ Feature Mapping Complete

**Initiative:** {{INITIATIVE_NAME}}
**Location:** docs/initiatives/{{INITIATIVE_SLUG}}/

**Artifacts created:**
- backbone.md / .html ✅ — {{NUM_FEATURES}} Features, {{NUM_TASKS}} User Tasks
- acceptance-criteria-functional.md / .html ✅ — {{NUM_REQUIREMENTS}} Requirements, {{NUM_SCENARIOS}} Scenarios (functional depth)
- story-map.html ✅ — Patton-style board

**Next step:** Run `/bokata:slice-feature [feature name]` to decompose a Feature into a Walking Skeleton + Increments Backlog.
```
