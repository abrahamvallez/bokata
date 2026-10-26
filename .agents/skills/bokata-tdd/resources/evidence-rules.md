# Evidence rules

They come from real executor failures: commits that claimed RED without one, "already
implemented" with no proof, reformatted neighbours, progress rows saying "pending".

1. **Prove RED.** Each `feat`/`fix` commit body names the failing test and the failure line
   seen before GREEN, e.g. `RED: "counts the moments after the new end" — expected 2, received 0`.
2. **A test that passes at once is a `test:` commit.** Characterisation tests and guards that
   pass immediately go in their own `test:` commit, even when they arrive with a feature.
3. **Never claim "already implemented"** without naming the test that proves it and the
   commit that added it.
4. **Never commit red.** When a change alters an existing expectation, run the full suite
   before that commit and change the assertion in the same commit, with the reason.
5. **Never delete or weaken an existing test** to get green. If behaviour truly changed,
   change that one assertion and explain it in the commit body.
6. **Format only your hunks.** Format new files fully; in existing files keep your own lines
   formatted and never reformat neighbouring code or tables.
7. **No production code shaped for a test double.** If a test needs a seam, test the pure rule
   and keep the production code idiomatic.
8. **No speculative branches in tests.** No casts or conditionals in assertions; one behaviour
   per test; assert a refusal by its exact value.
9. **Record gate output per step.** Wherever progress is tracked, write the test-count line of
   that step's full run and the real commit hash. Never "pending" or "(this run)".
10. **A behaviour change outside the step's scenario** is a stop-and-ask, not a deviation note.
11. **A refactor is structure only.** If it adds tests or widens behaviour, it is a `feat`.
12. **Split, don't report.** If a step grows past about one test file and two production files
    (four at most), split it before committing, unless the plan marks it indivisible.
