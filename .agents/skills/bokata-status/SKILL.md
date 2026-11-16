---
name: bokata-status
description: Read-only summary of where a bokata initiative stands — phase, open slices, current increment and next step, open unknowns, each slice's backlog of bites, and features not yet sliced. Use it when the user asks "where am I", "what's next", "status of <initiative>", or resumes work in a new session or another tool.
---

# bokata-status

Read the files; change nothing. The only thing it may launch is the `bokata-render` catch-up
subagent described at the end — never a render of its own and never a state change.

## Configuration

Read `.bokata.json` at the project root if it exists (`docs` defaults to `docs/initiatives`).

## What to read

`<docs>/<slug>/`: `pitch.md`, `features.md`, `slices/*.md`, `plan.md`. If no slug is given, list the
initiatives under `<docs>/` that have a `pitch.md`, `features.md` or `slices/`, and ask
which one (or summarise them all in one line each).

## What to report

Answer in the user's language, in this shape and nothing more:

```
<initiative> — <phase: shaping | shaped | mapped | slicing | planned | building | done>
Pitch: <size>, <ambition>                                   (if a pitch exists)
Features: <n> · sliced: <list of features with a slice> · not yet: <list>
Slice <nn>-<name> (open | done) — Features F1, F2
  ✔ <built increments>   ▶ Inc <n> <name> — next step: "<first unchecked step>"
    ▲ <k> unknowns: <first one>     | ▼ no unknowns
    ~ <open nice-to-have scenarios>
  Backlog: <k> bites (<m> must-have · <d> deferred) — <first two, by ID and title>
Next: <the skill or hand-off to run next>
```

Rules:
- **Phase** comes from what exists: pitch only → shaped; features → mapped; a slice whose
  current increment has no section in `plan.md` → slicing; a plan with no checked steps → planned; some
  checked → building; every slice done and no Feature left without a slice → done. The plan
  steps are the checkboxes under `## Slice <nn>` → `### Inc <n>` in `plan.md`. A `features.md` carrying `<!-- Mode: single -->` was written by
  `bokata-slice` in single mode, not by a feature map: it never makes the phase "mapped".
- One block per slice, open slices first; done slices get one line (`Slice <nn> done —
  <k> bites left`). **Backlog** is the slice's `## Backlog` section: its bites that no `Inc` has taken
  (`must-have` ones counted separately; `~nice-to-have` and deferred are the rest).
  Which Features have a slice comes from their `**Slice:**` lines in `features.md`. In single
  mode the `Features:` line is `Features: 1 (single mode)`.
- **▲ / ▼** is the current increment's `Unknowns` line: open questions mean it still needs the user (▲),
  none means only execution is left (▼).
- **Next** is the first that applies: unknowns open → resolve them with the user; slice without
  a plan → `bokata-plan`; unchecked steps → the executor hand-off line; increment built and backlog left →
  `bokata-slice <nn> --next` (or `--done` if the user is finished with it); Features without a
  slice → `bokata-slice` on them; nothing left → done.
- Quote steps and unknowns exactly as written. If a file is malformed, say which and where;
  never guess its content.

## Catch-up story map

`story-map.html` is a render of the markdown and can lag (an undone render, a manual edit, a
session that closed early). After reporting, compare it with the files: if the board is missing,
lacks the `v3` template marker, or its counters/banner disagree with `slices/*.md`, dispatch the
`story-map-renderer` subagent (it loads the `bokata-render` skill) with operation `state-sync`
(or `rebuild` when the marker is missing) — it runs on its cheap render model in background —
and add one line to the report saying the map was brought up to date. If `story_map` is `false`
or there is no `story-map.html` at all, do nothing.
