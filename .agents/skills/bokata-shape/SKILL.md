---
name: bokata-shape
description: Shape a raw idea into a pitch before any building — grill the user to narrow the problem, sketch 2-3 approaches as breadboards, run one Product Trio pass over them, settle rabbit holes and no-gos, and write pitch.md. Use it when the user wants to start an initiative, refine or discover what to build, shape an idea, or says "shape", "grill this idea" or "let's work out what to build".
---

# bokata-shape

Turn a raw idea into a **pitch**: a rough, solved and bounded description of what to build,
in the spirit of Shape Up. The pitch is temporary working material. The code stays the
source of truth.

Talk to the user in their language. Write the pitch in the language of the project's docs
(default: the user's language).

## Configuration

Read `.bokata.json` at the project root if it exists. Defaults:

```json
{ "docs": "docs/initiatives",
  "memory": { "constitution": "CONSTITUTION.md", "glossary": "CONTEXT.md",
              "adrs": "docs/adrs", "adr_template": null },
  "templates": { "pitch": null },
  "methods": { "grill": "grill-with-docs" } }
```

A memory file that does not exist is skipped, never created empty. `templates.pitch: null`
means [resources/pitch-template.md](resources/pitch-template.md).

## Before you start

1. Read the constitution, the glossary and the ADR index if they exist.
2. Ask for the initiative name if it is not given. Use a kebab-case slug.
3. If `<docs>/<slug>/pitch.md` exists, resume it: read it and continue from what is missing.

## 1. Narrow the problem (grill)

Load the skill named in `methods.grill` (default `grill-with-docs`; fall back to `grill-me`,
or to the rules below if neither is installed) and follow it, with these bokata rules on top:

- One question at a time, each with your recommended answer.
- Facts come from the code: explore it (use a read-only explore subagent if your harness has
  one) instead of asking the user what the code already says. Decisions belong to the user.
- Keep coming back to the Shape Up question: **"what is the specific situation where the
  current way fails?"** Design for that case, not for an abstraction.
- Glossary terms and ADRs are written **inline, when they settle**, at the paths in `memory`.
  If the grill skill wants other paths (for example `docs/adr/`), use the configured ones.
  Use `memory.adr_template` if set, otherwise [resources/adr-template.md](resources/adr-template.md).
- Offer an ADR only when all three hold: hard to reverse, surprising without context, and the
  result of a real trade-off.

Stop grilling when the problem is narrow enough that two people would sketch roughly the
same solution space.

## 2. Find the elements (2–3 approaches)

Sketch two or three approaches at the right altitude: concrete enough to judge, rough enough
to leave room for design. Follow [resources/breadboarding.md](resources/breadboarding.md):

- every approach gets a **Mermaid breadboard** (places, affordances, connections);
- add a **low-fi fat-marker sketch** (HTML) only when spatial layout is part of the decision.

## 3. Trio pass over the approaches

Run the Product Trio **once** over the approaches — not during the grill.

**Execution constraint (critical):** issue the three subagent calls together in a single
message and wait for all three (Task/Agent in Claude Code, `task` in OpenCode, `spawn_agents`
in Codex, subagents in Cursor). If your harness has no subagents, run the three lenses
yourself one after another, each as a separate pass, and say so.

Give each subagent the narrowed problem, the 2–3 approaches with their breadboards, the
ambition, and the constitution path, plus: *"Do NOT ask the user questions. State
assumptions instead. Tag every finding with Severity (Critical|Suggested) and Type
(factual/scope|trade-off). Return your review in the format specified in your agent file."*

- **`bokata-product-manager`:** does each approach solve the narrowed problem? Is it worth it
  at this ambition? What should be a cut or a no-go?
- **`bokata-product-designer`:** is the flow between places coherent? Which places or
  affordances are missing (empty, error, permission states) or superfluous?
- **`bokata-product-engineer`:** which rabbit holes does the real code hide? What is risky or
  hard to reverse? What needs a spike?

Reconcile as a **neutral coordinator** (no fourth opinion): apply non-conflicting
improvements; settle factual conflicts against the code, constitution or ADRs and note them;
collect genuine trade-offs into **one** decision point with each lens's position and a
recommended default (the smaller, reversible option).

Then let the user **choose the approach**, the no-gos and the cuts. Rabbit holes are either
resolved (write the decision), cut (out of scope) or declared a no-go.

## 4. Write the pitch

Write `<docs>/<slug>/pitch.md` from the template. No time estimates or appetite numbers:
instead write one **ambition** line (for example "minimum a coach can use in a real match"
or "fully polished"). It is the tie-breaker when choosing between two solutions.

Self-review before you show it: no placeholders, no contradictions, every rabbit hole has an
outcome, every no-go is explicit.

## 5. Size and next step

Propose a size and let the user confirm it:

| Size | Meaning | Next |
|---|---|---|
| **S** | A fix or a tweak; no pitch was really needed | Plan mode + `bokata-tdd` |
| **M** | One clear feature | `bokata-slice` (single-agent mode, the pitch is the feature) |
| **L** | Several features | `bokata-feature-map` |

Record the size in the pitch and end with one line: `Next: <skill> <slug>`.
