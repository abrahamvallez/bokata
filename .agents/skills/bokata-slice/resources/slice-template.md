# Slice <nn> — <name>

- Initiative: [<initiative>](../pitch.md) · Features: F1, F2
- When it is done, the user can: <one or two sentences — the end-to-end flow>
- Rabbit holes that touch it: <from the pitch, or "none">
- Status: sliced | planned | building | done

<!-- How to read this file
  Scope       = the part of one feature in this slice.
                Unknowns not empty → still uphill (needs the owner); empty → only execution left.
  Increment   = functional on its own. "~" = nice-to-have; the slice is done without it.
  Checklist   = the plan (written by bokata-plan), checked off by the executor commit by commit.
  Tests       = which test covers each acceptance criterion (filled by the executor).
-->

## Scope: <F1 feature name>

- Unknowns: <open questions, or "none">
- Parallel-safe: <yes | no — set by bokata-plan>

### Increment F1-a: <what the user can do or see>  (must-have)

```gherkin
Scenario: <concrete name>
  Given <concrete data>
  When <action>
  Then <observable result>
```

Plan:
- [ ] <step — written by bokata-plan>

Tests:
- <scenario> → <test file> › <test name>

### ~Increment F1-b: <what the user can do or see>  (nice-to-have)

…

## Scope: <F2 feature name>

…

## Notes

- <deviations, discovered scopes, decisions taken while building>

## Trio notes

- <one line per reconciled conflict or trade-off>
