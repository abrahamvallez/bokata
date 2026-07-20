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

### Option 1: Clone this repo into your project

```bash
# Clone into your project root
git clone https://github.com/abrahamvallez/bokata.git .bokata-temp
mv .bokata-temp/.agents .
mv .bokata-temp/agents .
mv .bokata-temp/commands .
mv .bokata-temp/install.js .
mv .bokata-temp/package.json .
mv .bokata-temp/README.md .
rm -rf .bokata-temp

# Run install (detects harnesses automatically)
node install.js
```

### Option 2: Use as npm package (future)

```bash
npx @bokata/skills install
```

The install script automatically detects which harnesses you have (`.claude/`, `.opencode/`, `.cursor/`, `.codex/`) and installs the appropriate skills, agents, and commands.

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
.agents/skills/               ← Open standard (all harnesses read here)
├── bokata-feature-mapper/    ← User Story Mapping methodology
├── bokata-feature-slicer/    ← Walking Skeleton + Increments
└── bokata-acceptance-criteria/ ← Gherkin AC generation

agents/                       ← Pure prompts (harness-agnostic)
├── bokata-product-coordinator.md  ← Neutral orchestrator (invokes skills, launches reviewers, reconciles)
├── bokata-product-manager.md      ← Viability & Value lens (reviewer + contributor)
├── bokata-product-designer.md     ← Usability & UX/UI Craft lens (reviewer + contributor)
└── bokata-product-engineer.md     ← Feasibility & Technical Sustainability lens (reviewer + contributor)

commands/                     ← Orchestration by execution model
├── task-parallel/            ← Claude Code + Cursor + OpenCode (Task tool)
│   ├── feature-map.md        ← Dispatcher → coordinator (Task subagent) → write output
│   └── slice-feature.md      ← Dispatcher → coordinator (Task subagent) → write output
└── codex/                    ← spawn_agents parallel
    ├── feature-map.md        ← Coordinator runs in main thread
    └── slice-feature.md      ← Coordinator runs in main thread
```

## Product Trio Roles

| Role | Lens | Role Type |
|------|------|-----------|
| **Product Coordinator** | Neutral orchestration | Invokes skills, launches reviewers, reconciles findings |
| **Product Manager** | Viability & Value | Reviewer + AC contributor |
| **Product Designer** | Usability & UX/UI Craft | Reviewer + AC contributor |
| **Product Engineer** | Feasibility & Technical Sustainability | Reviewer + AC contributor |

No single role "leads" — the coordinator invokes skills and all three lenses review from their perspective.

## Methodology

Bokata follows Teresa Torres' Product Trio framework combined with:
- **User Story Mapping** (Patton) for feature backbone
- **Example Mapping** for acceptance criteria
- **Walking Skeleton** pattern for incremental delivery
- **Spec-Driven Development** for testable specifications

## Conflict Handling

During trio review, the **Product Coordinator** (running as a Task subagent in OpenCode/Claude/Cursor, or as the main thread in Codex) acts as a **neutral orchestrator** — no fourth opinion, no arbitration of product trade-offs. Each reviewer finding is routed into one of three buckets:

- **Non-conflicting** — incorporated directly.
- **Factual / scope conflict** — resolved deterministically against the backbone, ACs, Discovery Context, or constitution, and noted with the artifact that settled it.
- **Genuine product trade-off** (value↔UX / value↔sustainability, no ground truth) — escalated to the human as a **single consolidated decision point** with positions from each lens and a recommended default.

Interactive runs ask before continuing; headless runs (`--no-interactive`, `codex exec`, CI) apply the recommended default and flag the trade-off in `Trio Reconciliation Notes`. Every resolution is recorded in the output artifact.

## License

MIT
