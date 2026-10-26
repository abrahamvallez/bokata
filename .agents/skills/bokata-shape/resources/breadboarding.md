# Breadboards and fat-marker sketches

Shape Up keeps early sketches rough on purpose: a detailed mockup closes design decisions too
early. Both forms below stay at that altitude.

## Breadboard (always) — Mermaid

Three elements, straight from Shape Up:

| Element | Mermaid | Example |
|---|---|---|
| **Place** — a screen, dialog, menu, or state you can navigate to | `subgraph` | `subgraph Library` |
| **Affordance** — something the user can act on or read | node inside the subgraph | `chip[chip "With drawings"]` |
| **Connection** — how an affordance takes the user somewhere | arrow, labelled with the trigger | `chip -- turns on --> list` |

```mermaid
flowchart LR
  subgraph Library
    chip[chip "With drawings"]
    list[clip list]
  end
  subgraph Empty
    msg["No clips with drawings"]
    clear[button "Clear filter"]
  end
  chip -- turns on --> list
  list -- 0 results --> msg
  clear --> list
```

Rules:
- Words, not visuals: no colours, sizes or positions.
- Name affordances by what the user sees ("Clear filter"), not by component names.
- One breadboard per approach, so approaches can be compared side by side.

## Fat-marker sketch (only when layout is the decision)

Use it when *where* things go is what you are deciding — a toolbar over a video, what a panel
covers, a mobile layout. Write a single self-contained `pitch-sketch.html` next to the pitch:

- grey blocks and thick outlines only; system font; no brand colours, icons or images;
- labels name the element ("toolbar", "video", "timeline"), never real copy;
- one frame per approach, side by side, at the viewport that matters (e.g. 390×844 phone);
- inline CSS only, no scripts, no external assets.

If it starts to look like a real design, it is too detailed — remove things until it looks
drawn with a marker.
