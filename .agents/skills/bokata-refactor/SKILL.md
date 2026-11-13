---
name: bokata-refactor
description: Refactor safely in tiny behaviour-preserving moves — Kent Beck's four rules of simple design as the arbiter, Tidy First? tidyings, Fowler's code smells mapped to the move that fixes each, and coupling and cohesion as the reason to tidy. Use it in the refactor phase of a TDD step, before a step to make the change easy, when reviewing a diff for design, or when the user says refactor, tidy, clean up, code smell or simple design.
---

# bokata-refactor

A refactor changes **structure, never behaviour**. It is made of small moves, each one leaving
every test green, and it is committed apart from any behaviour change.

The project's constitution and coding standards (paths in `.bokata.json` → `memory`; defaults
`CONSTITUTION.md`, `CODING_STANDARDS.md`) win over everything here.

## The arbiter: four rules of simple design

Kent Beck's rules, in priority order. An earlier rule wins over a later one.

1. **Passes the tests.** Every test passes, guard tests included. Tests describe behaviour
   from the scenarios, not the implementation: flag a test that asserts internals, a missing
   edge case the scenario implies, or a test that would still pass if the code were wrong.
2. **Reveals intention.** Names come from the project's glossary and the scenarios, so a reader
   understands the code without the plan. Vague names (`data`, `handle`, `util`, `tmp`),
   functions that do two things, booleans that should be named states and magic numbers that
   should be named constants all break it.
3. **No duplication.** Each piece of *knowledge* — a rule, a threshold, a shape, a mapping —
   has one place, across every layer. Two lines that look alike but change for different
   reasons are not duplication; leave them.
4. **Fewest elements.** Nothing the tests and the first three rules do not need: no unused
   parameter, speculative option, single-use abstraction, wrapper layer, dead branch or file.

Stop when the code meets the four rules. Refactoring further is gold-plating.

## When to refactor

- **Before a step — make the change easy, then make the easy change.** If the next behaviour
  would land awkwardly (scattered edits, a function that must grow a third branch), tidy
  first, so the change itself is small.
- **After green** — the refactor phase of every TDD step.
- **Not otherwise.** Tidy what the current or next change touches. Code nobody is changing is
  left alone (*tidy later* or *never*), however untidy it looks.

The reason to tidy is the cost of the next change, and that cost is **coupling**: elements that
must change together. Tidy toward **cohesion** — what changes together lives together — and
away from coupling across modules. If a tidying does not make a coming change cheaper or the
code easier to read now, skip it.

## How to move

1. Name what you see — the rule it breaks, or the smell from
   [resources/smells.md](resources/smells.md) — and the move that fixes it.
2. Run the tests: they must be green before you start.
3. Make **one** move: a tidying from [resources/tidyings.md](resources/tidyings.md) or the
   move the smell points to.
4. Run the tests. Green → next move. Red → **undo the move**; do not fix forward. A red test
   during a refactor means behaviour changed, or the test is coupled to the implementation:
   find out which and say so.
5. Commit structure on its own (`refactor(scope): …`), never mixed with `feat` or `fix`. If a
   move needs a new test or widens behaviour, it is not a refactor: stop and treat it as a
   step.

Keep moves small enough that undoing one costs nothing. Several moves can share one commit when
they serve one purpose.

## Principles, as evidence

SOLID, KISS, DRY, YAGNI and object calisthenics are not checked as rules on their own. Each one
shows up in the code as a smell; act on the smell you can point at, with
[resources/smells.md](resources/smells.md) as the map. A principle with no smell in the diff
is not a finding.
