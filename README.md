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
├── bokata-product-manager.md
├── bokata-product-designer.md
└── bokata-product-engineer.md

commands/                     ← Orchestration by execution model
├── task-parallel/            ← Claude Code + Cursor + OpenCode (Task tool)
└── codex/                    ← spawn_agents parallel
```

## Product Trio Roles

| Role | Lens | Leads |
|------|------|-------|
| **Product Manager** | Viability & Value | Feature Mapping |
| **Product Designer** | Usability & UX/UI Craft | Reviews |
| **Product Engineer** | Feasibility & Technical Sustainability | Feature Slicing |

## Methodology

Bokata follows Teresa Torres' Product Trio framework combined with:
- **User Story Mapping** (Patton) for feature backbone
- **Example Mapping** for acceptance criteria
- **Walking Skeleton** pattern for incremental delivery
- **Spec-Driven Development** for testable specifications

## License

MIT
