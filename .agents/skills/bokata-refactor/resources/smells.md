# Smells and the moves that fix them

Each smell is a heuristic, never a hard violation: name it ("possible Feature Envy"), point at
the code, and propose the move. A documented project standard overrides any smell here.
Moves are Martin Fowler's (*Refactoring*); in functional code read "class" as "module" and
"method" as "function".

| Smell | What you see | Move |
|---|---|---|
| **Mysterious Name** | A name that does not say what it does or holds | Rename, using the glossary's word. No honest name comes? The design is murky — split it. |
| **Long Function** | You need comments or blank lines to follow it | Extract Function per chunk, named by intention |
| **Long Parameter List** | Many arguments, often passed through untouched | Introduce Parameter Object; or pass the whole value instead of its parts |
| **Duplicated Code** | The same knowledge in two places | Extract Function and call it from both; or Slide Statements until the shared shape shows |
| **Divergent Change** | One module edited for unrelated reasons | Split Phase, or Extract Module, so each changes for one reason |
| **Shotgun Surgery** | One change forces edits in many modules | Move Function / Combine into one module, so what changes together lives together |
| **Feature Envy** | A function works mostly on another module's data | Move Function next to the data it envies |
| **Data Clumps** | The same few values always travel together | Introduce Parameter Object or a type for the clump |
| **Primitive Obsession** | A string or number stands for a domain concept | Replace Primitive with a small type (value object, branded type) that owns its rules |
| **Repeated Switches** | The same `switch`/`if` chain on the same type in several places | One lookup map shared by both sites, or polymorphism |
| **Loops** | A loop that filters, maps and accumulates by hand | Replace Loop with Pipeline (`filter`/`map`/`reduce`) when it reads better |
| **Speculative Generality** | Parameters, hooks or abstractions for needs nobody has | Inline Function / Remove Parameter / Collapse Hierarchy |
| **Temporary Field** | A field or variable that is only set in some cases | Extract the case that uses it into its own function or type |
| **Message Chains** | `a.b().c().d()` the caller should not depend on | Hide Delegate: one function on the first object does the walk |
| **Middle Man** | A module that mostly forwards to another | Remove Middle Man; call the real target |
| **Mutable Data** | Shared state changed from several places | Encapsulate it, or return new values instead of mutating (copy-on-write) |
| **Global Data** | Anything can read or write it | Encapsulate it behind a function and narrow who can call it |
| **Comments** | A comment explains *what* the code does | Extract Function / Rename until the comment is redundant, then delete it. Keep comments that explain *why*. |
| **Refused Bequest** | An implementer ignores most of what it inherits | Replace inheritance with composition |

## Principles mapped to smells

| Principle | Look for |
|---|---|
| Single responsibility | Divergent Change, Long Function |
| Open/closed | Repeated Switches |
| Liskov | Refused Bequest |
| Interface segregation | Long Parameter List, a wide interface most callers use a sliver of |
| Dependency inversion | A dependency created inside instead of passed in at a seam |
| DRY | Duplicated Code — of *knowledge*, not of look-alike lines |
| KISS / YAGNI | Speculative Generality, rule 4 (fewest elements) |
| Coupling | Shotgun Surgery, Feature Envy, Message Chains, Global Data |
| Cohesion | Divergent Change, Data Clumps |
| Calisthenics: wrap primitives | Primitive Obsession |
| Calisthenics: first-class collections | Data Clumps around a collection, Repeated Switches over it |
| Calisthenics: one level of indentation, no `else` | Long Function → guard clauses, Extract Function |
| Calisthenics: no getters, tell don't ask | Feature Envy |
| Calisthenics: small entities | Long Function, Divergent Change |
