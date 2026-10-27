# Tidyings

Kent Beck's tidyings (*Tidy First?*): the smallest structure changes, each safe on its own.
Reach for them first; most refactors are a few of these in a row.

| Tidying | Do it when |
|---|---|
| **Guard clauses** | Nested conditions hide the main path: return early on the edge cases |
| **Dead code** | Code nothing calls or no test needs: delete it (version control remembers) |
| **Normalize symmetries** | The same thing is done in two different ways: pick one and use it everywhere |
| **New interface, old implementation** | The interface you wish you had is missing: write it and call the old code from it |
| **Reading order** | A reader meets the parts in the wrong order: reorder them for the reader |
| **Cohesion order** | Elements that change together sit apart: move them next to each other |
| **Move declaration and initialization together** | A variable is declared far from where it gets its value |
| **Explaining variable** | A sub-expression needs a name to be understood |
| **Explaining constant** | A literal carries meaning (a limit, a threshold): name it |
| **Explicit parameters** | A function reads what it needs from a big bag or ambient state: pass it in |
| **Chunk statements** | A block does several things: separate the chunks with a blank line |
| **Extract helper** | A chunk has one purpose and a name: give it a function |
| **One pile** | Code is split so finely it can no longer be understood: inline it into one place first, then tidy again |
| **Explaining comment** | Something is not obvious from the code and cannot be made so: write down why |
| **Delete redundant comment** | A comment says what the code already says |

## Tidy first, after, later or never

- **First** — the tidying makes the next change cheaper and is quick.
- **After** — you will touch this code again soon, and now you understand it.
- **Later** — worth doing but not now: note it where the project tracks such work.
- **Never** — the code will not change again, or the tidying buys nothing.

Tidyings go in their own commit, separate from behaviour changes.
