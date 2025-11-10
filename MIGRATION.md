# Migration Guide: Bokata Slicer CC → Bokata API

This document explains the migration from the original Claude Code implementation to the new FastAPI backend.

## Overview

The original **bokata-slicer-cc** was built as a Claude Code plugin with:
- Slash commands (`/bokata`, `/bokata-feature`, etc.)
- Markdown file outputs
- Manual agent coordination via prompts
- Claude Code CLI only

The new **Bokata API** provides:
- REST API endpoints
- JSON output (with optional markdown)
- PocketFlow agent orchestration
- Platform-agnostic (web, mobile, CLI, any HTTP client)

## Architecture Comparison

### Original (Claude Code)

```
User Input (via Claude Code CLI)
    ↓
Slash Command (/bokata, /bokata-feature)
    ↓
Manual Prompt Coordination
    ↓
Sub-agents called sequentially
    ↓
Markdown File Output (./docs/slicing-analysis/)
```

### New (FastAPI + PocketFlow)

```
HTTP Request (from anywhere)
    ↓
FastAPI Endpoint (/api/analyze/project, /api/analyze/feature)
    ↓
PocketFlow Workflow
    ↓
Agents orchestrated automatically
    ↓
JSON Response (or markdown if requested)
```

## Feature Mapping

| Original Feature | New API Endpoint | Status |
|------------------|-----------------|--------|
| `/bokata` (project) | `POST /api/analyze/project` | ✅ Implemented |
| `/bokata-feature` | `POST /api/analyze/feature` | ✅ Implemented |
| `/bokata-iterations-paths` | `POST /api/generate/paths` | 🚧 Placeholder |
| `/bokata-matrix` | `POST /api/generate/matrix` | 🚧 Placeholder |
| File upload support | `POST /api/analyze/upload` | ✅ Implemented |

## Agent Mapping

All specialist agents from the original project are preserved:

| Original Agent | New Implementation | Location |
|----------------|-------------------|----------|
| `project-analyzer.md` | `ProjectAnalysisWorkflow` | `src/orchestrator/workflow.py` |
| `feature-analyzer.md` | `FeatureAnalysisWorkflow` | `src/orchestrator/workflow.py` |
| `feature-backbone-specialist.md` | `FeatureBackboneSpecialist` | `src/agents/specialists/` |
| `step-analyzer-specialist.md` | `StepAnalyzerSpecialist` | `src/agents/specialists/` |
| `increment-generator-specialist.md` | `IncrementGeneratorSpecialist` | `src/agents/specialists/` |
| `path-composer-specialist.md` | `PathComposerSpecialist` | `src/agents/specialists/` |
| `doc-generator.md` | `DocGeneratorAgent` | `src/agents/specialists/` |

**Important:** All agents use the **exact same prompts** from the original project.

## Output Format Changes

### Original Output (Markdown File)

```markdown
# Executive Summary
**Project:** Task Management Platform
**Features:** 4
...

# Feature Backbone Overview
1. **User Creates Project** - Users can create...
...

# Feature Breakdown - Complete Analysis
## Feature: User Creates Project
### Step 1: Capture Project Details
| # | Increment | Depends | Strategy | Notes |
...

# Walking Skeleton
...
```

### New Output (JSON)

```json
{
  "executive_summary": {
    "project_name": "Task Management Platform",
    "total_features": 4,
    ...
  },
  "feature_backbone": {
    "user_journey": "...",
    "features_list": [...]
  },
  "features": [
    {
      "name": "User Creates Project",
      "steps": [
        {
          "id": "1",
          "name": "Capture Project Details",
          "increments": [...]
        }
      ]
    }
  ],
  "walking_skeleton": {...}
}
```

### Converting JSON to Markdown

The API supports markdown output via the `output_format` parameter:

```bash
curl -X POST "http://localhost:8000/api/analyze/project" \
  -H "Content-Type: application/json" \
  -d '{"content": "...", "output_format": "markdown"}'
```

Or convert JSON programmatically:

```python
from src.utils.markdown import json_to_markdown

markdown = json_to_markdown(json_result)
```

## Migration Steps

### If you were using Claude Code CLI:

**Before:**
```bash
# In Claude Code
/bokata Project: Task Management...
```

**After:**
```bash
# Start API server
python -m src.main

# Call API
curl -X POST "http://localhost:8000/api/analyze/project" \
  -H "Content-Type: application/json" \
  -d '{"content": "Project: Task Management..."}'
```

### If you were integrating programmatically:

**Before (TypeScript with bokata-agent npm package):**
```typescript
import { createBokataCommands } from 'bokata-agent';

const commands = createBokataCommands();
const result = await commands.bokata("Project: ...");
```

**After (Any HTTP client):**
```typescript
const response = await fetch('http://localhost:8000/api/analyze/project', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: 'Project: ...' })
});
const result = await response.json();
```

## Breaking Changes

1. **Output format:** Markdown files → JSON (markdown available on request)
2. **Interface:** Slash commands → HTTP endpoints
3. **File location:** `./docs/slicing-analysis/` → API response
4. **Synchronous calls:** Original was blocking → New API can be called asynchronously

## Benefits of Migration

### ✅ Platform Independence
- Call from web apps, mobile apps, CLIs
- No longer tied to Claude Code CLI
- Works anywhere HTTP works

### ✅ Structured Output
- JSON is parseable and type-safe
- Easier integration with frontends
- Can still get markdown if needed

### ✅ Better Orchestration
- PocketFlow handles agent coordination
- Cleaner workflow definitions
- Easier to debug and modify

### ✅ API Features
- File upload support
- Health checks
- Swagger/OpenAPI docs
- CORS support
- Request validation

## What Stayed the Same

✅ **Prompts** - Exact same agent prompts
✅ **Methodology** - Same Hamburger Method principles
✅ **Analysis quality** - Same level of detail
✅ **Agent logic** - Same breakdown strategies
✅ **Dependency tracking** - Same REQUIRES/PROVIDES/COMPATIBLE WITH system

## Roadmap

Future enhancements planned:

- [ ] WebSocket support for real-time progress
- [ ] Async task queue for long-running analyses
- [ ] Caching layer for repeated analyses
- [ ] Multi-language support (i18n)
- [ ] Custom agent configuration via API
- [ ] Implement `/bokata-iterations-paths` endpoint
- [ ] Implement `/bokata-matrix` endpoint
- [ ] PostgreSQL storage for analysis history
- [ ] User authentication and rate limiting

## Questions?

See [README-API.md](./README-API.md) for detailed API documentation.

For issues or feature requests, visit: [GitHub Issues](https://github.com/abrahamvallez/bokata-agent/issues)
