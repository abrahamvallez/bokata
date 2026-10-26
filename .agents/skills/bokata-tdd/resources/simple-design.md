# Kent Beck's four rules of simple design

Apply them in priority order. An earlier rule wins over a later one.

1. **Passes the tests.** Every test passes, including guard tests that protect boundaries.
   Tests describe behaviour from the scenarios, not the implementation. Flag a test that
   asserts internals, a missing edge case the scenario implies, or a test that would still
   pass if the code were wrong.
2. **Reveals intention.** Names come from the domain and the scenarios, so a reader understands
   the code without the plan. Flag vague names (`data`, `handle`, `util`, `tmp`), functions
   that do two things, booleans that should be named states, and magic numbers that should be
   named constants.
3. **No duplication.** Each piece of knowledge — a rule, a threshold, a shape, a mapping — has
   one place, across every layer. Point to the one place it should live.
4. **Fewest elements.** Nothing the tests do not need: no unused parameter, speculative option,
   single-use abstraction, wrapper layer, dead branch or extra file.

The project's own coding standards (business rules in the domain, styling rules, boundaries)
are checked alongside these four.
