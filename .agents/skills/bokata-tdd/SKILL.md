---
name: bokata-tdd
description: Strict small-step TDD with an acceptance test per increment and evidence rules for every commit — the scenario as a failing acceptance test, then one failing test, the minimum code, a separate refactor, one commit per step. Use it to implement a planned step, a bokata slice, or a bug fix test-first; when the user says TDD, ATDD, red-green-refactor or baby steps; or when an executor agent loads it as its method.
---

# bokata-tdd

Build in **baby steps**. Each step is tested first, made green, refactored and committed
before the next one starts.

## Before the first step

1. Read `AGENTS.md`, the constitution, and the project's coding standards if they exist
   (paths in `.bokata.json` → `memory`; defaults `CONSTITUTION.md`, `CODING_STANDARDS.md`).
   They are binding and win over this skill.
2. Read the plan or slice you were given in full, especially owner decisions and the
   scenarios your steps prove. Owner decisions override older text.
3. Read the code the first step touches. Never assume an API exists: search for it or read
   the installed package's types.
4. Use the project's own commands for tests, lint, type-check, format and build (from
   `AGENTS.md` or the project's manifest). Never invent them.
5. Load the refactor method: the skill named in `.bokata.json` → `methods.refactor` (default
   `bokata-refactor`). Steps 0 and 3 of the loop follow it.

## Acceptance test first, once per increment

An increment is done when its scenario passes, not when its last step is committed. Before the
first step of an increment (acceptance-test-driven development, the outer loop):

1. Write the increment's scenario as **one** test at the highest seam the project's unit test
   runner reaches cheaply — usually the view model or the component, not an end-to-end spec
   unless the project asks for one on this flow. Same Given/When/Then, same domain words.
2. Run it and check it fails for the right reason.
3. Mark it as an expected failure that turns red the moment it passes — Vitest `it.fails`,
   Jest `test.failing`, pytest `xfail(strict=True)` — and commit it on its own as `test(...)`,
   with the failure line in the body. If the runner has no such marker, skip it instead and
   say so.
4. Build the increment with the inner loop below, in the project's build order. The step that
   makes the scenario pass removes the marker **in the same commit**.

If the first step's test already *is* the scenario (a pure domain rule, say), the two loops are
one: skip this.

## The loop, once per step

**0. MAKE THE CHANGE EASY.** If the step would land awkwardly — scattered edits, a function
growing yet another branch — tidy first with the refactor method, in its own `refactor(...)`
commit, then start the step.

**1. RED.** Write **one** failing test taken from the step's scenario. Run only that test and
check it fails *for the right reason* — a missing behaviour, not a typo or an import error.
If it passes at once, the behaviour already exists: keep it as a regression guard in its own
`test:` commit and say so.

**2. GREEN.** Write the **minimum** code that makes it pass. Faking or hard-coding is fine while
one test does not force the general case; triangulate with the next test. Write no code that
no failing test asks for.

**3. REFACTOR.** With everything green, refactor with the refactor method: Kent Beck's four
rules of simple design as the arbiter, one behaviour-preserving move at a time.

For a non-trivial step, ask the `design-reviewer` subagent to review the step's diff and apply
its findings (no subagents available? review the diff yourself with the same method).
A refactor changes structure only: run the tests before and after, and commit it on its own
as `refactor(...)`, never mixed with `feat`/`fix`.

**4. VERIFY.** Run the touched tests. At the end of each step, run the full test suite, lint
and type-check. Format only the files and hunks you touched.

**5. COMMIT.** One Conventional Commit per step — `type(scope): imperative summary` — with a
body that says *why*. Stage explicit paths, never everything. Never push, never stash, never
amend or rebase.

## Step size

About one test file and one or two production files. If a step grows past that, split it
(a/b/c) before committing and note the split. Work from the inside out, in the order the
project builds (see `AGENTS.md`), each layer test-first.

## Evidence rules

Every claim needs proof — see [resources/evidence-rules.md](resources/evidence-rules.md).
The short version: prove RED in the commit body, never commit red, never claim "already
implemented" without the test and commit that prove it, and record the real gate output.

## Working from a bokata slice

If your input is `slices/<nn>-<name>.md`: check off each plan step **in the same commit** as
the step, fill the increment's `Tests:` lines (scenario → its acceptance test), and keep the scope's
`Unknowns` current. Tests are named by behaviour in the domain's words — never by an
acceptance-criterion ID.

## Stop and ask

Stop and ask (the user, or whoever launched you) when:
- a scenario, an ADR, an owner decision and the plan disagree;
- a requirement has two readings;
- a step needs a new dependency or an architectural pattern no ADR covers;
- a behaviour change appears outside the step's scenario (a new message, a changed flow);
- a test fails and you cannot explain why after one honest attempt.

Do not guess and continue.

## Reporting

At the end, run the project's full definition of done and report the real output lines, the
number of commits, deviations from the plan, and any checks still pending (for example a
browser check for layout). Never claim green without running it.
