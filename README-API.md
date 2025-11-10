# Bokata API

**FastAPI + PocketFlow backend for Bokata Slicer CC**

Modern REST API implementation of the Bokata Slicer CC vertical slicing methodology using FastAPI and PocketFlow for agent orchestration.

## 🎯 Overview

This is a complete backend rewrite of [bokata-slicer-cc](https://github.com/abrahamvallez/bokata-slicer-cc) using:
- **FastAPI** - Modern, fast web framework
- **PocketFlow** - Lightweight agent orchestration (100 lines!)
- **Claude 3.5 Sonnet** - Anthropic's latest AI model
- **Exact prompts** - Same prompts from the original project

### Key Features

- ✅ **REST API** - Call from any platform (web, mobile, CLI)
- ✅ **JSON Output** - Structured, parseable results
- ✅ **Markdown Support** - Optional markdown output
- ✅ **File Upload** - Analyze from .md or .txt files
- ✅ **Original Prompts** - Exact same agent prompts
- ✅ **PocketFlow Orchestration** - Elegant agent coordination

## 📦 Installation

### Requirements

- Python 3.10+
- Anthropic API key

### Setup

```bash
# Clone repository
git clone https://github.com/abrahamvallez/bokata-agent.git
cd bokata-agent

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### Configuration

Edit `.env`:

```env
ANTHROPIC_API_KEY=your_api_key_here
MODEL_NAME=claude-3-5-sonnet-20241022
TEMPERATURE=0.7

API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

CORS_ORIGINS=http://localhost:3000,http://localhost:8000
LOG_LEVEL=INFO
```

## 🚀 Quick Start

### Start the server

```bash
# Development mode (with auto-reload)
python -m src.main

# Or using uvicorn directly
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: `http://localhost:8000`

- API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## 📡 API Endpoints

### 1. Analyze Project (Multiple Features)

**Endpoint:** `POST /api/analyze/project`

Analyzes a complete project with multiple features.

**Request:**

```bash
curl -X POST "http://localhost:8000/api/analyze/project" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Project: Task Management Platform\n\nFeatures:\n- User Creates Project\n- User Adds Task\n- User Assigns Task\n- User Updates Task Status\n\nTech Stack: React, Node.js, PostgreSQL\nTimeline: 3 months to MVP",
    "output_format": "json"
  }'
```

**Response (JSON):**

```json
{
  "executive_summary": {
    "project_name": "Task Management Platform",
    "total_features": 4,
    "total_steps": 15,
    "total_increments": 93,
    "walking_skeleton_size": 4
  },
  "feature_backbone": {
    "user_journey": "Users create projects, add tasks, assign them, and track progress",
    "features_list": [
      {
        "name": "User Creates Project",
        "description": "Users can create a new project workspace"
      }
    ],
    "flow_narrative": "..."
  },
  "features": [
    {
      "name": "User Creates Project",
      "description": "...",
      "steps": [
        {
          "id": "1",
          "name": "Capture Project Details",
          "description": "...",
          "increments": [
            {
              "id": "1.1",
              "name": "Single text field (project name only)",
              "description": "...",
              "is_simplest": true,
              "requires": "None",
              "provides": "Project name input",
              "compatible_with": "2.1, 3.1",
              "strategy": "Zero/One/Many"
            }
          ]
        }
      ]
    }
  ],
  "walking_skeleton": {
    "description": "Minimum viable implementation",
    "selected_increments": [
      {
        "feature": "User Creates Project",
        "step": "Capture Project Details",
        "increment": "Single text field",
        "requires": "None",
        "provides": "Project name input"
      }
    ],
    "rationale": "...",
    "dependency_validation": "All dependencies validated"
  }
}
```

**Request with Markdown output:**

```bash
curl -X POST "http://localhost:8000/api/analyze/project" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Project: ...",
    "output_format": "markdown"
  }'
```

### 2. Analyze Feature (Single Feature)

**Endpoint:** `POST /api/analyze/feature`

Analyzes a single feature in detail.

**Request:**

```bash
curl -X POST "http://localhost:8000/api/analyze/feature" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Feature: User Resets Password\n\nDescription: Users can reset password via email\nContext: SaaS app, security critical\nTech Stack: React, Node.js, PostgreSQL",
    "output_format": "json"
  }'
```

**Response:** Similar structure to project analysis, but without `feature_backbone`.

### 3. Analyze from File Upload

**Endpoint:** `POST /api/analyze/upload`

Upload a `.md` or `.txt` file for analysis.

**Request:**

```bash
curl -X POST "http://localhost:8000/api/analyze/upload" \
  -F "file=@project-requirements.md" \
  -F "analysis_type=project" \
  -F "output_format=json"
```

**Parameters:**
- `file`: File to upload (.md or .txt)
- `analysis_type`: "project" or "feature" (default: "project")
- `output_format`: "json" or "markdown" (default: "json")

### 4. Health Check

**Endpoint:** `GET /health`

```bash
curl http://localhost:8000/health
```

**Response:**

```json
{
  "status": "healthy"
}
```

## 🏗️ Architecture

### Project Structure

```
bokata-api/
├── src/
│   ├── main.py                    # FastAPI application
│   ├── models/
│   │   ├── request.py            # Pydantic request models
│   │   └── response.py           # Pydantic response models
│   ├── api/
│   │   └── routes/
│   │       ├── analyze.py        # Analysis endpoints
│   │       └── health.py         # Health check
│   ├── agents/
│   │   ├── base.py               # Base agent class
│   │   ├── coordinators/         # Coordinator agents
│   │   └── specialists/          # Specialist agents
│   │       ├── feature_backbone_specialist.py
│   │       ├── step_analyzer_specialist.py
│   │       ├── increment_generator_specialist.py
│   │       ├── path_composer_specialist.py
│   │       └── doc_generator.py
│   ├── orchestrator/
│   │   └── workflow.py           # PocketFlow workflows
│   ├── prompts/
│   │   └── feature_backbone.py   # Original prompts
│   └── utils/
│       ├── markdown.py           # JSON to Markdown
│       └── file_handler.py       # File handling
├── tests/
├── pyproject.toml
├── requirements.txt
└── .env.example
```

### Agent Workflow

#### Project Analysis

```
Input (Project Description)
    ↓
1. Feature Backbone Specialist
    → Identifies all features
    ↓
2. Step Analyzer Specialist
    → Decomposes each feature into steps
    ↓
3. Increment Generator Specialist
    → Generates 5-10 increments per step
    ↓
4. Path Composer Specialist
    → Composes Walking Skeleton
    ↓
5. Doc Generator
    → Produces final JSON/Markdown
    ↓
Output (Structured Analysis)
```

#### Feature Analysis

```
Input (Feature Description)
    ↓
1. Step Analyzer Specialist
    ↓
2. Increment Generator Specialist
    ↓
3. Path Composer Specialist
    ↓
4. Doc Generator
    ↓
Output (Structured Analysis)
```

### PocketFlow Integration

Agents are connected using PocketFlow's elegant syntax:

```python
# Project workflow
self.feature_backbone >> self.step_analyzer
self.step_analyzer >> self.increment_generator
self.increment_generator >> self.path_composer
self.path_composer >> self.doc_generator

# Create flow
self.flow = Flow(start_node=self.feature_backbone)

# Run
result = self.flow.run(shared_context)
```

## 🔧 Development

### Run Tests

```bash
pytest tests/
```

### Format Code

```bash
black src/
```

### Lint

```bash
ruff check src/
```

## 🌐 Integration Examples

### JavaScript/TypeScript

```typescript
async function analyzeProject(description: string) {
  const response = await fetch('http://localhost:8000/api/analyze/project', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: description,
      output_format: 'json'
    })
  });
  return response.json();
}

// Usage
const result = await analyzeProject(`
  Project: E-commerce Platform
  Features:
  - User Browses Products
  - User Adds to Cart
  - User Completes Checkout
`);

console.log(result.executive_summary);
```

### Python Client

```python
import requests

def analyze_feature(description: str) -> dict:
    response = requests.post(
        "http://localhost:8000/api/analyze/feature",
        json={
            "content": description,
            "output_format": "json"
        }
    )
    return response.json()

# Usage
result = analyze_feature("""
Feature: User Resets Password

Description: Users can reset password via email
Context: SaaS app, security critical
""")

print(result["features"][0]["name"])
```

### React Example

```tsx
import { useState } from 'react';

function ProjectAnalyzer() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeProject = async (description: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/analyze/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: description, output_format: 'json' })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea onChange={(e) => analyzeProject(e.target.value)} />
      {loading && <p>Analyzing...</p>}
      {result && (
        <pre>{JSON.stringify(result.executive_summary, null, 2)}</pre>
      )}
    </div>
  );
}
```

## 📊 Response Format

All analysis endpoints return structured JSON with:

1. **executive_summary** - High-level metrics
2. **feature_backbone** - Features overview (projects only)
3. **features** - Detailed feature breakdown
   - **steps** - Technical/business steps
   - **increments** - 5-10 increments per step
     - id, name, description
     - is_simplest (⭐ marker)
     - requires, provides, compatible_with
     - strategy
4. **walking_skeleton** - Minimum viable composition

## 🔑 Key Differences from Original

| Aspect | Original (Claude Code) | New (FastAPI) |
|--------|----------------------|---------------|
| Interface | Slash commands | REST API |
| Output | Markdown files | JSON (+ optional markdown) |
| Orchestration | Manual prompts | PocketFlow workflows |
| Usage | Claude Code CLI | Any HTTP client |
| Platform | Local CLI only | Web, mobile, any platform |

## 📝 Hamburger Method Principles

All analysis follows the Hamburger Method:

- **Every increment must answer:** "What if deadline was tomorrow?"
- **Cut through all layers:** UI → Logic → Data
- **Deliver observable value:** Real user benefit
- **Deployable independently:** Not a prototype
- **Enable early feedback:** Learn and iterate

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📜 License

GPL-3.0 - Same as original bokata-slicer-cc

## 🙏 Credits

Based on [bokata-slicer-cc](https://github.com/abrahamvallez/bokata-slicer-cc) by Abraham Vallez.

This implementation maintains the **exact same prompts** from the original project.

---

**Made with ❤️ using FastAPI and PocketFlow**
