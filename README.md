# Bokata

**Product Trio SDD Framework** — Spec-Driven Development with Teresa Torres' Product Trio methodology.

Bokata helps teams generate Features Backbones, Acceptance Criteria, and Walking Skeletons through collaborative Product Trio reviews (PM, Designer, Engineer) — all powered by AI agents.

## Supported Harnesses

| Harness | Skills | Agents | Commands | Trio Parallel |
|---------|--------|--------|----------|---------------|
| **Claude Code** | ✅ | ✅ | ✅ | ✅ Task tool |
| **OpenCode** | ✅ | ✅ | ✅ | ✅ Task tool |
| **Cursor** | ✅ | ✅ | ✅ | ✅ Task tool |
| **Codex** | ✅ | ✅ | ✅ | ✅ spawn_agents |

## Installation

```bash
npx bokata@latest install
```

Run this from your project root. `bokata install` auto-detects which harnesses you already use — `.claude/`, `.cursor/`, `.opencode/`, `.codex/` — and installs skills, agents, and commands for each. If none are found, it asks interactively which ones to set up.

Non-interactive / CI usage, or to target specific harnesses:

```bash
npx bokata@latest install --claude --cursor
npx bokata@latest install --yes   # only install what was auto-detected, never prompt
```

Re-running `install` is safe — it overwrites previously installed files, so it doubles as the update path.

**Note on Codex:** Codex CLI only discovers custom slash-commands from the global `~/.codex/prompts/` directory (not per-project), so `/bokata-feature-map` and `/bokata-slice-feature` are installed there — shared across all your Codex projects, not just this repo. Skills and agents for Codex stay project-scoped as usual (`.codex/skills/`, `.codex/agents/`).

## Usage

### Feature Mapping

Generate a Features Backbone and Functional Acceptance Criteria:

```
/bokata:feature-map [initiative description]
```

**Outputs:**
- `docs/initiatives/<slug>/backbone.md` — Features, User Tasks, System Tasks
- `docs/initiatives/<slug>/backbone.html` — HTML report
- `docs/initiatives/<slug>/story-map.html` — Patton-style story map
- `docs/initiatives/<slug>/acceptance-criteria-functional.md` — Functional ACs
- `docs/initiatives/<slug>/acceptance-criteria-functional.html` — HTML report

### Feature Slicing

Decompose a Feature into a Walking Skeleton + Increments Backlog:

```
/bokata:slice-feature [feature name]
```

**Outputs:**
- `docs/initiatives/<slug>/<feature>/slicing.md` — Walking Skeleton + Increments
- `docs/initiatives/<slug>/<feature>/slicing.html` — HTML report
- `docs/initiatives/<slug>/<feature>/acceptance-criteria-concrete.md` — Concrete ACs
- `docs/initiatives/<slug>/<feature>/acceptance-criteria-concrete.html` — HTML report
- `docs/initiatives/<slug>/story-map.html` — Updated with sliced feature

## Architecture

```
.agents/skills/                     ← Single source, copied as-is into every harness at install time
├── bokata-feature-mapper/          ← User Story Mapping methodology
├── bokata-feature-slicer/          ← Walking Skeleton + Increments
└── bokata-acceptance-criteria/     ← Gherkin AC generation

bin/bokata.js + src/install.js      ← CLI entry point (npx bokata install)

agents/                             ← Pure prompts (harness-agnostic)
├── bokata-product-coordinator.md   ← Reconciliation rules reference (NOT installed as agent)
├── bokata-product-manager.md       ← Viability & Value lens (reviewer + contributor)
├── bokata-product-designer.md      ← Usability & UX/UI Craft lens (reviewer + contributor)
└── bokata-product-engineer.md      ← Feasibility & Technical Sustainability lens (reviewer + contributor)

commands/                           ← Orchestration by execution model
├── task-parallel/                  ← Claude Code + Cursor + OpenCode (Task tool)
│   ├── feature-map.md              ← Main thread: invokes skill → 3 reviewers → reconciles → writes
│   └── slice-feature.md            ← Main thread: invokes skill → 3 reviewers → reconciles → writes
└── codex/                          ← spawn_agents parallel
    ├── feature-map.md              ← Main thread: same pattern as task-parallel
    └── slice-feature.md            ← Main thread: same pattern as task-parallel
```

## Product Trio Roles

| Role | Lens | Role Type |
|------|------|-----------|
| **Product Coordinator** | Neutral orchestration | **Main thread role** — the command itself acts as coordinator (invokes skills, launches reviewers, reconciles findings, escalates trade-offs) |
| **Product Manager** | Viability & Value | Reviewer + AC contributor (Task subagent) |
| **Product Designer** | Usability & UX/UI Craft | Reviewer + AC contributor (Task subagent) |
| **Product Engineer** | Feasibility & Technical Sustainability | Reviewer + AC contributor (Task subagent) |

No single role "leads" — the main thread coordinates and all three lenses review from their perspective.

## Methodology

Bokata follows Teresa Torres' Product Trio framework combined with:
- **User Story Mapping** (Patton) for feature backbone
- **Example Mapping** for acceptance criteria
- **Walking Skeleton** pattern for incremental delivery
- **Spec-Driven Development** for testable specifications

## Conflict Handling

During trio review, the **main thread** (the command itself) acts as a **neutral orchestrator** — no fourth opinion, no arbitration of product trade-offs. Each reviewer finding is routed into one of three buckets:

- **Non-conflicting** — incorporated directly.
- **Factual / scope conflict** — resolved deterministically against the backbone, ACs, Discovery Context, or constitution, and noted with the artifact that settled it.
- **Genuine product trade-off** (value↔UX / value↔sustainability, no ground truth) — escalated to the human as a **single consolidated decision point** with positions from each lens and a recommended default.

Interactive runs ask before continuing; headless runs (`--no-interactive`, `codex exec`, CI) apply the recommended default and flag the trade-off in `Trio Reconciliation Notes`. Every resolution is recorded in the output artifact.

## License

MIT
