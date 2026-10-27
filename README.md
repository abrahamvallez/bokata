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
| **M** — one clear feature | `bokata-shape` → `bokata-slice` (single mode) → `bokata-plan` → `code-executor` |
| **L** — several features | `bokata-shape` → `bokata-feature-map` → `bokata-slice` (1–3 features) → `bokata-plan` → `code-executor` |

`bokata-shape` proposes the size; you confirm it.

### Skills

| Skill | What it does | Writes |
|---|---|---|
| `bokata-shape` | Grill (the configured method) + Shape Up shaping: narrow the problem, 2–3 approaches as Mermaid breadboards (low-fi HTML sketch when layout matters), one trio pass, rabbit holes and no-gos | `pitch.md` |
| `bokata-feature-map` | Features Backbone + functional ACs with the trio; asks only about gaps in its input | `features.md` (+ `.html`, `story-map.html`) |
| `bokata-slice` | Pick 1–3 features → increment options → you choose the slice (walking skeleton first) → concrete ACs for the chosen increments only | `slices/<nn>-<name>.md` (+ `.html`) |
| `bokata-plan` | A contract for your harness's own plan mode: the plan becomes checklists under each increment | the slice's `Plan:` |
| `bokata-tdd` | Default code method: an acceptance test per increment, then strict small-step TDD with evidence rules | commits |
| `bokata-refactor` | Default refactor method: Kent Beck's four rules of simple design, tidyings, code smells mapped to the move that fixes each | `refactor` commits |
| `bokata-status` | Read-only: phase, active slice, next step, open unknowns, features not yet sliced | — |
| `bokata-feature-mapper`, `bokata-feature-slicer`, `bokata-acceptance-criteria` | The methods the phases use; usable on their own | — |

### Agents

| Agent | Role | Access |
|---|---|---|
| `bokata-product-manager` / `-designer` / `-engineer` | Product Trio reviewers and rule contributors | read |
| `code-executor` | Builds a planned slice with `methods.code`; keeps the slice checklist, test mapping and unknowns current; never pushes | write |
| `design-reviewer` | Reviews one step's diff with `methods.refactor` and the coding standards | read |

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

## Running the executor

The plan ends with a hand-off line. How you launch it is up to you:

```bash
# OpenCode, in a worktree
opencode run --agent code-executor "Build slice docs/initiatives/<slug>/slices/01-<name>.md"

# Claude Code
claude --agent code-executor "Build slice docs/initiatives/<slug>/slices/01-<name>.md"

# An orchestrator such as Orca: plan with one harness, then ask it to spawn
# code-executor in a new worktree with the hand-off line.
```

Scopes marked `Parallel-safe: yes` can run in separate worktrees at the same time.

## Configuration — `.bokata.json`

Everything is optional; these are the defaults.

```jsonc
{
  "docs": "docs/initiatives",          // where initiative folders go
  "language": "auto",                  // conversation follows the user
  "html": true,                        // render .html next to features and slices
  "story_map": true,                   // Patton story map for feature maps
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
  "models": { … }                      // per harness: trio | reviewer | executor (see below)
}
```

### Methods

Bokata decides **what** each phase produces and **where** it goes; a method skill decides
**how** one job is done. Each slot names a skill, and you swap one by naming another skill in
`.bokata.json` (then `npx bokata sync` so the agents pick it up).

| Slot | Default | Loaded by | The job |
|---|---|---|---|
| `grill` | `grill-with-docs` | `bokata-shape` | Interview the user until the problem is narrow |
| `domain` | `domain-modeling` | `bokata-shape`, `bokata-feature-map`, `bokata-slice` | Challenge terms against the glossary; write glossary terms and ADRs as they settle |
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
(the executor) gets a coding model. Planning itself runs in your main session — open it with
the planning model of your harness.

| Harness | Plan and analyse (`trio`, `reviewer`) | Write code (`executor`) |
|---|---|---|
| Claude Code | `opus` | `sonnet` |
| OpenCode | `opencode-go/glm-5.3-flash` | `opencode-go/deepseek-v4.1-flash` |
| Cursor | `glm-flash` | `sonnet` |
| Codex | `gpt-5.6-sol` | `gpt-5.6-luna` |

Set a role to `null` to use the harness's own default model instead.

Cursor's agent format is generated on a best-effort basis (`name`, `description`, `model`,
`readonly`); skills work in Cursor either way.

## Development

```bash
npm test      # installer tests (node:test, no dependencies)
```

## License

MIT
