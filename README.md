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
- ✅ **Simple Structure** - Clean, minimal folder organization

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
```

## 🚀 Quick Start

### Start the server

```bash
# Development mode (with auto-reload)
python main.py

# Or using uvicorn
uvicorn main:app --reload
```

Server will be available at: `http://localhost:8000`

- API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## 📁 Project Structure

```
bokata-api/
├── agents/              # All agents in one place
│   ├── base.py         # Base Agent class
│   ├── feature_backbone.py
│   ├── step_analyzer.py
│   ├── increment_generator.py
│   ├── path_composer.py
│   └── doc_generator.py
├── flow/               # PocketFlow workflows
│   ├── project_flow.py
│   └── feature_flow.py
├── models/             # Pydantic models
│   ├── request.py
│   └── response.py
├── prompts/            # Agent prompts (exact from original)
│   ├── feature_backbone.py
│   ├── step_analyzer.py
│   ├── increment_generator.py
│   ├── path_composer.py
│   └── doc_generator.py
├── utils/              # Utilities
│   ├── call_llm.py    # Claude API calls
│   └── markdown.py    # JSON to Markdown
├── main.py             # FastAPI app
├── routes.py           # API routes
├── requirements.txt
└── .env.example
```

## 📡 API Endpoints

### 1. Analyze Project

**Endpoint:** `POST /api/analyze/project`

```bash
curl -X POST "http://localhost:8000/api/analyze/project" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Project: Task Manager\n\nFeatures:\n- User Creates Task\n- User Views Tasks",
    "output_format": "json"
  }'
```

### 2. Analyze Feature

**Endpoint:** `POST /api/analyze/feature`

```bash
curl -X POST "http://localhost:8000/api/analyze/feature" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Feature: User Login\n\nUsers can log in with email/password",
    "output_format": "json"
  }'
```

### 3. Upload File

**Endpoint:** `POST /api/analyze/upload`

```bash
curl -X POST "http://localhost:8000/api/analyze/upload" \
  -F "file=@project.md" \
  -F "analysis_type=project" \
  -F "output_format=json"
```

### 4. Health Check

**Endpoint:** `GET /health`

```bash
curl http://localhost:8000/health
```

## 🏗️ Architecture

### Agent Workflow (PocketFlow)

#### Project Analysis
```
Input → Feature Backbone → Step Analyzer → Increment Generator → Path Composer → Doc Generator → Output
```

#### Feature Analysis
```
Input → Step Analyzer → Increment Generator → Path Composer → Doc Generator → Output
```

### PocketFlow Integration

Agents are connected using PocketFlow's simple syntax:

```python
# Setup workflow
self.feature_backbone >> self.step_analyzer
self.step_analyzer >> self.increment_generator
self.increment_generator >> self.path_composer
self.path_composer >> self.doc_generator

# Create and run flow
flow = Flow(start_node=self.feature_backbone)
result = flow.run(shared_context)
```

### Calling Claude

The `utils/call_llm.py` module provides a simple interface:

```python
from utils import call_claude

response = call_claude(
    system_prompt="You are a helpful assistant",
    user_message="Hello!",
    model="claude-3-5-sonnet-20241022",
    temperature=0.7
)
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
```

### Python

```python
import requests

def analyze_feature(description: str) -> dict:
    response = requests.post(
        "http://localhost:8000/api/analyze/feature",
        json={"content": description, "output_format": "json"}
    )
    return response.json()
```

### cURL

```bash
# With markdown output
curl -X POST "http://localhost:8000/api/analyze/project" \
  -H "Content-Type: application/json" \
  -d '{"content": "...", "output_format": "markdown"}'
```

## 📊 Response Format

All endpoints return structured JSON:

```json
{
  "executive_summary": {
    "project_name": "Task Manager",
    "total_features": 2,
    "total_steps": 6,
    "total_increments": 45,
    "walking_skeleton_size": 2
  },
  "feature_backbone": {
    "user_journey": "Users create and manage tasks",
    "features_list": [...]
  },
  "features": [
    {
      "name": "User Creates Task",
      "steps": [
        {
          "id": "1",
          "name": "Capture Task Details",
          "increments": [...]
        }
      ]
    }
  ],
  "walking_skeleton": {
    "description": "Minimum viable implementation",
    "selected_increments": [...]
  }
}
```

## 🔧 Development

### Run Tests

```bash
pytest tests/
```

### Format Code

```bash
black .
```

### Lint

```bash
ruff check .
```

## 📝 Hamburger Method Principles

Every increment must:
- **Answer:** "What if deadline was tomorrow?"
- **Cut through all layers:** UI → Logic → Data
- **Deliver observable value:** Real user benefit
- **Be deployable independently:** Not a prototype
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
