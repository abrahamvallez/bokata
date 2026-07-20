---
name: "Bokata: Slice Feature"
description: Decompose a Feature (from an existing backbone) into a Walking Skeleton + Increments Backlog, with concrete-depth Acceptance Criteria per skeleton item/increment.
---

Decompose a Feature from an existing Features Backbone into a **Walking Skeleton + Increments Backlog**, with **concrete-depth Acceptance Criteria** using the **Product Trio** — coordinated by the neutral `bokata-product-coordinator`, with PM, Designer, and Engineer reviewing from their lenses.

All outputs (.md + .html) are saved under `docs/initiatives/<initiative-slug>/<feature-slug>/`.

---

## Step 1: Resolve Feature & Folders

1. Ask user for the Feature to slice if not provided via argument
2. Locate or ask for the initiative's `docs/initiatives/<initiative-slug>/backbone.md` + `acceptance-criteria-functional.md`
3. Derive `<feature-slug>` (kebab-case, max 50 chars)
4. Create folder: `docs/initiatives/<initiative-slug>/<feature-slug>/`

---

## Step 2: Consolidated Phase 0 Discovery

Ask clarifying questions about the **specific Feature being sliced**:
- Technical Clarity, Layer Ambiguity, Increment Scope, Dependencies, Constraints

Produce one `## Discovery Context — Slicer: [Feature Name]` block.

---

## Step 3: Stage 1 — Slicing (Coordinator Invokes Skill + Trio Review)

### 3a. Invoke Feature Slicer Skill

Invoke the `bokata-feature-slicer` skill:
```
$ bokata-feature-slicer
Input: [Feature name from backbone.md]
Backbone: [full backbone.md markdown]
Functional ACs: [acceptance-criteria-functional.md markdown for this Feature]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — the Discovery Context has been pre-resolved upstream. Proceed directly to Phase 1 through Phase 3. Return the Walking Skeleton and Increments Backlog sections."
```

You receive the draft slicing.

### 3b. Trio Review via Parallel Subagents

Spawn two subagents in parallel to review the slicing:

**Subagent 1: bokata-product-manager**
```
Review this Walking Skeleton + Increments Backlog for [Feature] from the value/viability lens. You have:
- Draft slicing: [paste Walking Skeleton + Increments]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Do NOT ask the user questions. Focus on: Is the skeleton truly minimum-viable-VALUE? Does each skeleton item ship observable value? Are Increments ordered by business impact? Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off).
```

**Subagent 2: bokata-product-designer**
```
Review this Walking Skeleton + Increments Backlog for [Feature] from the UX/UI design lens. You have:
- Draft slicing: [paste Walking Skeleton + Increments]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Do NOT ask the user questions. Focus on: Does the skeleton compose into a coherent minimal UI experience? Are missing states isolated to increments or essential to skeleton? Tag every finding with Severity (Critical|Suggested) and Type (factual/scope|trade-off).
```

Wait for both to complete.

### 3c. Reconcile Reviews (Neutral Coordinator)

You act as the **neutral coordinator** — you do not add a fourth opinion and you do not arbitrate product trade-offs yourself. Classify each finding from the PM and Designer reviews into one bucket (use each reviewer's `Type` tag, but verify it):

- **(a) Non-conflicting improvement** — incorporate directly into the slicing markdown.
- **(b) Factual / scope conflict** — decidable against an existing artifact (`backbone.md`, `acceptance-criteria-functional.md`, the Discovery Context, or the project `constitution`). Resolve it deterministically by checking that artifact, apply the fix, and record a one-line entry in `## Trio Reconciliation Notes` citing the artifact. Do not ask the user.
- **(c) Genuine product trade-off** — a value↔UX / value↔sustainability judgment with no ground truth in any artifact (e.g., PM: "defer Increment 3A"; Designer: "3A must ship in skeleton for coherent UX"). This is the human's decision.

**Handling bucket (c):** collect all trade-offs first (never a per-conflict drip). For each, prepare the two positions (attributed to their lens), the one-sentence crux, and a **recommended default** grounded in the `constitution` / Fast Feedback Principle.
- **Interactive `codex` session:** present all trade-offs as a single numbered decision point and wait for the user's choice before writing.
- **Headless / automated run** (`codex exec`, `spawn_agents`, CI): do not block — apply the recommended default for each and record every trade-off in `## Trio Reconciliation Notes` with its two positions, the applied default, and a `⚠ flagged for human review` marker.

Produce final `slicing.md` with (a) incorporated, (b) resolved-and-cited, and (c) resolved-by-user-or-default — all (b)/(c) outcomes captured in `## Trio Reconciliation Notes`.

---

## Step 4: Stage 2 — Concrete Acceptance Criteria

### 4a. Trio Contributes Rules Scoped per Skeleton Item / Increment

Spawn three subagents in parallel, each contributing Rules from their lens:

**Subagent 1: bokata-product-manager**
```
Contribute business-rule Rules for this [Feature] slicing, scoped per Walking Skeleton item and per Increment, from the viability/value lens. You have:
- Final slicing (reconciled): [paste]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Do NOT ask the user questions. For each Walking Skeleton item: priority/launch-blocking rules. For each Increment: the value unlock it enables.
```

**Subagent 2: bokata-product-designer**
```
Contribute UX/UI Rules for this [Feature] slicing, scoped per Walking Skeleton item and per Increment, from the usability/craft lens. You have:
- Final slicing (reconciled): [paste]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Do NOT ask the user questions. For each skeleton item: the specific UI states, component reuse, interaction patterns. For each Increment: the UX capability it unlocks.
```

**Subagent 3: bokata-product-engineer**
```
Contribute technical Rules for this [Feature] slicing, scoped per Walking Skeleton item and per Increment, from the feasibility/sustainability lens. You have:
- Final slicing (reconciled): [paste]
- Backbone + functional ACs: [paste for context]
- Discovery Context: [paste]

Do NOT ask the user questions. For each skeleton item: data model shape, API contracts, concurrency/permission guards. For each Increment: whether it can be built in isolation or if it reshapes skeleton choices.
```

Wait for all three to complete.

### 4b. Consolidate & Invoke AC Skill

Read all three contributions. Merge them into a single enrichment block, de-duplicating overlapping Rules and grouping by skeleton item / increment.

Invoke the `bokata-acceptance-criteria` skill:
```
$ bokata-acceptance-criteria --concrete
Input: [final slicing.md from Step 3c]
Enrichment: [consolidated Rules from PM/Designer/Engineer, grouped by skeleton item/increment]
Discovery Context: [from Step 2]
Instruction: "Skip your own Phase 0 discovery — it has been resolved upstream. Use the provided Discovery Context and Enrichment. Proceed directly to Phase 1 through Phase 3, using the --concrete depth mode. Group your output by Walking Skeleton items and Increments. Return the ## Acceptance Criteria (Concrete) section."
```

You receive the concrete ACs.

---

## Step 5: Write Outputs

1. **Write** `docs/initiatives/<initiative-slug>/<feature-slug>/slicing.md` (final reconciled markdown)

2. **Render & Write** `docs/initiatives/<initiative-slug>/<feature-slug>/slicing.html`:
   - Using the `html-template.md` conversion rules from the command's resources directory
   - Build title: `"[Feature Name] — Walking Skeleton + Increments Backlog"`
   - Build subtitle: `"Trio-Reviewed Feature Slicing"`
   - Footer: `"[Feature Name] Slicing | Generated [DATE] | Command: /bokata:slice-feature | Source: Backbone [initiative] + Functional ACs"`

3. **Write** `docs/initiatives/<initiative-slug>/<feature-slug>/acceptance-criteria-concrete.md` (the concrete AC markdown)

4. **Render & Write** `docs/initiatives/<initiative-slug>/<feature-slug>/acceptance-criteria-concrete.html`:
   - Using the `html-template.md` conversion rules
   - Build title: `"[Feature Name] — Acceptance Criteria (Concrete)"`
   - Footer: `"[Feature Name] Acceptance Criteria (Concrete) | Generated [DATE] | Command: /bokata:slice-feature | Depth: concrete | Source: Walking Skeleton + Trio Contributions"`

5. **Update Story Map**:
   - Read the existing `docs/initiatives/<initiative-slug>/story-map.html`
   - Parse `slicing.md`'s `**[User Task Name]**` tags to group items by User Task
   - For each tagged User Task, locate its column and replace the `.release-cell` placeholder with skeleton/increment cards
   - Leave every other Step's column untouched
   - Update footer to show current slicing progress
   - Write back to `docs/initiatives/<initiative-slug>/story-map.html`

---

## Step 6: Verification

- [ ] `docs/initiatives/<initiative-slug>/<feature-slug>/slicing.md` exists and is final
- [ ] `docs/initiatives/<initiative-slug>/<feature-slug>/slicing.html` exists
- [ ] `docs/initiatives/<initiative-slug>/<feature-slug>/acceptance-criteria-concrete.md` exists and is final
- [ ] `docs/initiatives/<initiative-slug>/<feature-slug>/acceptance-criteria-concrete.html` exists
- [ ] `docs/initiatives/<initiative-slug>/story-map.html` was updated (not recreated)

---

## Step 7: Summary

Print to user:
```
## ✓ Feature Slicing Complete

**Feature:** {{FEATURE_NAME}}
**Initiative:** {{INITIATIVE_NAME}}
**Location:** docs/initiatives/{{INITIATIVE_SLUG}}/{{FEATURE_SLUG}}/

**Artifacts created:**
- slicing.md / .html ✅ — {{NUM_SKELETON_ITEMS}} Walking Skeleton items, {{NUM_INCREMENTS}} Increments
- acceptance-criteria-concrete.md / .html ✅ — {{NUM_GHERKIN_BLOCKS}} Gherkin scenarios (concrete depth)
- story-map.html (updated) ✅ — {{FEATURE_NAME}}'s Step columns updated

**Trio Review Notes:**
[If any reconciliation notes exist: "See slicing.md for [N] reconciliation notes flagged during PM/Designer/Engineer review."]

**Next steps:**
1. Start implementing: Pick a Walking Skeleton item and use its Gherkin ACs.
2. Iterate by increment: As each item ships, move to the next.
3. Slice another feature: Run `/bokata:slice-feature [next feature]`.
```
