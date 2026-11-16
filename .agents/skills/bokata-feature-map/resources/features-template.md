<!-- Initiative: {initiative-name} | Date: {YYYY-MM-DD} | Source: {pitch.md | PRD | notes} -->

# {Initiative name} — Features

<!-- The backbone uses bokata-feature-mapper's output format unchanged; each User Task carries
     its functional ACs (bokata-acceptance-criteria --functional) right below it, and each
     Feature ends with a one-line `**Slice:**` summary that bokata-slice fills. This file is the
     summary: the slicing (Steps, options, increments, backlog) lives in slices/<nn>-<name>.md.
     Single mode (bokata-slice from a pitch) writes `<!-- Mode: single -->` and keeps only the
     one Feature's header, Purpose, User Task names and Slice line. -->

## Features Backbone

### Feature Overview
[Brief narrative of the complete user journey, 2-3 sentences]

---

### Features Map

#### Feature: [Actor] [Verb] [Object]
<!-- ID: {PRJ}-FEAT-{hash} -->
**Purpose:** [What the user accomplishes with this feature]

##### User Task: [Verb] [Object]
<!-- Task ID: {PRJ}-TASK-{hash} -->
[One-line description of what the user does]

###### Requirement: [Requirement summary]
The system SHALL [requirement statement].

- **Scenario: [name]** — **WHEN** [trigger] **THEN** [observable result]
- **Scenario: [variant name]** — **WHEN** [alternate trigger] **THEN** [observable result]

##### User Task: [Verb] [Object]
<!-- Task ID: {PRJ}-TASK-{hash} -->
[One-line description]

###### Requirement: [Requirement summary]
The system SHALL [requirement statement].

- **Scenario: [name]** — **WHEN** [trigger] **THEN** [observable result]

##### System Task {N}.{M}: [Verb] [Object]
**Trigger:** [workflow transition that fires it — e.g. "order confirmed", "session expired"]
The system [description of what it executes and what it produces].

---

**UI States:**
- [State name]: [Description]
- [State name]: [Description]

**Slice:** not sliced yet
<!-- Set by bokata-slice: → {nn-name} · {taken}/{total} options · next: {bite ID} {bite title} [· done] -->

---

#### Feature: [Actor] [Verb] [Object]
<!-- ID: {PRJ}-FEAT-{hash} -->
**Purpose:** [What the user accomplishes with this feature]

…

---

### Feature Dependencies
- **Critical**: [Feature X] must exist before [Feature Y]
- **Recommended**: [Feature A] before [Feature B]
- **Independent**: [Features] can be done in any order

---

### Constitution Compliance
- [ ] All Features align with stated architecture principles
- [ ] No prohibited patterns introduced
- [ ] Security requirements addressed
- [ ] Non-goals respected (no out-of-scope features added)

---

## Trio Reconciliation Notes
- [One line per (b)/(c) outcome, citing the artifact or the user's choice]
