# Phase 4: Bite-sizing

Phase 2 explores: 3+ options per Step, with quotas, so nothing cheap or smart is missed. That
produces filler, and nothing so far removes it. Phase 4 is the synthesis that was missing: it
prunes the trace, sets where each Step should end up, and groups what is left into small
**bites** a human can read and prioritize at a glance.

Run it on the **whole trace**, after the Coverage check and the Walking Skeleton. The owner never
reads 180 loose option IDs; they read 8–12 bites.

**No durations.** Size a bite by its options and the Steps it touches, never by time.

---

## Step 1: Prune, with a reason

Go through every option that is **not** in the Walking Skeleton. Discard it only for one of these
reasons, and write the reason:

| Reason | Means | Example |
|---|---|---|
| `obsolete` | Sits below the option the skeleton chose for the same Step: building it now would be a step back | Skeleton takes F5-4.2, so F5-4.1 (a weaker way to do the same Step) is obsolete |
| `dominated` | Another option gives clearly more for a similar cost | "Hold to undo" vs a plain Undo button that costs the same |
| `filler` | Adds nothing; it exists only to meet the 3-option quota | "Reset with a long press" next to a visible Reset button |
| `contradicts` | Goes against the PRD, an ADR, the constitution or the Discovery Context | An option that needs sign-up when the Discovery Context says no accounts |

Rules:
- **Never discard** an option of the skeleton, one marked `deferred`, or one an Inc has already
  taken (`→ Inc n`, when re-pruning after `--next`): the story map resolves each Inc's `Options:`
  through the trace.
- A discard needs one of the four reasons. "I prefer the other one" is not a reason; when two
  options are genuine alternatives, keep both and let a bite choose.
- **Delete discarded options from the trace.** They do not stay as crossed-out lines. The output
  keeps only the `### Pruned` list with each ID, its title and its reason, so a reviewer can
  object. IDs are never renumbered: a gap in the numbering is fine.
- Pruning is not shrinking for its own sake. When unsure between `filler` and "cheap and
  useful", keep it.

---

## Step 2: Target per Step

For every Step, mark the option the slice **should reach when it closes** — the best option for
that Step given what the Feature promises. Write `→ target` on that option.

- The target can be the skeleton's own pick (nothing more is needed in that Step).
- A Step whose target is above the skeleton pick is where the bites will come from.
- One target per Step. If two options seem equally right, they are not alternatives: they are
  two improvements, and the second belongs in a bite, not in the target.

---

## Step 3: Group the live options into bites, per User Task

Every **live** option (not pruned, not in the skeleton, not `deferred`) goes into **exactly one**
bite. Group options that belong together:

- **Accumulating improvements** that build on each other (mark the cut cell, on top of the line
  already drawn).
- **Pieces that only have value together** (announce the loss in the confirmation, together with
  the mark on the cut cell).
- **Options that depend on each other** across Steps, or across User Tasks of the same Feature.

A bite belongs to **one Feature**: you only see your own Feature's trace. When it needs something from
another Feature, say so in `depends on` with that bite's ID (`depends on: F7-b`); do not mix their options.

Do **not** put two real alternatives (two ways to do the same thing) in the same bite: pick one
as part of the bite, and the other is either pruned (`dominated`) or its own bite.

Each bite carries:

| Field | Content |
|---|---|
| ID | Stable, per Feature: `F1-a`, `F1-b`, … (letters; they never change once written) |
| Title | **A sentence in user language, with a subject**, readable with no context: "Ana sees which defender cuts her pass", not "F5-6.3 Mark the cut cell" |
| Priority | `must-have` or `~nice-to-have`. Must-have = the slice is not finished without it |
| Options | The option IDs, with the Steps they come from |
| Depends on | Another bite ID, `Inc 1`, or `none`. Bite dependencies must not form a cycle |
| Value | One line: what the user gets that they did not have |
| Check | One sentence: how to tell it works, concrete enough to turn into a scenario later |

Bite INVEST test (all must hold, or split or merge it):
- **Independent** — it can be built after its stated dependencies, in any order among the rest.
- **Negotiable** — options inside it can be swapped for alternatives without changing its value.
- **Valuable** — the user can see or do something new when it is done.
- **Estimable** — its options are specific enough for the engineer to size.
- **Small** — about 5 options or fewer. Over that, split it.
- **Testable** — the Check line is something a test can say yes or no to.

`deferred` options go in their own bites, labelled `deferred (<reason, e.g. needs F9>)`, apart
from the live ones. If a deferred bite is big, say it must be pruned and split when it is
recovered.

A bite may touch several Steps, and a User Task may have one bite or many. A bite may
cover every Step of a User Task, or just one: let the value decide, not the Step boundaries.

---

## Step 4: Self-check

Recount after pruning and bite-sizing. The numbers must agree:

- Options in the trace = skeleton + in bites + deferred (nothing else).
- **Options without a bite: 0.** **Options in two bites: 0.**
- Pruned by reason: `obsolete` n · `dominated` n · `filler` n · `contradicts` n.
- Steps with a target: n/n.
- Bites: n (`must-have` n · `~nice-to-have` n · deferred n), each with all its fields, none
  over ~5 options.

---

## OUTPUT FORMAT

The blocks added to the skill's output (see SKILL.md → Output). In the trace, each live option
carries its bite and each Step its target:

```markdown
- **S6 Mark the cut cell** · UI — …
  - F5-6.1 List teammates … · <strategy> · F5-h
  - F5-6.3 Mark the cut cell on the line … · <strategy> · covers R3 total · F5-a
  - F5-6.4 Label the long pass … · <strategy> · covers R4 partial · F5-c → target
  - strategies: …

### Pruned
- F5-5.1 Give every line as free — `filler`: exists only to meet the quota; the skeleton option already works
- F5-4.1 Cut only straight lines — `obsolete`: below F5-4.2, the skeleton pick for S4

### Bites
- **[Pass the ball]**
  - F5-a · Ana sees which defender cuts her pass and where (must-have) — F5-6.3, F5-8.3 · depends on: Inc 1 · value: she knows the risk before confirming · check: with the fixture defence, the line to C is marked on (8,9), PG's cell
  - ~F5-b · Ana sees the ball travel to the receiver (nice-to-have) — F5-10.3 · depends on: Inc 1 · value: the pass feels real · check: the ball runs (8,10) → (12,8) before "Pass completed"
- **Deferred**
  - F5-x · The buzzer (deferred: needs F9) — F5-3.3, F5-16.1 … · prune and split when recovered
```

Bad vs good title:
- ❌ "F5-6.3 Mark the cut cell" — a Step-level name; lost outside its Step
- ✅ "Ana sees which defender cuts her pass and where" — a user, an action, a result
