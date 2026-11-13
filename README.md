# Bokata

**Shape, slice and build in small steps** — a small, configurable set of agent skills for
Claude Code, OpenCode, Codex and Cursor, built on Teresa Torres' Product Trio.

```
shape  →  feature map  →  slice  →  plan  →  code (TDD)
pitch     features        slice     checklist  commits
```

- **Skills only, no commands.** Every phase is a skill you invoke by name. Use all of them or
  just the ones you want.
- **Spec-first, code as truth.** The documents bokata writes are working material for the
  initiative at hand. Delete them when it ships and nothing is lost: the tests describe the
  behaviour, and the ADRs record the *why*.
- **Product Trio** (PM, Designer, Engineer) subagents review approaches, features and slices
  in parallel; you coordinate and decide.
- **Agnostic.** Output folder, templates and the method skills (grill, domain, code,
  refactor) are set in `.bokata.json`. Orchestration (Orca, tmux, plain terminals) stays yours.

## Install

```bash
npx bokata@latest install          # detects .claude/ .cursor/ .opencode/ .codex/
npx bokata@latest install --claude --opencode
npx bokata@latest sync             # regenerate agents after editing .bokata.json
```

- Skills are copied once to `.agents/skills/` and **symlinked** from `.claude/skills/` and
  `.cursor/skills/`. OpenCode and Codex read `.agents/skills/` directly.
- Agents are generated per harness from one neutral source: `.claude/agents/*.md`,
  `.opencode/agents/*.md`, `.codex/agents/*.toml`, `.cursor/agents/*.md`.
- The model of each role (`trio`, `executor`, `reviewer`) is asked at install time and saved
  in `.bokata.json`; change it there and run `sync`.
- Re-running `install` is safe. It also removes the commands bokata 2.x installed. (2.x also
  wrote `~/.codex/prompts/bokata-*.md` globally; delete those by hand if you used Codex.)
- The default grill and domain methods are [`grill-with-docs` and
  `domain-modeling`](https://github.com/mattpocock/skills) by Matt Pocock. Install them with
  their own installer, or point `methods.grill` / `methods.domain` elsewhere (see
  [Methods](#methods)).

## The flow

| Size | Path |
|---|---|
| **S** — a fix or tweak | plan mode → `bokata-tdd` (no documents) |
| **M** — one clear feature | `bokata-shape` → `bokata-slice` (single mode; keeps the options backlog in a one-feature `features.md`) → `bokata-plan` → `code-executor` |
| **L** — several features | `bokata-shape` → `bokata-feature-map` → `bokata-slice` (1–3 features) → `bokata-plan` → `code-executor` |

`bokata-shape` proposes the size; you confirm it.

### Skills

| Skill | What it does | Writes |
|---|---|---|
| `bokata-shape` | Grill (the configured method) + Shape Up shaping: narrow the problem, 2–3 approaches as Mermaid breadboards (low-fi HTML sketch when layout matters), one trio pass, rabbit holes and no-gos | `pitch.md` |
| `bokata-feature-map` | Features Backbone + functional ACs with the trio; asks only about gaps in its input | `features.md` + the initiative's `story-map.html` dashboard (rendered by `bokata-render`) |
| `bokata-slice` | Pick 1–3 features → increment options → you choose the slice (walking skeleton first) → concrete ACs for the chosen increments only | `slices/<nn>-<name>.md`; the Increment options in `features.md` (single mode creates it); the slice's cards in `story-map.html` |
| `bokata-plan` | A contract for your harness's own plan mode: the plan becomes checklists under each increment, starting with its acceptance test | the slice's `Plan:`; syncs `story-map.html` |
| `bokata-tdd` | Default code method: an acceptance test per increment, then strict small-step TDD with evidence rules | commits |
| `bokata-refactor` | Default refactor method: Kent Beck's four rules of simple design, tidyings, code smells mapped to the move that fixes each | `refactor` commits |
| `bokata-status` | Read-only: phase, active slice, next step, open unknowns, features not yet sliced; may dispatch a catch-up render if the story map lags |
| `bokata-render` | Internal: renders and keeps `story-map.html` current (statuses, next step, counters, interactivity) from the markdown; loaded by the `story-map-renderer` agent, never by the user | — |
| `bokata-feature-mapper`, `bokata-feature-slicer`, `bokata-acceptance-criteria` | The methods the phases use; usable on their own | — |

### Agents

| Agent | Role | Access |
|---|---|---|
| `bokata-product-manager` / `-designer` / `-engineer` | Product Trio reviewers and rule contributors | read |
| `code-executor` | Builds a planned slice with `methods.code`; keeps the slice checklist, test mapping and unknowns current; never pushes | write |
| `design-reviewer` | Reviews one step's diff with `methods.refactor` and the coding standards | read |
| `story-map-renderer` | Loads `bokata-render` and keeps `story-map.html` current; dispatched by the skills and by `code-executor`, never by you | write |

During trio reviews the **main thread** is the neutral coordinator: it applies
non-conflicting findings, settles factual conflicts against the artifacts, and escalates
genuine product trade-offs to you as one decision point with a recommended default.

### Hierarchy

```
Initiative (pitch.md)
 └ Features (features.md — also holds each feature's increment options)
    └ Slice (1–3 features you pick → usable end to end)
       └ Scope (the part of one feature in this slice; Unknowns ▲ / none ▼)
          └ Increment (functional on its own; must-have or ~nice-to-have)
             └ Steps (the plan checklist, checked off commit by commit)
```

## Running the harness

The flow is **skills you name in conversation**; agents are selected or dispatched depending on
the harness. Install first (`npx bokata@latest install`), then:

| Step | You say | Produces |
|---|---|---|
| Shape | "Shape this idea: …" (loads `bokata-shape`) | `pitch.md` |
| Feature map (L initiatives) | "bokata-feature-map <slug>" | `features.md`; the dashboard renders in background |
| Slice | "bokata-slice <slug>" — pick 1–3 features | `slices/<nn>-<name>.md` |
| Plan | In your harness's plan agent: "bokata-plan docs/initiatives/<slug>/slices/<nn>-<name>.md" | checklists in the slice, `Status: planned` |
| Build | Run `code-executor` with the hand-off line the plan printed | commits, checkboxes, story map kept current |
| Check | "bokata-status <slug>" | phase, next step; catches the story map up if it lags |

`story-map-renderer` has no step of its own: the skills above and `code-executor` dispatch it
(cheap render model, background) whenever the markdown changes.

### Per harness

- **OpenCode** — skills read from `.agents/skills/`; agents install to `.opencode/agents/`.
  Name the skill in the session. Primary-capable agents (`code-executor`) appear in the agent
  switcher (Tab); `mode: subagent` agents (the trio, `design-reviewer`, `story-map-renderer`)
  never do — the session dispatches them itself. Headless:
  `opencode run --agent code-executor "Build slice docs/initiatives/<slug>/slices/01-<name>.md"`
- **Claude Code** — skills install to `.claude/skills/` (invoke by name or `/bokata-shape`);
  agents to `.claude/agents/`. The session spawns subagents by name. Headless:
  `claude --agent code-executor "Build slice …"`
- **Codex** — agents install to `.codex/agents/*.toml`; skills read from `.agents/skills/`.
  Ask in plain language ("use the code-executor agent to build slice …"); `/agent` switches
  between agent threads.
- **Cursor** — skills in `.cursor/skills/`, agents in `.cursor/agents/`; pick the agent from
  Cursor's selector or name the skill in chat.

### Orchestrators

Scopes marked `Parallel-safe: yes` can run in separate worktrees at the same time.

- **Orca** — spawn the executor in a fresh worktree with the hand-off line:
  `orca worktree create --name <task> --no-parent --agent codex --prompt "<hand-off line>" --json`
  (or `--agent claude`). For a worktree that already exists:
  `orca agent launch --agent codex --worktree <id> --prompt "<hand-off line>"`.
- **Herdr** — split a pane, start the agent in it, and send the line:
  `herdr pane split --current --direction right --cwd "$PWD" --no-focus` →
  `herdr agent start executor --kind codex --pane <id>` →
  `herdr agent prompt executor "<hand-off line>" --wait`
- **Plain terminals** — open a worktree and run your harness's headless command with the
  hand-off line.

## Configuration — `.bokata.json`

Everything is optional; these are the defaults.

```jsonc
{
  "docs": "docs/initiatives",          // where initiative folders go
  "language": "auto",                  // conversation follows the user
  "story_map": true,                   // story-map.html dashboard; false = markdown only
  "memory": {                          // long-lived files bokata reads (and shape updates)
    "constitution": "CONSTITUTION.md",
    "glossary": "GLOSSARY.md",
    "standards": "CODING_STANDARDS.md",
    "adrs": "docs/adrs",
    "adr_template": null               // null = bokata's light MADR template
  },
  "templates": { "pitch": null, "features": null, "slice": null },  // your own templates
  "methods": {                         // swap a method skill (see Methods)
    "grill": "grill-with-docs",
    "domain": "domain-modeling",
    "code": "bokata-tdd",
    "refactor": "bokata-refactor"
  },
  "harnesses": [],                     // filled by install
  "models": { … }                      // per harness: trio | reviewer | executor | render (see below)
}
```

### Methods

Bokata decides **what** each phase produces and **where** it goes; a method skill decides
**how** one job is done. Each slot names a skill, and you swap one by naming another skill in
`.bokata.json` (then `npx bokata sync` so the agents pick it up).

| Slot | Default | Loaded by | The job |
|---|---|---|---|
| `grill` | `grill-with-docs` | `bokata-shape` | Interview the user until the problem is narrow |
| `domain` | `domain-modeling` | `bokata-shape`, `bokata-feature-map`, `bokata-slice`; `bokata-plan` only for a concept the glossary lacks | Challenge terms against the glossary; write glossary terms and ADRs as they settle |
| `code` | `bokata-tdd` | `code-executor` | Turn plan steps into tested commits |
| `refactor` | `bokata-refactor` | `bokata-tdd`, `design-reviewer` | Change structure without changing behaviour, and name what to change |

A replacement only has to do the slot's job. Bokata layers its own rules on top, and they win
over the method's:

- **Paths and formats come from `memory`.** If a method writes `GLOSSARY.md` or numbered
  `docs/adr/` files and your config says otherwise, the config wins.
- **The output contract stays bokata's.** Whatever the code method, the executor checks off
  plan steps commit by commit, fills `Tests:` and keeps `Unknowns` honest.
- **The project wins over every method.** The constitution, `AGENTS.md` and the coding
  standards are read first and override any method.

Set `domain` to `null` to skip the domain passes. Project-specific coding rules do not need a
slot: they live in `memory.standards`, which the executor and the reviewer always read.

### Default models

Planning and analysis (the trio and the design reviewer) get a planning model; writing code
(the executor) gets a coding model; the story-map renderer gets a cheap model because its job is
mechanical. Planning itself runs in your main session — open it with the planning model of your
harness.

| Harness | Plan and analyse (`trio`, `reviewer`) | Write code (`executor`) | Render the map (`render`) |
|---|---|---|---|
| Claude Code | `opus` | `sonnet` | `haiku` |
| OpenCode | `opencode-go/glm-5.3-flash` | `opencode-go/deepseek-v4.1-flash` | `opencode-go/glm-5.3-flash` |
| Cursor | `glm-flash` | `sonnet` | `glm-flash` |
| Codex | `gpt-5.6-sol` | `gpt-5.6-luna` | `gpt-5.6-luna` |

Set a role to `null` to use the harness's own default model instead.

Cursor's agent format is generated on a best-effort basis (`name`, `description`, `model`,
`readonly`); skills work in Cursor either way.

## Development

```bash
npm test      # installer tests (node:test, no dependencies)
```

## License

MIT
