# Phase 3: Coverage Check and Walking Skeleton

Take the complete trace (User Tasks → Steps → Options), check it against the functional ACs, and
propose the **Walking Skeleton**: one combination of options per User Task that makes the whole
Feature work end to end with the least. Every option stays in the trace — the ones the skeleton
does not use stay in the trace for now: Phase 4 prunes them and groups what is left into the
bites later increments are composed from.

**No durations.** "Simplest" = fewest dependencies, least infrastructure, most reversible. Never
write "buildable in N days".

---

## Step 1: Map the trace

#### 🧠 Think:
- Which User Tasks (and System Tasks) does this Feature have?
- How many Steps per User Task, how many options per Step?
- Did every Step get ≥3 options, ≥2 strategies and a cheap-family option? If not, go back to Phase 2.

---

## Step 2: Coverage check (now, not before)

The functional ACs were kept aside during Phases 1–2 so they would not drag the slicing into
copying requirements. Open them now.

#### ▶️ Execute:
1. For each Requirement, list the options that cover it and how:
   - `total` — the requirement holds as written
   - `partial` — part of it holds (one case, one format, one user type)
   - `fake` — it looks true to the user, backed by hardcoded data or a manual crutch
2. A Requirement no option covers is a gap in Phase 2: add the option it needs to the right Step.
3. **Do not rewrite options to mirror requirements.** Partial and fake coverage is how the
   skeleton stays small.

Output: the `### Coverage` block (one line per Requirement) and `covers R<n> <how>` on each option.

---

## Radical Slicing Challenge (before picking)

Per Step ask: **"If we had to ship tomorrow, which option would we choose?"** If the answer differs
from your first instinct, use it. The skeleton should feel uncomfortably minimal; if it feels
comfortable, it is still too big.

---

## Step 3: Pick the Walking Skeleton

#### 🧠 Think:
For each User Task, for each Step:
- Which option is genuinely the simplest — compared across all of them, not just `.1`?
- Does the combination still let the user complete the User Task end to end (UI → Logic → Data)?
- Is each pick reversible? (Data layer especially: can it be undone without data loss or a migration?)
- Is a cheap-family option (fake data, crutch, one case only) enough here?

#### ▶️ Execute:
1. Choose one option per Step that the User Task needs; skip Steps that are optional for the flow.
2. Every User Task must be represented. System Tasks that User Tasks depend on come first.
3. Write the skeleton as **option IDs per User Task**, plus one line of what the user can do.
4. Add a `Why:` line for every pick that is not the lowest-numbered option, or that trades
   simplicity for reversibility.

Selection rules:
- Option numbering is a complexity hint, not a mandate.
- Prefer reversible options over irreversible ones.
- Better a clumsy but working full flow than a perfect but incomplete fragment.
- The skeleton's options may cover requirements only `partial` or `fake` — that is expected.

---

## Step 4: Validate

1. Every User Task is in the skeleton (no gaps).
2. The combination works end to end; the user could try it tomorrow.
3. It is the MINIMUM, not just "simple".
4. Descriptions say what the user can do or see — technology names OK; endpoints, field schemas,
   function or class names not OK.
5. The Self-check counts match the trace.

If validation fails, revisit Step 3.

---

## OUTPUT FORMAT

The skeleton and coverage blocks of the skill's output (see SKILL.md → Output):

```markdown
### Coverage
- R1 Coach sees the clip list — F1-1.1 fake, F1-1.2 total
- R2 List is sorted by date — F1-1.3 total

### Walking Skeleton proposal
- **[Picks a clip]** F1-1.1 + F1-2.1 — coach picks from a hardcoded list of 3 clips; the pick lives in memory
- **[Shares the clip]** F1-3.2 + F1-4.1 — coach copies a link and pastes it into the team chat by hand
- Why: F1-3.2 over F1-3.1 — a link needs no player accounts; F1-3.1 would force sign-up first
```

---

## EXAMPLES

### Good Walking Skeleton ✅

```markdown
- **[Records Audio]** F1-1.1 + F1-3.1 — coach records with the browser microphone; audio is kept in LocalStorage
- **[Organizes Library]** F1-5.1 + F1-6.1 — a simple list of recordings read from LocalStorage
- **[Plays Audio]** F1-7.1 — basic playback with the browser audio element
```

Why it works: every User Task is there, each one works end to end, it uses the cheapest options
(browser APIs, LocalStorage, plain list), and it could ship tomorrow.

### Same skeleton written wrong ❌

```markdown
- **[Records Audio]** POST /recordings {blob, mime_type, duration_ms} — raw audio to S3 bucket
- **[Organizes Library]** GET /recordings → [{id, title, created_at}] — queries recordings table
```

Code-level details (endpoints, field schemas) instead of what the user can do, and the most
expensive options instead of the cheapest.

### Bad Walking Skeleton ❌

```markdown
- Setup audio processing pipeline
- Create database schema
- Implement authentication
```

Generic infrastructure tasks, not option IDs; no User Task tags; no end-to-end user flow.

---

## COMMON ISSUES

**"Walking Skeleton too complex"** → Compare every option per Step; pick the one with the fewest
dependencies. Do not default to `.1`.

**"Not all User Tasks in the skeleton"** → Every User Task must be represented, even if minimal
(a fake or manual option is fine).

**"Every option in the skeleton covers its requirement totally"** → You mirrored the ACs. Look
for the `fake` / `partial` option of each Step; if none exists, Phase 2 is missing the cheap family.

**"Skeleton items contain endpoint signatures, schemas or function names"** → Each line answers
"what can the user do or see?"
  ✅ "[Comment on clip] F1-2.1 — text field on the player timeline; the comment is saved"
  ❌ "[Comment on clip] POST /comments { content_id, timestamp_ms, text }"
