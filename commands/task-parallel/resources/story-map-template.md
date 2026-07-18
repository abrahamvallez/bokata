# Bokata Story Map Template (Patton-Style Board)

This file defines the **real Jeff Patton User Story Mapping structure** for bokata: the **Backbone** (Features) is distributed horizontally as a header row; within each Feature's span, its **Steps** (User Tasks) are distributed horizontally as individual sub-columns in narrative order; and **within each Step's own column**, release/priority tiers (Walking Skeleton, then Increments) are stacked **vertically**, highest priority nearest the header.

**Critical: the addressable unit is the User Task (Step) column, not the Feature.** A Feature is a *header that spans several Step columns* — it is never itself a column with tasks listed inside it as a list. If you catch yourself building `.map-column[data-feature-id]` as a container holding a list of task cards, that is the wrong structure — stop and re-read this file. (This template previously had exactly that bug; it produced a Feature-as-column / Tasks-as-list board that does not match Patton's model. Fixed — see git history / `docs/initiatives/real-tourism-mvp/story-map.html` for a verified correct reference implementation if you want to compare against a working example.)

Structurally distinct from `html-template.md` (which renders linear report-style documents).

---

## Visual Structure

```
┌───────────────────────────────────────┬───────────────────────┬───────────────────────────────────┐
│         Feature 1 (spans 3 Steps)      │   Feature 2 (spans 2)  │        Feature 3 (spans 2)         │  ← Backbone (Features), row 1
├────────────┬────────────┬─────────────┼────────────┬───────────┼──────────────┬──────────────────────┤
│  Step A    │  Step B    │  Step C     │  Step D    │  Step E   │  Step F      │  Step G              │  ← Steps (User Tasks), row 2 — ONE COLUMN EACH
├────────────┼────────────┼─────────────┼────────────┼───────────┼──────────────┼──────────────────────┤
│ Skeleton   │ Skeleton   │ Not sliced  │ Skeleton   │ Not       │ Not sliced   │ Not sliced           │  ← highest priority row (Walking Skeleton)
│ 1.a        │ 1.b        │             │ 2.a        │ sliced    │              │                      │
├────────────┼────────────┼─────────────┼────────────┼───────────┼──────────────┼──────────────────────┤
│ Increment  │            │             │ Increment  │           │              │                      │  ← lower priority, stacked below within
│ 1.c        │            │             │ 2.b        │           │              │                      │     the SAME Step's column
├────────────┼────────────┼─────────────┼────────────┼───────────┼──────────────┼──────────────────────┤
│ Increment  │            │             │            │           │              │                      │
│ 1.d        │            │             │            │           │              │                      │
└────────────┴────────────┴─────────────┴────────────┴───────────┴──────────────┴──────────────────────┘
```

Key structural rules:
- **Features are distributed horizontally** as a spanning header row (row 1) — width proportional to how many Steps they contain.
- **Within each Feature's span, its Steps are distributed horizontally**, one column per User Task, in narrative/journey order.
- **Within each Step's own column, increments are distributed vertically** by priority — the item closest to the header line is the Walking Skeleton pick for that Step; everything below it in the same column is a lower-priority increment for that *same* Step, not a different one.
- A Step with nothing sliced yet just shows "Not yet sliced" in its own column — it does NOT borrow or share a cell with a neighboring Step.

---

## Base HTML Shell & Styling

Use this base for all story-map renders:

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{TITLE}}</title>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #2d3748;
    background: #f7fafc;
  }

  @media (prefers-color-scheme: dark) {
    body {
      background: #1a202c;
      color: #e2e8f0;
    }
  }

  header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 3rem 2rem;
    text-align: center;
  }

  header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  header p {
    font-size: 1.1rem;
    opacity: 0.95;
  }

  .container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .story-map {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow-x: auto;
    margin: 2rem 0;
  }

  @media (prefers-color-scheme: dark) {
    .story-map {
      background: #2d3748;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
  }

  /* Grid: one column PER STEP (User Task), not per Feature. Features are row-1 headers
     that span N columns (N = how many Steps/User Tasks they contain) via grid-column: span N,
     relying on CSS Grid auto-placement to tile them left-to-right in narrative order. */
  .map-grid {
    display: grid;
    grid-auto-rows: min-content;
    flex: 1;
  }

  .priority-axis {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 0.5rem;
    font-weight: 700;
    font-size: 0.85rem;
    color: #764ba2;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border-right: 2px dashed #cbd5e0;
    position: sticky;
    left: 0;
    background: white;
    z-index: 2;
  }
  .priority-axis::before { content: "▼ decreasing priority"; }

  @media (prefers-color-scheme: dark) {
    .priority-axis {
      color: #d8b4fe;
      background: #2d3748;
      border-right-color: #4a5568;
    }
  }

  /* Row 1: Feature headers (Backbone) — one div per Feature, grid-row:1, grid-column: span N.
     Do NOT give this element a data-feature-id used for skeleton/increment targeting — it is a
     header only. The addressable unit for slicing updates is the Step column below (.step-card). */
  .feature-header {
    grid-row: 1;
    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    color: white;
    padding: 0.85rem 0.75rem;
    font-weight: 700;
    font-size: 0.95rem;
    border: 1px solid white;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .feature-header .fid {
    font-size: 0.7rem;
    font-weight: 500;
    opacity: 0.9;
    font-family: 'Monaco','Menlo',monospace;
  }
  .feature-header .priority-badge {
    align-self: flex-start;
    padding: 0.15rem 0.5rem;
    border-radius: 10px;
    font-size: 0.65rem;
    font-weight: 700;
    background: rgba(255,255,255,0.25);
  }

  /* Row 2: Steps (User Tasks) — ONE COLUMN EACH, grid-row:2, auto-placed one per grid column.
     This IS the addressable unit: data-task-id lives here, and is what /bokata:slice-feature
     targets when replacing "Not yet sliced" with real skeleton/increment cards. */
  .step-card {
    grid-row: 2;
    background: #eef1fd;
    border: 1px solid #c9d2f7;
    border-bottom: 4px solid #667eea;
    padding: 0.65rem 0.6rem;
    font-size: 0.8rem;
    line-height: 1.35;
    min-height: 78px;
  }

  @media (prefers-color-scheme: dark) {
    .step-card {
      background: rgba(102,126,234,0.12);
      border-color: #4c51bf;
      border-bottom-color: #a78bfa;
      color: #e2e8f0;
    }
  }

  /* Rows 3+: release/priority tiers, stacked VERTICALLY within each Step's own column.
     Row 3 = highest priority (Walking Skeleton once sliced). Additional rows below it
     (4, 5, ...) = lower-priority increments for that SAME Step's column — never a
     different Step's column. Before slicing, every column just shows one placeholder. */
  .release-cell {
    grid-row: 3;
    background: #fffbea;
    border: 1px solid #f5e6a8;
    padding: 0.6rem;
    font-size: 0.75rem;
    font-style: italic;
    color: #92702a;
    text-align: center;
  }

  @media (prefers-color-scheme: dark) {
    .release-cell {
      background: rgba(240,180,41,0.1);
      border-color: rgba(240,180,41,0.3);
      color: #f0b429;
    }
  }

  /* Same visual language as .release-cell but used once a Step has been sliced: the
     Walking Skeleton pick for that Step (grid-row:3, nearest the header = highest priority). */
  .skeleton-item-card {
    grid-row: 3;
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-left: 4px solid #48bb78;
    padding: 0.6rem;
    font-size: 0.78rem;
    line-height: 1.4;
    color: #22543d;
  }

  @media (prefers-color-scheme: dark) {
    .skeleton-item-card {
      background: rgba(72, 187, 120, 0.12);
      border-color: #4a5568;
      border-left-color: #81e6d9;
      color: #a7f3d0;
    }
  }

  /* Increments for a Step stack below its skeleton item in the SAME column, grid-row 4, 5, ...
     ordered by priority — set explicit grid-row per card when populating (see Slice-Feature
     Update Algorithm below); do not let them auto-flow into a neighboring Step's column. */
  .increment-card {
    background: white;
    border: 1px solid #f5d7a8;
    border-left: 4px solid #ed8936;
    padding: 0.6rem;
    font-size: 0.78rem;
    line-height: 1.4;
    color: #7c2d12;
  }

  @media (prefers-color-scheme: dark) {
    .increment-card {
      background: rgba(0,0,0,0.2);
      border-left-color: #fbd38d;
      color: #fed7aa;
    }
  }

  .increment-id {
    font-weight: 600;
    display: block;
    margin-bottom: 0.25rem;
  }

  .increment-description {
    font-size: 0.85rem;
  }

  /* System Tasks (autonomous workflow transitions, not Steps — see methodology.md) are NOT
     Step columns. If a Feature has any, render them as a footnote spanning that Feature's
     own columns, positioned in a row below the release tiers — never as their own Step column. */
  .system-tasks-note {
    background: rgba(0,0,0,0.03);
    border: 1px solid #e2e8f0;
    padding: 0.6rem 0.75rem;
    font-size: 0.72rem;
    line-height: 1.4;
  }

  @media (prefers-color-scheme: dark) {
    .system-tasks-note {
      background: rgba(0,0,0,0.2);
      border-color: #4a5568;
      color: #cbd5e0;
    }
  }

  footer {
    text-align: center;
    padding: 2rem;
    color: #718096;
    font-size: 0.9rem;
  }

  @media (prefers-color-scheme: dark) {
    footer {
      color: #a0aec0;
    }
  }
</style>
</head>
<body>

<header>
  <h1>{{TITLE}}</h1>
  <p>{{SUBTITLE}}</p>
</header>

<div class="container">
  <div class="legend">
    <div class="legend-item"><span class="swatch activity"></span> Backbone — Features (Activities)</div>
    <div class="legend-item"><span class="swatch step"></span> Steps — User Tasks, in narrative order within each Feature</div>
    <div class="legend-item"><span class="swatch release"></span> Releases — increments per Step, stacked top-to-bottom by priority (highest = Walking Skeleton)</div>
  </div>
  <div class="story-map">
    <div class="priority-axis"></div>
    <div class="map-grid" style="grid-template-columns: repeat({{TOTAL_STEP_COUNT}}, minmax(150px, 1fr));">
      {{BODY}}
    </div>
  </div>
</div>

<footer>
  {{FOOTER_META}}
</footer>

</body>
</html>
```

Add this small legend block to the `<style>` (alongside the rest — omitted above for brevity, include it verbatim):
```css
.legend { display: flex; gap: 1.5rem; flex-wrap: wrap; margin: 0 0 1rem 0; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 0.85rem; }
@media (prefers-color-scheme: dark) { .legend { background: #2d3748; box-shadow: 0 2px 8px rgba(0,0,0,0.3); } }
.legend-item { display: flex; align-items: center; gap: 0.5rem; }
.swatch { width: 14px; height: 14px; border-radius: 3px; flex-shrink: 0; }
.swatch.activity { background: #ec4899; }
.swatch.step { background: #667eea; }
.swatch.release { background: #f0b429; }
.story-map { display: flex; } /* overrides the earlier block-level .story-map rule so the priority-axis sits beside the grid, not above it */
```

`{{TOTAL_STEP_COUNT}}` = the sum of User Tasks across every Feature (e.g. 40 for a 7-Feature, 40-task backbone) — this is the total number of grid columns, since one column = one Step, not one Feature.

---

## Column DOM Structure (Critical for Slice-Feature Updates)

**The addressable unit is the Step (User Task) column — `data-task-id` — never the Feature.** A Feature is only a spanning header div; it holds no tasks or cards itself.

Build the grid as three (or more) DOM passes, all children of the same `.map-grid` container, positioned purely by `grid-row` / `grid-column` (CSS Grid auto-placement fills left-to-right within a row, so as long as items appear in backbone journey order within each pass, they land in the right column automatically):

```html
<!-- PASS 1 (row 1): one div per FEATURE, spanning its Step count. Auto-placed left-to-right. -->
<div class="feature-header" style="grid-column: span 2;">
  Feature 1: Tourist Opts Into Location Services
  <span class="fid">RTMVP-FEAT-001</span>
  <span class="priority-badge">Critical MVP</span>
</div>
<!-- ...one .feature-header per Feature, each with its own span count, in journey order... -->

<!-- PASS 2 (row 2): one div per STEP (User Task) — this is the real column unit.
     data-task-id is what /bokata:slice-feature will later select to update. -->
<div class="step-card" data-task-id="RTMVP-TASK-001">Enable geolocation permissions on first launch</div>
<div class="step-card" data-task-id="RTMVP-TASK-002">Verify location is active</div>
<!-- ...one .step-card per User Task, in the SAME order as the backbone lists them under each Feature... -->

<!-- PASS 3 (row 3+): release tier, one per Step's column, stacked vertically by priority.
     Before slicing, every Step gets exactly one placeholder in row 3. -->
<div class="release-cell">Not yet sliced</div>
<div class="release-cell">Not yet sliced</div>
<!-- ...one .release-cell per Step, same order as pass 2, so each lands under its own Step column... -->
```

After `/bokata:slice-feature` has run for a Feature, that Feature's Step columns get their placeholder(s) replaced in place (see Update Algorithm below):

```html
<!-- A sliced Step's column: skeleton item at row 3 (highest priority, nearest the header),
     increments stacked below it in the SAME column at rows 4, 5, ... -->
<div class="skeleton-item-card" data-task-id="RTMVP-TASK-001" style="grid-column: 1;">
  <strong>1.a: Basic permission prompt on app launch</strong><br>
  <small>Simple native iOS/Android permission dialog, skip option leads to offline browsing</small>
</div>
<div class="increment-card" style="grid-row: 4; grid-column: 1;">
  <div class="increment-id">1.1: Re-enable location after skip</div>
  <div class="increment-description">User can grant permission from settings screen if skipped initially</div>
</div>
<div class="increment-card" style="grid-row: 5; grid-column: 1;">
  <div class="increment-id">1.2: Location privacy disclosure</div>
  <div class="increment-description">Add privacy statement explaining data collection (GDPR compliance)</div>
</div>
```

Note the explicit `grid-column` on sliced cards: once a column has more than one card stacked vertically (skeleton + increments), you can no longer rely on row-scoped auto-placement alone for that column — pin `grid-column` to the Step's numeric column position (1-indexed, left to right across the *entire* grid, not per-Feature) so increments 2+ land directly under their own Step and not the next one.

If a Feature has System Tasks (autonomous transitions — see methodology.md), they are not Steps and get no column. Render them as one `.system-tasks-note` div spanning that Feature's own column range, placed in a row below the release tiers.

---

## Markdown→HTML Conversion Rules

When building the story-map HTML from `backbone.md` (and later `slicing.md`), use these mappings:

| Source (Markdown)              | Target (HTML)                                 | Notes |
|------------------------------|--------------------------------------------|-------|
| `## Features Backbone`        | (Signals: create story-map structure from Features below) | Not rendered directly; used to parse Features |
| `#### Feature: [Actor] [Verb] [Object]` (+ ID comment) | `.feature-header` div, `grid-row: 1`, `grid-column: span N` | N = that Feature's User Task count; auto-placed in backbone journey order — this is a header, NOT a container |
| `##### User Task: [Verb] [Object]` (+ Task ID comment) | `.step-card` div, `grid-row: 2`, `data-task-id="{{TASK_ID}}"` | One column per User Task, in the same order as under its parent Feature — **this is the addressable unit for slicing updates** |
| `## 💀 Walking Skeleton` (from slicing.md) | `.skeleton-item-card`, `grid-row: 3`, matched to its Step by `**[User Task Name]**` tag (per `bokata-feature-slicer`'s output format) | Replaces that Step's `.release-cell` placeholder only |
| `## 🏗️ Increments Backlog` (from slicing.md) | `.increment-card`, `grid-row: 4, 5, ...`, matched to its Step the same way | Stacked below the skeleton item in that Step's own column, ordered by priority |
| System Tasks (if any, per methodology.md) | `.system-tasks-note` footnote, spanning the Feature's column range | Not a Step column — System Tasks are autonomous transitions, not user-facing steps |
| Feature dependency info (if present) | Optional legend/footnote below the grid | Display critical/recommended/optional path if inferred from trio notes |

---

## Slice-Feature Update Algorithm (In-Place Modification)

When `/bokata:slice-feature [Feature]` completes:

1. **Read** the existing `docs/initiatives/<slug>/story-map.html`
2. **Parse `slicing.md`** for its `**[User Task Name]**` tags (this tagging is already required of `bokata-feature-slicer`'s output — see its Output Checklist: "Backlog grouped by User Task", "All items use correct tag format") — group Walking Skeleton items and Increments by which User Task they belong to
3. **For each tagged User Task**, locate its column: `document.querySelector('.step-card[data-task-id="TASK_ID"]')` and find that column's numeric grid position (its column index within the full grid, not per-Feature)
4. **Replace** that Step's `.release-cell` placeholder with a `.skeleton-item-card` (`grid-row: 3`, same `grid-column` as the Step) for its Walking Skeleton item, then append `.increment-card` divs below it (`grid-row: 4, 5, ...`, same `grid-column`) for its Increments, ordered by priority
5. **Preserve every other Step's column untouched** — including other Steps within the *same* Feature that this slicing pass didn't address; a Feature is not an atomic update unit, its Steps are
6. **Write** back to the same file (same filename = Artifact tool will detect and update, not create new)
7. **Re-publish** via Artifact tool with the same file path

Pseudo-code:
```javascript
const soup = parse(existing_html);
const taskGroups = parseSlicingByUserTaskTag(slicing_md); // { "Task Name": { skeleton: [...], increments: [...] } }

for (const [taskName, items] of Object.entries(taskGroups)) {
  const taskId = resolveTaskIdFromBackbone(taskName); // cross-reference backbone.md's Task ID comment
  const stepCard = soup.select_one(`.step-card[data-task-id="${taskId}"]`);
  const columnIndex = getGridColumnIndex(stepCard); // this Step's absolute column position in the grid

  const placeholder = soup.select_one(`.release-cell[data-task-id="${taskId}"]`); // or positionally adjacent to stepCard
  const skeletonCard = buildSkeletonItemCard(items.skeleton, columnIndex); // grid-row:3, grid-column:columnIndex
  placeholder.replace_with(skeletonCard);

  items.increments.forEach((inc, i) => {
    soup.append(buildIncrementCard(inc, columnIndex, /* grid-row */ 4 + i));
  });
}
// Every .step-card NOT in taskGroups keeps its original .release-cell "Not yet sliced" — do not touch it.

write_and_republish(soup.to_html());
```

---

## Template Placeholders

- `{{TITLE}}`: Page title (e.g., "Real Tourism MVP — Story Mapping")
- `{{SUBTITLE}}`: Tagline (e.g., "Backbone (Features) → Steps (User Tasks) → Releases (Increments, by priority)")
- `{{BODY}}`: Complete set of `.feature-header`, `.step-card`, and `.release-cell`/`.skeleton-item-card`/`.increment-card` divs described above, in the three-pass DOM order
- `{{TOTAL_STEP_COUNT}}`: Sum of User Tasks across every Feature — sets the grid's total column count
- `{{FOOTER_META}}`: Generated footer (e.g., "Real Tourism MVP Story Mapping | Generated 2026-07-16 | Features: 7 | Steps: 40 | Sliced: 3/7")

---

## Example Footer Generation

```
Real Tourism MVP Story Mapping | Generated 2026-07-16 | 7 Features | 40 Steps | Sliced: 3/7 | Command: /bokata:feature-map → /bokata:slice-feature
```

---

## Notes for Orchestrator Implementation

- **Initial Creation** (in `/bokata:feature-map` Step 3c):
  - Row 1: one `.feature-header` per Feature, spanning its Step count, in journey order
  - Row 2: one `.step-card` per User Task (with `data-task-id`), auto-placed under its parent Feature's span
  - Row 3: every Step gets a `.release-cell` placeholder ("Not yet sliced") — one per Step, not one per Feature
  - Footer shows "Sliced: 0/N" (N = Feature count)

- **Incremental Updates** (in `/bokata:slice-feature`):
  - Only the Step columns (`data-task-id`) tagged in that run's `slicing.md` are modified — a single slicing pass may touch some but not all Steps within the sliced Feature
  - Untouched Steps — in the sliced Feature or any other — keep their original `.release-cell` placeholder
  - Footer updates to show "Sliced: N/M" as more Features are sliced (a Feature counts as "sliced" once at least one of its Steps has a real skeleton/increment card — not necessarily all of them)
  - Multiple invocations of `slice-feature` on different Features accumulate in the same file without conflict, since each only ever touches its own Steps' columns

---

## Dark Mode Support

All colors have `@media (prefers-color-scheme: dark)` overrides. No extra work needed — browser's dark-mode toggle automatically applies.
