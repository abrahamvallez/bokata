# Bokata Story Map Template — Dashboard (Patton-Style Board, v3)

This file defines the **real Jeff Patton User Story Mapping structure** for bokata: the
**Backbone** (Features) is distributed horizontally as a header row; within each Feature's span,
its **Steps** (User Tasks) are distributed horizontally as individual sub-columns in narrative
order; and **within each Step's own column**, release/priority tiers (Walking Skeleton, then
Increments) are stacked **vertically**, highest priority nearest the header. Below the increments, the **bites** the slice has not built
yet wait as muted, dashed cards (must-have first).

On top of the board, v3 adds the **initiative dashboard layer**: per-card state, a "next step"
banner, progress counters, the **bites still in each slice's backlog** (cards below the
increments) and three pieces of vanilla interactivity (Feature focus, card expansion, hide-done). This is the only HTML artifact bokata writes; `features.md` and
`slices/*.md` stay the source of truth and this file is always derived from them.

**Critical: the addressable unit is the User Task (Step) column, not the Feature.** A Feature is a
*header that spans several Step columns* — it is never itself a column with tasks listed inside it
as a list. If you catch yourself building `.map-column[data-feature-id]` as a container holding a
list of task cards, that is the wrong structure — stop and re-read this file.

---

## Visual Structure

```
┌───────────────────────────────────────┬───────────────────────┬───────────────────────────────────┐
│         Feature 1 (spans 3 Steps)      │   Feature 2 (spans 2)  │        Feature 3 (spans 2)         │  ← Backbone (Features), row 1
├────────────┬────────────┬─────────────┼────────────┬───────────┼──────────────┬──────────────────────┤
│  Step A    │  Step B    │  Step C     │  Step D    │  Step E   │  Step F      │  Step G              │  ← Steps (User Tasks), row 2 — ONE COLUMN EACH
├────────────┼────────────┼─────────────┼────────────┼───────────┼──────────────┼──────────────────────┤
│ Skeleton   │ Skeleton   │ Not sliced  │ Skeleton   │ Not       │ Not sliced   │ Not sliced           │  ← highest priority row (Walking Skeleton)
│ 1.a ✓      │ 1.b ●      │             │ 2.a ○      │ sliced    │              │                      │
├────────────┼────────────┼─────────────┼────────────┼───────────┼──────────────┼──────────────────────┤
│ Increment  │            │             │ Increment  │           │              │                      │  ← lower priority, stacked below within
│ 1.c ○      │            │             │ 2.b ○      │           │              │                      │     the SAME Step's column
├────────────┼────────────┼─────────────┼────────────┼───────────┼──────────────┼──────────────────────┤
│ ┄ Bite F1-a │ ┄ Bite F1-c│             │ ┄ Bite F2-a │           │              │                      │  ← bites left in the backlog (dashed),
│ ┄ Bite F1-b │            │             │            │           │              │                      │     below the increments, same column
└────────────┴────────────┴─────────────┴────────────┴───────────┴──────────────┴──────────────────────┘
   ✓ done      ● building    ○ planned     ┄ bite (not built)
```

Key structural rules:
- **Features are distributed horizontally** as a spanning header row (row 1) — width proportional to how many Steps they contain.
- **Within each Feature's span, its Steps are distributed horizontally**, one column per User Task, in narrative/journey order.
- **Within each Step's own column, increments are distributed vertically** by priority — the item closest to the header line is the Walking Skeleton pick for that Step; everything below it in the same column is a lower-priority increment for that *same* Step, not a different one.
- Every card carries a small **badge in its bottom-right corner** saying where it belongs: `S02 · Inc 2`, or `S02 · Backlog` for a bite.
- **Bites** (the slice's untaken backlog) sit below the increments of the Step column of their first option; they are drawn, never counted as increments.
- A Step with nothing sliced yet just shows "Not yet sliced" in its own column — it does NOT borrow or share a cell with a neighboring Step.

---

## Base HTML Shell & Styling

Use this base for all story-map renders. Keep every block verbatim; the `state-*` classes, the
banner, the counters, the toolbar and the script at the end are what make it a dashboard.

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="bokata-story-map" content="v3">
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
    padding: 2.5rem 2rem 2rem;
    text-align: center;
  }

  header h1 {
    font-size: 2.25rem;
    margin-bottom: 0.35rem;
  }

  header p {
    font-size: 1.05rem;
    opacity: 0.95;
  }

  .counters {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 1rem;
  }

  .counter {
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 999px;
    padding: 0.2rem 0.8rem;
    font-size: 0.8rem;
  }

  .counter strong {
    font-size: 0.9rem;
  }

  .container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
  }

  /* ——— Next step banner ——— */
  .next-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin: 0 0 1rem 0;
    padding: 0.75rem 1rem;
    background: #fffbeb;
    border: 1px solid #f6e05e;
    border-left: 5px solid #d69e2e;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #744210;
  }

  .next-banner[hidden] { display: none; }

  .next-label {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: #d69e2e;
    color: white;
    border-radius: 999px;
    padding: 0.1rem 0.55rem;
  }

  .next-link {
    margin-left: auto;
    color: #744210;
    font-weight: 600;
    white-space: nowrap;
  }

  @media (prefers-color-scheme: dark) {
    .next-banner {
      background: rgba(246, 224, 94, 0.1);
      border-color: rgba(246, 224, 94, 0.35);
      border-left-color: #f6e05e;
      color: #fefcbf;
    }
    .next-link { color: #fefcbf; }
  }

  /* ——— Legend + toolbar ——— */
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin: 0 0 1rem 0;
  }

  .legend { display: flex; gap: 1.25rem; flex-wrap: wrap; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 0.85rem; flex: 1; }
  @media (prefers-color-scheme: dark) { .legend { background: #2d3748; box-shadow: 0 2px 8px rgba(0,0,0,0.3); } }
  .legend-item { display: flex; align-items: center; gap: 0.5rem; }
  .swatch { width: 14px; height: 14px; border-radius: 3px; flex-shrink: 0; }
  .swatch.activity { background: #ec4899; }
  .swatch.step { background: #667eea; }
  .swatch.release { background: #f0b429; }
  .swatch.done { background: #48bb78; }
  .swatch.building { background: #ed8936; }
  .swatch.bite { background: transparent; border: 2px dashed #a0aec0; }

  .filter {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.6rem 0.9rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    font-size: 0.85rem;
    white-space: nowrap;
  }

  @media (prefers-color-scheme: dark) {
    .filter { background: #2d3748; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  }

  body.hide-done .state-done { display: none; }

  /* ——— Board ——— */
  .story-map {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow-x: auto;
    margin: 0 0 2rem 0;
    display: flex;
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
     Documents a header only; data-feature-id here is for focus highlighting. */
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
    cursor: pointer;
    transition: opacity 0.15s ease;
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
     This IS the addressable unit: data-task-id lives here, and is what bokata-render targets. */
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
     (4, 5, ...) = lower-priority increments for that SAME Step's column. */
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

  .skeleton-item-card {
    grid-row: 3;
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-left: 4px solid #48bb78;
    padding: 0.6rem;
    font-size: 0.78rem;
    line-height: 1.4;
    color: #22543d;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }

  @media (prefers-color-scheme: dark) {
    .skeleton-item-card {
      background: rgba(72, 187, 120, 0.12);
      border-color: #4a5568;
      border-left-color: #81e6d9;
      color: #a7f3d0;
    }
  }

  .increment-card {
    background: white;
    border: 1px solid #f5d7a8;
    border-left: 4px solid #ed8936;
    padding: 0.6rem;
    font-size: 0.78rem;
    line-height: 1.4;
    color: #7c2d12;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }

  @media (prefers-color-scheme: dark) {
    .increment-card {
      background: rgba(0,0,0,0.2);
      border-left-color: #fbd38d;
      color: #fed7aa;
    }
  }

  /* Scope badge: where a card belongs, in its bottom-right corner — "S02 · Inc 2" for the skeleton and
     increment cards, "S02 · Backlog" for a bite still waiting. S<nn> = the slice, so cards of different
     slices stay tellable apart. Written by bokata-render; state-sync never changes it. */
  .skeleton-item-card, .increment-card, .bite-card { position: relative; padding-bottom: 1.7rem; }
  .scope-badge {
    position: absolute;
    right: 0.4rem;
    bottom: 0.35rem;
    padding: 0.05rem 0.45rem;
    border: 1px solid currentColor;
    border-radius: 999px;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    white-space: nowrap;
    opacity: 0.75;
    pointer-events: none;
  }
  .bite-card .scope-badge { border-style: dashed; }

  /* Bites: INVEST groups of options still in the slice's backlog. Not built, so muted and dashed;
     must-have is solid-looking, ~nice-to-have is lighter, deferred is greyest. */
  .bite-card {
    background: transparent;
    border: 1px dashed #a0aec0;
    border-left: 4px dashed #667eea;
    padding: 0.55rem 0.6rem;
    font-size: 0.75rem;
    line-height: 1.4;
    color: #4a5568;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }
  .bite-card .bite-head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.4rem; margin-bottom: 0.2rem; }
  .bite-card .bite-id { font-family: 'Monaco','Menlo',monospace; font-size: 0.65rem; opacity: 0.8; }
  .bite-card .bite-tag { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
  .bite-card .bite-title { font-weight: 600; }
  .bite-card .bite-deps { margin-top: 0.2rem; font-size: 0.68rem; opacity: 0.75; }
  .bite-card.bite-nice { border-left-color: #a0aec0; opacity: 0.8; }
  .bite-card.bite-deferred { border-left-color: #cbd5e0; opacity: 0.55; font-style: italic; }

  @media (prefers-color-scheme: dark) {
    .bite-card { border-color: #718096; border-left-color: #a78bfa; color: #cbd5e0; }
    .bite-card.bite-nice { border-left-color: #718096; }
    .bite-card.bite-deferred { border-left-color: #4a5568; }
    .swatch.bite { border-color: #718096; }
  }

  /* ——— State layer (class toggled by bokata-render, label drawn from it) ——— */
  .card-title {
    font-weight: 600;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.4rem;
    margin-bottom: 0.25rem;
  }

  .state-done > .card-title { color: #276749; }
  .state-done > .card-title::after { content: "✓ done"; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.85; white-space: nowrap; }
  .state-building > .card-title { color: #975a16; }
  .state-building > .card-title::after { content: "● building"; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.85; white-space: nowrap; }
  .state-planned > .card-title { color: inherit; opacity: 0.9; }
  .state-planned > .card-title::after { content: "○ planned"; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.6; white-space: nowrap; }

  .state-done { background: #f0fff4; border-color: #9ae6b4; border-left-color: #48bb78; }
  .state-building { border-left-color: #ed8936; box-shadow: inset 0 0 0 1px rgba(237, 137, 54, 0.25); }

  .increment-description { font-size: 0.85rem; }

  .steps-badge {
    font-size: 0.62rem;
    font-weight: 700;
    color: #718096;
    white-space: nowrap;
  }
  .steps-badge::after { content: attr(data-done) "/" attr(data-total); }
  .steps-badge:not([data-total]) { display: none; }

  .card-details {
    margin-top: 0.4rem;
    padding-top: 0.35rem;
    border-top: 1px dashed currentColor;
    font-size: 0.72rem;
  }
  .card-details ul { padding-left: 1rem; }
  .card-details a { color: inherit; font-weight: 600; }

  @media (prefers-color-scheme: dark) {
    .state-done { background: rgba(72, 187, 120, 0.1); border-color: #4a5568; border-left-color: #81e6d9; }
    .state-done > .card-title { color: #9ae6b4; }
    .state-building > .card-title { color: #fbd38d; }
    .steps-badge { color: #a0aec0; }
  }

  /* ——— Focus mode ——— */
  .is-dimmed { opacity: 0.22; }
  .is-focused { box-shadow: 0 0 0 2px #667eea inset; }

  /* System Tasks (autonomous workflow transitions) are NOT Step columns. Footnote spanning
     that Feature's own columns, in a row below the release tiers. */
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
  <div class="counters">
    <span class="counter"><strong>{{DONE_INCREMENTS}}</strong>/{{TOTAL_INCREMENTS}} increments</span>
    <span class="counter"><strong>{{DONE_STEPS}}</strong>/{{TOTAL_STEPS}} steps</span>
    <span class="counter"><strong>{{DONE_SLICES}}</strong>/{{TOTAL_SLICES}} slices</span>
    <span class="counter"><strong>{{BITES_LEFT}}</strong> bites left</span>
  </div>
</header>

<div class="container">
  <div class="next-banner" id="next-banner"{{NEXT_HIDDEN}}>
    <span class="next-label">Next</span>
    <span class="next-text">{{NEXT_TEXT}}</span>
    <a class="next-link" href="{{NEXT_LINK}}">open slice</a>
  </div>

  <div class="toolbar">
    <div class="legend">
      <div class="legend-item"><span class="swatch activity"></span> Backbone — Features</div>
      <div class="legend-item"><span class="swatch step"></span> Steps — User Tasks</div>
      <div class="legend-item"><span class="swatch release"></span> Releases — by priority</div>
      <div class="legend-item"><span class="swatch done"></span> done</div>
      <div class="legend-item"><span class="swatch building"></span> building</div>
      <div class="legend-item"><span class="swatch bite"></span> Bites — still in the backlog</div>
    </div>
    <label class="filter"><input type="checkbox" id="hide-done"> Hide done</label>
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

<script>
(function () {
  var focused = null;

  function applyFocus(id) {
    var nodes = document.querySelectorAll('.feature-header, .step-card, .skeleton-item-card, .increment-card, .bite-card');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var mine = el.getAttribute('data-feature-id');
      el.classList.toggle('is-dimmed', !!id && mine !== id);
      el.classList.toggle('is-focused', !!id && mine === id && el.classList.contains('feature-header'));
    }
  }

  var headers = document.querySelectorAll('.feature-header');
  for (var h = 0; h < headers.length; h++) {
    (function (header) {
      var id = header.getAttribute('data-feature-id');
      header.addEventListener('mouseenter', function () { applyFocus(id); });
      header.addEventListener('mouseleave', function () { applyFocus(focused); });
      header.addEventListener('click', function () {
        focused = (focused === id) ? null : id;
        applyFocus(focused);
      });
    })(headers[h]);
  }

  var cards = document.querySelectorAll('.skeleton-item-card, .increment-card, .bite-card');
  for (var c = 0; c < cards.length; c++) {
    (function (card) {
      card.addEventListener('click', function (event) {
        if (event.target.closest('a')) { return; }
        var details = card.querySelector('.card-details');
        if (details) { details.hidden = !details.hidden; }
      });
    })(cards[c]);
  }

  var toggle = document.getElementById('hide-done');
  if (toggle) {
    toggle.addEventListener('change', function () {
      document.body.classList.toggle('hide-done', toggle.checked);
    });
  }
})();
</script>
</body>
</html>
```

`{{TOTAL_STEP_COUNT}}` = the sum of User Tasks across every Feature (e.g. 40 for a 7-Feature, 40-task backbone) — this is the total number of grid columns, since one column = one Step, not one Feature.

---

## Column DOM Structure (Critical for Updates)

**The addressable unit is the Step (User Task) column — `data-task-id` — never the Feature.** A Feature is only a spanning header div; it holds no tasks or cards itself.

Build the grid in DOM passes, all children of the same `.map-grid` container, positioned purely by `grid-row` / `grid-column` (CSS Grid auto-placement fills left-to-right within a row, so as long as items appear in backbone journey order within each pass, they land in the right column automatically):

```html
<!-- PASS 1 (row 1): one div per FEATURE, spanning its Step count. Auto-placed left-to-right. -->
<div class="feature-header" data-feature-id="RTMVP-FEAT-001" style="grid-column: span 2;">
  <span class="feature-title">Feature 1: Tourist Opts Into Location Services</span>
  <span class="fid">RTMVP-FEAT-001</span>
  <span class="priority-badge">Critical MVP</span>
</div>

<!-- PASS 2 (row 2): one div per STEP (User Task) — the real column unit.
     data-task-id is the addressable unit; data-feature-id feeds the focus highlight. -->
<div class="step-card" data-task-id="RTMVP-TASK-001" data-feature-id="RTMVP-FEAT-001">Enable geolocation permissions on first launch</div>
<div class="step-card" data-task-id="RTMVP-TASK-002" data-feature-id="RTMVP-FEAT-001">Verify location is active</div>

<!-- PASS 3 (row 3+): release tier, one per Step's column, stacked vertically by priority.
     Before slicing, every Step gets exactly one placeholder in row 3. -->
<div class="release-cell" data-task-id="RTMVP-TASK-001">Not yet sliced</div>
<div class="release-cell" data-task-id="RTMVP-TASK-002">Not yet sliced</div>
```

After a slice has been rendered, that Feature's Step columns get their placeholder(s) replaced in place:

```html
<!-- A sliced Step's column: skeleton item at row 3 (nearest the header = highest priority),
     increments stacked below it in the SAME column at rows 4, 5, ... -->
<div class="skeleton-item-card state-planned" data-task-id="RTMVP-TASK-001" data-feature-id="RTMVP-FEAT-001" data-increment-id="01-Inc1" data-slice="01-walking-skeleton" data-state="planned" style="grid-row: 3; grid-column: 1;">
  <div class="card-title"><strong>Inc 1 — Walking skeleton</strong><span class="steps-badge" data-done="0" data-total="3"></span></div>
  <small>F1-1.1 Native permission dialog · F1-2.1 Skip leads to offline browsing</small>
  <div class="card-details" hidden>
    <ul>
      <li>Scenario: Permission prompt shown on first launch</li>
      <li>Scenario: Skipping keeps offline browsing available</li>
    </ul>
    <a href="slices/01-walking-skeleton.md">slices/01-walking-skeleton.md</a>
  </div>
  <span class="scope-badge">S01 · Inc 1</span>
</div>
<div class="increment-card state-building" data-task-id="RTMVP-TASK-001" data-feature-id="RTMVP-FEAT-001" data-increment-id="01-Inc2" data-slice="01-walking-skeleton" data-state="building" style="grid-row: 4; grid-column: 1;">
  <div class="card-title"><span class="increment-id">Inc 2 — Re-enable location after skip</span><span class="steps-badge" data-done="2" data-total="5"></span></div>
  <div class="increment-description">F1-1.3 Grant permission from the settings screen</div>
  <div class="card-details" hidden>
    <ul><li>Scenario: Granting from settings enables location</li></ul>
    <a href="slices/01-walking-skeleton.md">slices/01-walking-skeleton.md</a>
  </div>
  <span class="scope-badge">S01 · Inc 2</span>
</div>
```

Bites go in the same column, **below the last increment card**, one `.bite-card` per untaken bite
(`grid-row` = next free row; must-have first, then `~nice-to-have`, then deferred). The Increment card
of an increment that took bites lists them on a second line (`Bites: F1-a Ana ve… · F1-b …`).

```html
<div class="bite-card" data-bite-id="F1-a" data-task-id="RTMVP-TASK-001" data-feature-id="RTMVP-FEAT-001" data-slice="01-walking-skeleton" data-priority="must" style="grid-row: 5; grid-column: 1;">
  <div class="bite-head"><span class="bite-id">F1-a</span><span class="bite-tag">must-have</span></div>
  <div class="bite-title">Tourist sees why location was denied</div>
  <div class="bite-deps">depends on: Inc 1</div>
  <div class="card-details" hidden>
    <ul>
      <li>Options: F1-1.3, F1-2.2</li>
      <li>Value: the tourist knows what to fix</li>
      <li>Check: denying the prompt shows the reason banner</li>
    </ul>
    <a href="slices/01-walking-skeleton.md">slices/01-walking-skeleton.md</a>
  </div>
  <span class="scope-badge">S01 · Backlog</span>
</div>
<div class="bite-card bite-nice" data-bite-id="F1-b" data-priority="nice" …>…<span class="scope-badge">S01 · Backlog</span></div>
<div class="bite-card bite-deferred" data-bite-id="F1-x" data-priority="deferred" …>…<span class="scope-badge">S01 · Backlog</span></div>
```

Note the explicit `grid-column` on sliced cards: once a column has more than one card stacked vertically, you can no longer rely on row-scoped auto-placement alone — pin `grid-column` to the Step's numeric column position (1-indexed, left to right across the *entire* grid, not per-Feature).

If a Feature has System Tasks (autonomous transitions — see methodology.md), they are not Steps and get no column. Render them as one `.system-tasks-note` div spanning that Feature's own column range, placed in a row below the release tiers.

---

## Markdown→HTML Conversion Rules

When building or updating the story-map HTML from `features.md` (and the slice files), use these mappings:

| Source (Markdown)              | Target (HTML)                                 | Notes |
|------------------------------|--------------------------------------------|-------|
| `## Features Backbone`        | (Signal: build the board from the Features below) | Not rendered directly; used to parse Features |
| `#### Feature: [Actor] [Verb] [Object]` (+ ID comment) | `.feature-header` div, `grid-row: 1`, `grid-column: span N`, `data-feature-id` | N = that Feature's User Task count; auto-placed in backbone journey order — a header, NOT a container |
| `##### User Task: [Verb] [Object]` (+ Task ID comment) | `.step-card` div, `grid-row: 2`, `data-task-id`, `data-feature-id` | One column per User Task, in order under its parent Feature — the addressable unit |
| `### Inc 1 — …` in `slices/*.md` (Walking Skeleton) | One `.skeleton-item-card` per `**[User Task Name]**` tag, `grid-row: 3`, `data-increment-id="<nn>-Inc1"` | Replaces that Step's `.release-cell` placeholder only |
| `### Inc <n> — …` (n > 1) | One `.increment-card` per tag, next free row (4, 5, …) of that Step's column, `data-increment-id="<nn>-Inc<n>"` | Stacked below the skeleton in that Step's own column, in increment order; replaces the placeholder if the column has none yet |
| `Options:` of an `### Inc` + `## Slicing` | Card description: the option IDs and names that belong to that card's User Task | Map each option ID to its User Task through the `## Slicing` section |
| `plan.md` checkboxes under `## Slice <nn>` → `### Inc <n>` | `state-*` class + `data-state` + `.steps-badge` on every card with `data-increment-id="<nn>-Inc<n>"` | `done` (all checked) / `building` (some checked) / `planned` (none, or no plan yet) |
| Open slices + first unchecked `- [ ]` in `plan.md` | `.next-banner` text/link (to `plan.md`; or `hidden`) | Active slice = first `Status: open` slice with an unchecked plan step |
| `## Backlog` of each slice: each **untaken** bite line (`**F1-a · <title>** (must-have\|nice-to-have\|deferred) — <options> · depends on: … · value: … · check: …`) | One `.bite-card` below the last increment of the Step column of the bite's **first option** (resolve it through `## Slicing`); `bite-nice` / `bite-deferred` class, `data-priority` | A bite is **taken** when its line carries `→ Inc n`: it gets no bite card (its increment card shows it). Order in a column: must-have, nice-to-have, deferred. A Backlog with no bite lines (a slice written before bites) draws nothing. The `### Proposed increments` table is not a bite line and is **not drawn** |
| Every skeleton, increment and bite card | A `.scope-badge` as the card's last child, bottom-right corner | `S<nn> · Inc <n>` for the skeleton and increment cards (`<nn>` = the slice number, `<n>` = its increment); `S<nn> · Backlog` for a bite. Fixed at draw time; `state-sync` leaves it alone |
| `Bites:` of an `### Inc` | Second line of that Inc's card description: the bite IDs and titles | Absent on Inc 1 (`—`) |
| System Tasks (if any, per methodology.md) | `.system-tasks-note` footnote, spanning the Feature's column range | Not a Step column |
| Feature dependency info (if present) | Optional legend/footnote below the grid | Critical/recommended/optional path if inferred from trio notes |

---

## Update Algorithms (In-Place Modification)

All updates happen **in place**: read `story-map.html`, change only the targeted nodes, write it
back to the same filename. Never recreate the whole file on the normal path.

### A. Slice added (`slice-added`)

1. **Read** the existing `story-map.html` and the new slice file.
2. Take the increment the caller named (`increment: Inc <n>`); if none was named, every
   `### Inc <n>` heading that has no card yet. Read its `**[User Task Name]**` tags and its
   `Options:` IDs. Not every User Task is touched — that is expected.
3. For each tagged User Task, locate `.step-card[data-task-id="<TASK_ID>"]` and resolve its
   absolute `grid-column` (1-indexed over the whole grid, not per Feature).
4. `Inc 1` **replaces** the column's `.release-cell[data-task-id="<TASK_ID>"]` with a
   `.skeleton-item-card` (`grid-row: 3`, same `grid-column`). A later `Inc <n>` appends an
   `.increment-card` at the next free row of that column (`grid-row: 4, 5, …`), or replaces the
   placeholder at row 3 if the column has no card yet. `data-increment-id="<nn>-Inc<n>"`; the
   description lists the increment's option IDs and names that belong to this User Task.
5. **Preserve every other Step's column untouched** — including other Steps within the *same*
   Feature that this slicing pass didn't address.
6. **Refresh the bites of this slice.** For **every** Step column of the Features this slice
   covers (not just the tagged ones: a `--next` re-prune can add, remove or reword bites anywhere),
   delete that column's `.bite-card`s for this slice and redraw them from `## Backlog`, below the
   column's last increment card. An Inc card added in step 4 that lands on a row a bite used
   pushes the bites down — they are redrawn after it, never before.
7. **Write** back to the same file, then run the state-sync algorithm.

### B. State sync (`state-sync`)

1. Parse every `slices/*.md`: the `Status:` line (open | done) and per `### Inc <n>` heading its
   scenarios; parse `plan.md` for the plan checkboxes (`- [ ]` / `- [x]`) under `## Slice <nn>` →
   `### Inc <n>`. Do **not** touch `.bite-card`s: only
   `slice-added` and `rebuild` redraw bites.
2. For each card with `data-increment-id="<nn>-Inc<n>"` (one per tagged User Task), set its
   `state-*` class and `data-state`:
   - all plan boxes checked (≥1) → `state-done`
   - some checked → `state-building`
   - none checked → `state-planned`
3. Set the card's `.steps-badge` `data-done` / `data-total`; remove the badge when the increment
   has no section in `plan.md`.
4. Rebuild `.next-banner`: active slice = the first `Status: open` slice with an unchecked plan
   step; next step = its first `- [ ]` in `plan.md` under `## Slice <nn>`. Update `.next-text` as `"<step> — <nn>-<name>"` and
   `.next-link` as `plan.md`; set `hidden` when there is no next step.
5. Update `.counters` (increments done/total, steps done/total, slices done/total, bites left)
   and the footer (`Sliced: <features with ≥1 card>/<features>`, `Slices: <n>`, `Bites: <n>`,
   generated date). *Bites left* = the number of `.bite-card`s on the board.

### C. Auto-check (always, before writing)

- `.step-card` count = User Task ID count in `features.md`.
- `.feature-header` count = Feature count; each `span N` = its User Task count.
- `.bite-card` count = untaken bite lines (no `→ Inc n`) in every `## Backlog`; none duplicates a
  taken one; each sits in the column of its first option.
- `state-done` cards = cards of increments whose plan is fully checked.
- Counters = the real counts; the footer's numbers agree.

If a check fails, correct the HTML from the markdown and re-run the check. If it still fails,
add a visible `.system-tasks-note` with the mismatch and report it rather than writing wrong
counters.

### D. Migration / repair (`rebuild`)

Only when the `v3` marker is missing or an in-place fix is impossible: re-render the whole board
from `features.md` + every `slices/*.md` using this template, exactly as a fresh `create` plus
all `slice-added` runs would produce.

---

## Template Placeholders

- `{{TITLE}}`: Page title (e.g., "Real Tourism MVP — Story Mapping")
- `{{SUBTITLE}}`: Tagline (e.g., "Backbone (Features) → Steps (User Tasks) → Releases (Slices)")
- `{{BODY}}`: Complete set of `.feature-header`, `.step-card`, and `.release-cell`/`.skeleton-item-card`/`.increment-card` divs described above, in DOM pass order
- `{{TOTAL_STEP_COUNT}}`: Sum of User Tasks across every Feature — sets the grid's total column count
- `{{DONE_INCREMENTS}}` / `{{TOTAL_INCREMENTS}}`: Increments (`### Inc` headings) fully checked vs all increments
- `{{DONE_STEPS}}` / `{{TOTAL_STEPS}}`: Checked plan steps vs all plan steps in `plan.md`
- `{{DONE_SLICES}}` / `{{TOTAL_SLICES}}`: `Status: done` slice files vs all slice files
- `{{BITES_LEFT}}`: Untaken bites drawn on the board (the number of `.bite-card`s)
- `{{NEXT_HIDDEN}}`: ` hidden` when there is no next step, otherwise empty
- `{{NEXT_TEXT}}` / `{{NEXT_LINK}}`: First unchecked step + its slice, or empty
- `{{FOOTER_META}}`: Generated footer (e.g., "Real Tourism MVP Story Mapping | Generated 2026-07-16 | Features: 7 | Steps: 40 | Sliced: 3/7 | Slices: 3")

---

## Example Footer Generation

```
Real Tourism MVP Story Mapping | Generated 2026-07-16 | 7 Features | 40 Steps | Sliced: 3/7 | Slices: 3 | Bites left: 12 | Skills: bokata-feature-map → bokata-slice
```

---

## Notes for Orchestrator Implementation

- **Initial Creation** (in `bokata-render` op `create`, dispatched by `bokata-feature-map`):
  - Row 1: one `.feature-header` per Feature, spanning its Step count, in journey order
  - Row 2: one `.step-card` per User Task (with `data-task-id`, `data-feature-id`)
  - Row 3: every Step gets a `.release-cell` placeholder ("Not yet sliced") — one per Step, not one per Feature
  - Counters at 0 done; next banner hidden; footer shows `Sliced: 0/N`

- **Incremental Updates** (op `slice-added`, dispatched by `bokata-slice`):
  - Only the Step columns tagged by that run's increment are modified
  - Untouched Steps keep their original `.release-cell` placeholder
  - Footer updates as more Features are sliced (a Feature counts as "sliced" once at least one of its Steps has a card)
  - Multiple slicing passes accumulate in the same file without conflict, since each only ever touches its own Steps' columns

- Each card's `.scope-badge` is written with the card, so `slice-added` and `rebuild` set it; `state-sync` never edits it.
- **Bites** are redrawn by `slice-added` (for the slice's Features, all columns) and by `rebuild`; `state-sync` never adds or removes them.

- **State sync** (dispatched by `bokata-plan` after writing the plan, by the `code-executor` agent at the end of each increment, by `bokata-slice --done`, and by `bokata-status` as a catch-up when it detects lag):
  - Never adds or removes cards; only state classes, badge attributes, banner, counters and footer

---

## Dark Mode Support

All colors have `@media (prefers-color-scheme: dark)` overrides. No extra work needed — browser's dark-mode toggle automatically applies.
