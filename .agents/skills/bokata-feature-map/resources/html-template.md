# Bokata HTML Template

This file defines the shared HTML rendering template and markdown→HTML conversion rules for all bokata command outputs (backbone, functional ACs, slicing, concrete ACs).

## Base HTML Shell

Use this doctype/head/style block as the base for all rendered outputs, verbatim from `docs/mvp/features-backbone.html` (generalized for dark-mode consistency):

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{TITLE}}</title>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #2d3748;
    background: #f7fafc;
  }

  @media (prefers-color-scheme: dark) {
    body {
      background: #1a202c;
      color: #e2e8f0;
    }
  }

  header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 3rem 2rem;
    text-align: center;
  }

  header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  header p {
    font-size: 1.1rem;
    opacity: 0.95;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  section {
    background: white;
    margin: 2rem 0;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  @media (prefers-color-scheme: dark) {
    section {
      background: #2d3748;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
  }

  h2 {
    color: #667eea;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    border-bottom: 3px solid #667eea;
    padding-bottom: 0.5rem;
  }

  @media (prefers-color-scheme: dark) {
    h2 {
      color: #a78bfa;
      border-bottom-color: #a78bfa;
    }
  }

  h3 {
    color: #764ba2;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-size: 1.4rem;
  }

  @media (prefers-color-scheme: dark) {
    h3 {
      color: #d8b4fe;
    }
  }

  .feature {
    margin: 2rem 0;
    padding: 1.5rem;
    border-left: 4px solid #667eea;
    background: #f0f4ff;
    border-radius: 4px;
  }

  @media (prefers-color-scheme: dark) {
    .feature {
      background: rgba(102, 126, 234, 0.1);
      border-left-color: #a78bfa;
    }
  }

  .feature-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
  }

  .feature-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2d3748;
  }

  @media (prefers-color-scheme: dark) {
    .feature-title {
      color: #f7fafc;
    }
  }

  .feature-id {
    background: #667eea;
    color: white;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    white-space: nowrap;
    margin-left: 1rem;
  }

  @media (prefers-color-scheme: dark) {
    .feature-id {
      background: #a78bfa;
      color: #1a202c;
    }
  }

  .feature-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
    font-size: 0.95rem;
  }

  .meta-item {
    background: white;
    padding: 0.75rem;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  @media (prefers-color-scheme: dark) {
    .meta-item {
      background: rgba(0,0,0,0.2);
      border-color: #4a5568;
    }
  }

  .meta-label {
    font-weight: 600;
    color: #667eea;
    font-size: 0.85rem;
  }

  @media (prefers-color-scheme: dark) {
    .meta-label {
      color: #a78bfa;
    }
  }

  .meta-value {
    margin-top: 0.25rem;
  }

  .feature-description {
    margin: 1rem 0;
    line-height: 1.7;
  }

  .task-list {
    list-style: none;
    margin: 1rem 0;
  }

  .task-item {
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
    margin: 0.5rem 0;
  }

  .task-item:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #48bb78;
    font-weight: bold;
  }

  @media (prefers-color-scheme: dark) {
    .task-item {
      color: #cbd5e0;
    }
  }

  .system-tasks {
    background: rgba(0,0,0,0.03);
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
  }

  @media (prefers-color-scheme: dark) {
    .system-tasks {
      background: rgba(0,0,0,0.2);
    }
  }

  .system-task {
    margin: 0.5rem 0;
    padding-left: 1rem;
  }

  .system-task strong {
    color: #764ba2;
  }

  @media (prefers-color-scheme: dark) {
    .system-task strong {
      color: #d8b4fe;
    }
  }

  .requirement {
    margin: 1.5rem 0;
    padding: 1rem;
    background: rgba(102, 126, 234, 0.05);
    border-left: 3px solid #667eea;
    border-radius: 4px;
  }

  @media (prefers-color-scheme: dark) {
    .requirement {
      background: rgba(102, 126, 234, 0.1);
      border-left-color: #a78bfa;
    }
  }

  .requirement-header {
    font-weight: 600;
    color: #667eea;
    margin-bottom: 0.5rem;
  }

  @media (prefers-color-scheme: dark) {
    .requirement-header {
      color: #a78bfa;
    }
  }

  .scenario {
    margin: 1rem 0 0 0;
    padding: 0.75rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 0.95rem;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    overflow-x: auto;
  }

  @media (prefers-color-scheme: dark) {
    .scenario {
      background: rgba(0,0,0,0.2);
      border-color: #4a5568;
      color: #e2e8f0;
    }
  }

  .gherkin-keyword {
    font-weight: 600;
    color: #667eea;
  }

  @media (prefers-color-scheme: dark) {
    .gherkin-keyword {
      color: #a78bfa;
    }
  }

  .skeleton-item {
    margin: 1.5rem 0;
    padding: 1rem;
    border-left: 4px solid #48bb78;
    background: rgba(72, 187, 120, 0.05);
    border-radius: 4px;
  }

  @media (prefers-color-scheme: dark) {
    .skeleton-item {
      background: rgba(72, 187, 120, 0.1);
      border-left-color: #81e6d9;
    }
  }

  .skeleton-item-title {
    font-weight: 600;
    color: #22543d;
    margin-bottom: 0.5rem;
  }

  @media (prefers-color-scheme: dark) {
    .skeleton-item-title {
      color: #81e6d9;
    }
  }

  .increment-item {
    margin: 1rem 0;
    padding: 1rem;
    border-left: 4px solid #ed8936;
    background: rgba(237, 137, 54, 0.05);
    border-radius: 4px;
  }

  @media (prefers-color-scheme: dark) {
    .increment-item {
      background: rgba(237, 137, 54, 0.1);
      border-left-color: #fbd38d;
    }
  }

  .increment-item-title {
    font-weight: 600;
    color: #7c2d12;
    margin-bottom: 0.5rem;
  }

  @media (prefers-color-scheme: dark) {
    .increment-item-title {
      color: #fbd38d;
    }
  }

  .discovery-context {
    margin: 2rem 0;
    padding: 1rem;
    background: #fffacd;
    border: 2px solid #daa520;
    border-radius: 4px;
  }

  @media (prefers-color-scheme: dark) {
    .discovery-context {
      background: rgba(218, 165, 32, 0.15);
      border-color: #daa520;
      color: #e2e8f0;
    }
  }

  .trio-reconciliation {
    margin: 2rem 0;
    padding: 1rem;
    background: #e6f2ff;
    border: 2px solid #667eea;
    border-radius: 4px;
  }

  @media (prefers-color-scheme: dark) {
    .trio-reconciliation {
      background: rgba(102, 126, 234, 0.15);
      border-color: #a78bfa;
      color: #e2e8f0;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
  }

  th {
    background: #667eea;
    color: white;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
  }

  @media (prefers-color-scheme: dark) {
    th {
      background: #4c51bf;
    }
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  @media (prefers-color-scheme: dark) {
    td {
      border-bottom-color: #4a5568;
    }
  }

  tr:nth-child(even) {
    background: #f7fafc;
  }

  @media (prefers-color-scheme: dark) {
    tr:nth-child(even) {
      background: rgba(0,0,0,0.1);
    }
  }

  .critical {
    color: #e53e3e;
    font-weight: 600;
  }

  .recommended {
    color: #ed8936;
    font-weight: 500;
  }

  .checklist {
    list-style: none;
    margin: 1rem 0;
  }

  .checklist li {
    padding: 0.5rem 0;
    padding-left: 2rem;
    position: relative;
  }

  .checklist li:before {
    content: "☑";
    position: absolute;
    left: 0;
    color: #48bb78;
  }

  footer {
    text-align: center;
    padding: 2rem;
    color: #718096;
    font-size: 0.9rem;
  }

  @media (prefers-color-scheme: dark) {
    footer {
      color: #a0aec0;
    }
  }
</style>
</head>
<body>

<header>
  <h1>{{TITLE}}</h1>
  <p>{{SUBTITLE}}</p>
</header>

<div class="container">
  {{BODY}}
</div>

<footer>
  {{FOOTER_META}}
</footer>

</body>
</html>
```

## Markdown→HTML Conversion Rules

When a command processes `.md` content and renders it to `.html`, follow these mappings:

| Markdown | HTML Class | Notes |
|----------|-----------|-------|
| `## Features Backbone` | `<section><h2>Features Backbone</h2>...</section>` | Wraps entire backbone in a section |
| `#### Feature: ...` + `<!-- ID: ... -->` | `.feature` div with `.feature-header` + `.feature-title` + `.feature-id` | Replicate the card design from features-backbone.html |
| `##### User Task: ...` | `.task-list > li.task-item` | Rendered as a bulleted list with checkmark, indented under parent Feature |
| `##### System Task: ...` | `.system-tasks` block | Rendered as muted box under the User Tasks |
| `### Requirement: ...` | `.requirement` div with `.requirement-header` | For functional AC documents |
| `#### Scenario: ...` | `.scenario` block inside `.requirement` | Render WHEN/THEN on separate lines, use `.gherkin-keyword` for WHEN/THEN/GIVEN/AND/BUT |
| Gherkin fences (concrete AC) | `.scenario` monospace pre block | For Given/When/Then blocks in concrete ACs |
| `## Walking Skeleton` header | `<section><h2>Walking Skeleton</h2>...</section>` | New section for slicing document |
| `- [ ] **[task name]**` (skeleton item) | `.skeleton-item` div with `.skeleton-item-title` | Green-bordered box |
| `## Increments Backlog` header | `<section><h2>Increments Backlog</h2>...</section>` | Subsection for increments |
| `**[Increment ID]**: ...` (increment) | `.increment-item` div with `.increment-item-title` | Orange-bordered box |
| `## Discovery Context` | `.discovery-context` | Yellow-bordered callout box |
| `## Trio Reconciliation Notes` | `.trio-reconciliation` | Blue-bordered callout box |
| `- [ ] ...` (generic checklist) | `.checklist li` | Standard checklist styling |
| Tables | `table/th/td` | Reuse existing table style from template |

## Template Placeholders

- `{{TITLE}}`: Page title (e.g., "Real Tourism MVP — Backbone", "Tourist Discovers Nearby Places — Slicing")
- `{{SUBTITLE}}`: Tagline/description (e.g., "Features Mapping + Trio-Reviewed", "Walking Skeleton + Increments Backlog")
- `{{BODY}}`: The complete rendered HTML content from the markdown artifacts, wrapped in sections
- `{{FOOTER_META}}`: Generated footer line with date, command, and input source (e.g., "Real Tourism MVP Features Backbone | Generated 2026-07-16 | Command: /bokata:feature-map | Source: Real Tourism MVP Initiative")

## Example Conversion

Input markdown:
```markdown
## Features Backbone

#### Feature: 🗺️ Tourist Discovers Nearby Places
<!-- ID: RTMVP-FEAT-001 -->

**Actor**: Tourist  
**Capability**: Geolocation Discovery

##### User Task: Enable geolocation permissions on first launch

##### System Task 1.1: Request location permission
**Trigger:** App launches.
```

Output HTML (simplified):
```html
<section>
  <h2>Features Backbone</h2>
  <div class="feature">
    <div class="feature-header">
      <div class="feature-title">🗺️ Tourist Discovers Nearby Places</div>
      <div class="feature-id">RTMVP-FEAT-001</div>
    </div>
    <ul class="task-list">
      <li class="task-item">Enable geolocation permissions on first launch</li>
    </ul>
    <div class="system-tasks">
      <div class="system-task"><strong>Request location permission</strong>: Triggered when app launches.</div>
    </div>
  </div>
</section>
```
