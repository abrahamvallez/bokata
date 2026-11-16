# Phase 2: Incremental Option Generation

Apply breakdown strategies to create multiple implementation options for each step. Each option represents a specific, independently deployable implementation variant. This enables you to choose the simplest path first and progressively enhance.

---

## INCREMENTAL OPTION PRINCIPLES

### Option Characteristics
- **Self-Contained:** Each option can be implemented and deployed independently.
- **Specific:** Describes EXACTLY what is being done (e.g., "Manual CSV Export" vs "Implement export").
- **Strategy-Driven:** Each step must declare which breakdown strategies were applied.
- **Naming Format:** `[Action] [Object]` (e.g., "Export to CSV", "Cache with Redis")

---

## BREAKDOWN STRATEGIES

Refer to [Strategies Toolkit](breakdown-strategies.md) for detailed descriptions and examples.

---

## WORKFLOW

**Important:** Think step-by-step before generating incremental options.

### Step 1: Identify All Steps

1. Take the Phase 1 output (the Steps of every User Task)
2. For each User Task, list its Steps
3. Extract for each step: name, description, layer (UI/Logic/Data/Integration), and any technical notes
4. Create a complete list of all steps requiring incremental options

---

### Step 2: For Each Step - Analyze & Generate Options

#### 🧠 Think:
For each step:
- What makes this step "good"? (speed, accuracy, simplicity, security, reliability)
- What are the key tradeoffs? (complexity vs. power, speed vs. accuracy)
- What variations could exist? (formats, interfaces, data types, rules)
- Which breakdown strategies apply to this step?
- Can I use Zero/One/Many? (build for no items → one item → many items)
- Can I simplify workflows? (remove optional steps, reduce validations)
- Can I narrow data types? (single format → multiple formats)
- Can I start with dummy data? (hard-coded → API-driven)
- Can I split by capacity? (10 items → 1000 items → unlimited)
- What linguistic patterns indicate breakdown opportunities?
  - "and/or" → Zero-One-Many split
  - "manage" → CRUD separation
  - "before/after" → Workflow phases
- What's the SIMPLEST possible implementation?
- What's the next level up in complexity/capability?
- What's the most advanced/complete version?
- [List applicable strategies and potential options]

#### ▶️ Execute:

**2.1: Identify the critical quality dimension**

Don't list quality attributes as a checklist — use them as decision guides:
- What matters most for this step? (speed, accuracy, simplicity, security, reliability)
- Ensure at least one generated option optimizes for **simplicity** (the Walking Skeleton candidate)
- Ensure at least one option optimizes for the **most critical quality dimension** of this step
Let the quality dimension shape which options you generate, not the other way around.

**2.2: Determine Applicable Strategies**

1. Review the [breakdown strategies toolkit](breakdown-strategies.md)
2. Select 2-3 strategies that apply to this step
3. Consider strategy combinations (e.g., Zero/One/Many + Workflow Simplification)

Example: "Capture Search Input" step
- Zero/One/Many: No search → single query → multiple filters
- Workflow Simplification: Basic search → with advanced filters
- UI Fidelity: Input field → with suggestions → autocomplete
- Data Variation: Text → Text+voice → Natural language

**2.3: Generate Incremental Options**

For each step, create 3+ incremental options by:
1. Applying 2-3 different breakdown strategies
2. Creating incremental options for each strategy progressively
3. Combining options from different strategies where applicable
4. Ordering from simplest to most complex
5. Naming each option using `[Action] [Object]` format

Validate each step's options:
- Minimum 3 options per step (aim for 4)
- At least one cheap-family option (Crutches, Dummy to Dynamic, Zero/One/Many…)
- All options specific (not generic)
- Dependencies explicit
- Progression clear (simple → advanced)
- Naming and formatting consistent

**Example: "Store Audio" step**
```
1.1: Save to Browser LocalStorage
  - Simplest, no backend needed
  - Applied Strategy: Dummy to Dynamic (local storage is simplest)

1.2: Save to Device FileSystem
  - More storage space available
  - Applied Strategy: Split by Capacity (more storage)

1.3: Upload to Cloud Storage
  - Requires backend/API
  - Applied Strategy: Dummy to Dynamic (dynamic cloud storage)

1.4: Multi-format Support
  - WAV, MP3, OGG options
  - Applied Strategy: Data Variation (multiple formats)

1.5: Compression Pipeline
  - Reduces file size
  - Applied Strategy: Extract Basic Utility (enhance with compression)
```

---

### Step 3: Generate Output

#### 🧠 Think:
- Do I have minimum 3 options per step? (WARNING if exactly 3)
- Are all options specific (not generic)?
- Are dependencies explicit?
- Is progression clear (simple → advanced)?
- Are naming and formatting consistent?
- [Self-check against quality criteria]

#### ▶️ Execute:
Generate markdown output via [Output Template](output-template-increments.md).

Formatting requirements:
1. One line per option, nested under its Step: `F1-N.M Name — description · strategy`
2. A closing `strategies:` line per Step (2-3 strategies + one-line rationale)
3. Options progress from simple → complex
4. At least one option per Step from the cheap family (Crutches, Dummy to Dynamic, Zero/One/Many, Workflow Simplification, Extract Basic Utility), or a one-line reason why none applies

---

## QUALITY CRITERIA

For completed Incremental Options sections:

---

## EXAMPLES

### Example 1: "Capture Audio Input" Step

```markdown
- F1-1.1 Browser Microphone (Web Audio API) — Capture using browser's built-in Web Audio API with basic permissions prompt
- F1-1.2 Native Mobile Audio — Use platform-specific microphone APIs (AVFoundation for iOS, MediaRecorder for Android)
- F1-1.3 Audio Processing Pipeline — Add noise reduction and level monitoring with real-time visual feedback
- F1-1.4 Multi-device Support — Allow selection from multiple input devices (built-in mic, USB mic, Bluetooth headset)
- F1-1.5 Background Recording — Enable recording to continue when app is backgrounded or screen is off

- strategies: Dummy to Dynamic (Web API → Native), Data Variation (single device → multiple devices), Extract Basic Utility (basic capture → enhanced with processing) — Start with simplest browser API, progressively add native capabilities, device options, and background support for power users.
```

### Example 2: "Execute Search Query" Step

```markdown
- F1-2.1 Exact Text Match — Search product names for exact substring match (case-insensitive)
- F1-2.2 Fuzzy Text Search — Add fuzzy matching to handle typos and similar words (Levenshtein distance)
- F1-2.3 Filter by Single Attribute — Allow filtering by one attribute (e.g., category OR price range)
- F1-2.4 Multi-attribute Filters — Support combining multiple filters with AND logic (category AND price range AND rating)
- F1-2.5 Full-text Search with Ranking — Implement full-text search with relevance scoring (tf-idf or similar)
- F1-2.6 Natural Language Query — Parse natural language queries ("cheap laptops under $500") into structured filters

- strategies: Zero/One/Many (no filters → one filter → many filters), Business Rule Progression (exact → fuzzy → ranked), Data Variation (text only → attributes → natural language) — Build from simplest exact match toward sophisticated natural language understanding, allowing progressive enhancement of search quality.
```

### Example 3: "Persist User Data" Step

```markdown
- F1-3.1 LocalStorage (Client-side) — Store user data in browser localStorage (5MB limit, no backend required)
- F1-3.2 SQLite (Local Database) — Use SQLite for local structured storage with query capability
- F1-3.3 REST API (Cloud Sync) — Sync data to cloud via REST API (requires authentication)
- F1-3.4 Real-time Database (Firebase/Supabase) — Real-time bi-directional sync across devices

- strategies: Dummy to Dynamic (local → cloud), Split by Capacity (5MB → unlimited), Walking Skeleton on Crutches (client-only → full cloud) — Start with zero backend complexity (localStorage), progressively add server sync, then real-time capabilities as needed.
```

---

## COMMON ISSUES

**Issue: "Only came up with 2 options"**
→ Solution: Apply more strategies. Try:
- ❌ "Store data" with 2 options: "Database" and "File"
  WHY: Too high-level
  ✅ INSTEAD: Apply "Dummy to Dynamic" + "Split by Capacity"
    - "LocalStorage (5MB)" → "SQLite (unlimited local)" → "Cloud DB (unlimited + sync)" → "Real-time DB (sync + live)"

**Issue: "Options aren't really independent"**
→ Solution: Each option should be fully deployable on its own
- ❌ "Setup database" → "Add tables" → "Add queries"
  WHY: These depend on each other
  ✅ INSTEAD: "In-memory storage" → "SQLite storage" → "PostgreSQL with migrations"

**Issue: "Options sound too similar"**
→ Solution: Apply different strategies, not just technical variations
- ❌ "Save as WAV" → "Save as MP3" → "Save as OGG"
  WHY: Just format variations
  ✅ BETTER: Include workflow variations
    - "Save locally (no cloud)" → "Save + manual upload" → "Save with auto-sync" → "Save multi-format (WAV/MP3/OGG)"

**Issue: "Can't think of strategies that apply"**
→ Solution: Look for linguistic indicators in step description
- Words like "and", "or", "manage" → split actions
- Mentions of "validation", "confirmation" → workflow simplification
- Data types mentioned → data variation
- User types mentioned → user segment narrowing
- When in doubt, start with Zero/One/Many + Dummy to Dynamic

**Issue: "Each Step has one option per functional requirement"**
→ Solution: You are copying the ACs, not slicing. The ACs say WHAT must end up true; options are
cheaper ways to get there first. Generate options from the Step and the strategies, then check
coverage — an option that covers a requirement only partially or with fake data is valuable.
- ❌ "Show player list" → "Show player list sorted by number" → "Show player list with photos" (one per AC)
  ✅ INSTEAD: "Hardcoded list of 5 players" (Dummy to Dynamic) → "List from the roster API" →
  "Empty roster state" (Zero/One/Many) → "Sorted by number with photos"

**Issue: "The cheap options disappeared"**
→ Solution: Options like "the coach sends it by hand" or "hardcoded data" are not embarrassing —
they are the Walking Skeleton candidates. Write them, state the shortcut openly, and keep them.

**Interactive Use:**
If you're stuck, ask me to list strategies for a specific step, and I'll suggest applications.

---

## BEFORE SUBMITTING — verify for ALL Steps:

- [ ] ALL Steps have Incremental Options (no gaps)
- [ ] At least one option per step is clearly the simplest viable (Walking Skeleton candidate)
- [ ] Aim for 4+ options per step — 3 is acceptable if the step is genuinely narrow; note why
- [ ] Each option uses `F1-N.M Name — description · strategy` and is independently deployable
- [ ] Options progress from simple → complex
- [ ] Every Step has a `strategies:` line with 2+ strategies, and a cheap-family option (or a reason)
- [ ] Every option states its shortcut openly ("hardcoded list", "approved by hand")
- [ ] Options were not derived from the functional ACs (those are only used in the Phase 3 coverage check)
