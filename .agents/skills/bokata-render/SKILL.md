---
name: bokata-render
description: Render and keep up to date the Patton-style story-map.html dashboard of a bokata initiative — statuses, next step, counters and the vanilla interactivity — from features.md and slices/*.md. Loaded by the story-map-renderer agent, which the bokata skills and code-executor dispatch as a cheap background subagent because rendering is mechanical, deterministic work. Never invoked by the user directly.
---

# bokata-render

You render and maintain **one** artifact: `<docs>/<initiative-slug>/story-map.html`. You are
mechanical and deterministic: read markdown, write HTML. Never invent product content, never ask
the user questions, never touch any other file.

The markdown is the source of truth. `features.md` holds the backbone and the Increment options;
`slices/*.md` hold `Status:` and the per-increment plan checklists. If the HTML and the markdown
ever disagree, **the markdown wins** — fix the HTML from it, never the other way round.

## Configuration

Read `.bokata.json` at the project root if it exists (`docs` defaults to `docs/initiatives`).
If `story_map` is `false`, do nothing and report that rendering is disabled.

## Input

The caller tells you three things: `<docs>/<initiative-slug>/`, the **operation**, and (for
`slice-added`) the slice file. Read only `features.md` and `slices/*.md` inside that folder.
Read nothing else and do not load the constitution or the glossary.

## Operations

Pick the operation the caller passed. If it is missing, infer it: no `story-map.html` and no
slices → `create`; no `story-map.html` but slices exist → `rebuild`; the file has no `v2` marker →
`rebuild`; the file is current and a slice was just added → `slice-added`; otherwise →
`state-sync`.

### 1. `create` — first render

No `story-map.html` exists yet. Build it whole from `features.md` using
[resources/story-map-template.md](resources/story-map-template.md):

- Row 1: one `.feature-header` per Feature, `grid-column: span N` (N = its User Task count), in
  backbone journey order. **A Feature is a header, never a column holding a list of tasks.**
- Row 2: one `.step-card` per User Task with `data-task-id` and `data-feature-id`, in the order
  listed under its Feature.
- Row 3: one `.release-cell` ("Not yet sliced") per Step, with `data-task-id`.
- Counters: 0 done, totals from the backbone; the next banner stays `hidden`; footer with the
  initiative name, date and counts.
- Title `"<initiative> — Story Mapping"`, subtitle
  `"Backbone (Features) → Steps (User Tasks) → Releases (Slices)"`.

### 2. `slice-added` — after bokata-slice

The slice file is final. Update the existing board **in place**, only the columns it touches:

1. Read the slice file; collect its increments from the `### Increment <ID>:` headings and their
   `**[User Task Name]**` tags.
2. For each tagged User Task, find `.step-card[data-task-id="<TASK_ID>"]`, resolve its absolute
   `grid-column` (1-indexed over the whole grid, not per Feature).
3. Replace that Step's `.release-cell[data-task-id="<TASK_ID>"]` with a `.skeleton-item-card`
   (`grid-row: 3`) for the Walking Skeleton item, then append `.increment-card` divs
   (`grid-row: 4, 5, …`) for the remaining increments, ordered as in the slice.
4. Carry on each card: `data-task-id`, `data-feature-id`, `data-increment-id` (the ID from
   `features.md`, e.g. `F1-a`), `data-slice` (the slice file name without `.md`), `data-state`
   and the card body (title, one-line description, `.card-details` with one `<li>` per scenario
   and a link to `slices/<nn>-<name>.md`).
5. Leave **every other** Step's column untouched, including Steps of the same Feature this slice
   did not tag and every card from earlier slices.
6. Finish with `state-sync` (operation 4) so statuses, counters and the next banner match the
   new slice immediately.

### 3. `rebuild` — migration or repair

The file predates the `v2` template marker, or the auto-check of a previous run failed and could
not be repaired in place. Render the **whole** board from scratch — `features.md` for the
backbone, every `slices/*.md` for the cards and their state — following
[resources/story-map-template.md](resources/story-map-template.md). The result must be identical to
what a fresh `create` plus every `slice-added` would produce. Use it only as fallback: the normal
path is in-place editing.

### 4. `state-sync` — after bokata-plan, each executor increment, or a bokata-status catch-up

Do not add cards. Re-derive state from `slices/*.md` and update the existing HTML:

1. For every slice file, read `Status:` (sliced | planned | building | done) and, per
   `### Increment <ID>:` heading, its plan checkboxes (`- [ ]` / `- [x]`).
2. For each card with that `data-increment-id`, compute its state and write it as the
   `state-*` class and `data-state` attribute. Normalize IDs before matching — `F1-a`, `F1.a`
   and `1.a` are the same increment — and if a card matches no heading, leave it untouched and
   report it in the auto-check:
   - slice `Status: done` → `state-done`
   - every plan checkbox checked (and at least one) → `state-done`
   - at least one checked, not all → `state-building`
   - no checkboxes checked yet (with or without a plan) → `state-planned`
   - no slice file for that increment → remove the `state-*` class (never happens for cards
     written by `slice-added`).
3. Update each card's `.steps-badge` `data-done` / `data-total` attributes (steps checked vs
   total in its increment). Render no badge when the increment has no plan.
4. Rebuild the **next banner**: the active slice is the first with `Status: building`; if none,
   the first with `Status: planned`; if none, the first not `done`. The next step is the first
   `- [ ]` of that slice in file order. Fill `.next-text` with
   `"<step text> — <nn>-<name>"` and `.next-link` with `slices/<nn>-<name>.md`; hide the banner
   (`hidden`) when there is no next step.
5. Update the header counters and footer: increments done / total cards, steps done / total plan
   steps, slices done / total slice files, `Sliced: <features with ≥1 card>/<features>`, and the
   generation date.

## Auto-check (mandatory before you finish)

Count in the markdown and compare with the HTML you just wrote:

- `.step-card` count **equals** the number of User Task IDs in `features.md`.
- `.feature-header` count **equals** the number of Features; each `span N` equals its User Task
  count.
- Cards in `state-done` **equal** the increments whose checkboxes are all checked or whose slice
  is `done`.
- Header/footer counters **equal** the real counts.

If any check fails, fix the HTML from the markdown and run the check again. If it still fails,
write what is left as a `.system-tasks-note`-style note under the board and report the mismatch —
never leave counters lying.

## Hard rules

- One operation per run, one file written: `story-map.html`. Never edit `features.md`,
  `slices/*.md`, `pitch.md` or anything else.
- Keep the file self-contained: no external CSS, JS, fonts or images. Vanilla HTML/CSS/JS only.
- Keep the template marker (`<meta name="bokata-story-map" content="v2">`), the Patton structure
  and the `data-*` attributes — the next run depends on them.
- Same filename on write: the artifact is updated, not recreated (except `rebuild`).
- Reply with a single line: `<operation> — story-map.html updated (<increments done>/<total> increments, <steps done>/<total> steps)`.
