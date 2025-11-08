# Bokata Agent 🍔

Modern backend implementation of **Bokata Slicer CC** using **LangGraph Functional API + LangChain + Express + TypeScript**.

Implements the **Hamburger Method** for vertical slicing, transforming project requirements into deployable increments with AI-powered agent orchestration.

## 🌟 Features

- ✅ **LangGraph Orchestration** - State machine workflow for agent coordination
- ✅ **Original Prompts** - Uses exact prompts from bokata-slicer-cc repository
- ✅ **RESTful API** - Express.js backend with TypeScript
- ✅ **Async Processing** - Job-based analysis with status tracking
- ✅ **Multiple Input Formats** - Text or Markdown file upload
- ✅ **Dual Output** - JSON API response + Markdown document conversion
- ✅ **Claude Sonnet 4.5** - Powered by Anthropic's latest model

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Express API                          │
│  POST /api/analyze  |  POST /api/analyze/file              │
│  GET /api/jobs/:id  |  GET /api/jobs/:id/result            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   LangGraph State Machine                   │
│                                                              │
│  feature_backbone → step_analyzer → increment_generator     │
│       ↓                  ↓                ↓                  │
│  (Phase 1)          (Phase 2.1)      (Phase 2.2)            │
│                                                              │
│  path_composer → doc_generator → END                        │
│       ↓               ↓                                      │
│  (Phase 3)       (Phase 4)                                  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    LangChain Agents                         │
│  • FeatureBackboneAgent  • StepAnalyzerAgent               │
│  • IncrementGeneratorAgent  • PathComposerAgent            │
│  • DocGeneratorAgent                                        │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- **Node.js** >= 18.x
- **TypeScript** >= 5.x
- **Anthropic API Key** ([Get one here](https://console.anthropic.com/))

## 🚀 Quick Start

### 1. Installation

```bash
# Clone repository
git clone https://github.com/abrahamvallez/bokata-agent.git
cd bokata-agent

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Run the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

The server will start at `http://localhost:3000`

## 📡 API Usage

### Analyze Project (Text Input)

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectInput": "Build a task management app where users can create projects, add tasks, assign them to team members, and track progress.",
    "projectName": "Task Manager"
  }'

# Response:
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Analysis started successfully"
}
```

### Analyze Project (File Upload)

```bash
curl -X POST http://localhost:3000/api/analyze/file \
  -F "file=@project-requirements.md" \
  -F "projectName=My Project"

# Response:
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Analysis started successfully",
  "fileName": "project-requirements.md"
}
```

### Check Job Status

```bash
curl http://localhost:3000/api/jobs/550e8400-e29b-41d4-a716-446655440000

# Response:
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": {
    "currentPhase": "Generating increments",
    "currentFeature": 2,
    "totalFeatures": 4,
    "currentStep": 3,
    "totalSteps": 5
  },
  "startedAt": "2025-11-08T12:00:00.000Z"
}
```

### Get Result (JSON)

```bash
curl http://localhost:3000/api/jobs/550e8400-e29b-41d4-a716-446655440000/result

# Response:
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "result": {
    "projectName": "Task Manager",
    "analysisDate": "2025-11-08T12:05:00.000Z",
    "executiveSummary": {
      "projectType": "Multi-feature Project",
      "totalFeatures": 4,
      "totalSteps": 12,
      "totalIncrements": 67,
      "walkingSkeletonSize": 12
    },
    "featuresBackbone": { ... },
    "features": [ ... ],
    "walkingSkeleton": { ... }
  }
}
```

### Get Result (Markdown)

```bash
curl http://localhost:3000/api/jobs/550e8400-e29b-41d4-a716-446655440000/markdown \
  --output analysis.md

# Downloads: Task Manager-analysis.md
```

### List All Jobs

```bash
curl http://localhost:3000/api/jobs

# Response:
[
  {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "progress": { ... },
    "startedAt": "2025-11-08T12:00:00.000Z",
    "completedAt": "2025-11-08T12:05:00.000Z"
  },
  ...
]
```

## 🧪 Example: Using the API with JavaScript

```javascript
// Start analysis
const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectInput: `
      E-commerce platform for handmade crafts.
      Users should be able to browse products, add to cart, checkout, and track orders.
      Tech: React + Node.js + PostgreSQL
      Timeline: 3 months to MVP
    `,
    projectName: 'Crafts Marketplace'
  })
});

const { jobId } = await response.json();

// Poll for completion
let status;
do {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

  const statusRes = await fetch(`http://localhost:3000/api/jobs/${jobId}`);
  status = await statusRes.json();

  console.log(`Status: ${status.status} - ${status.progress.currentPhase}`);
} while (status.status === 'processing' || status.status === 'pending');

// Get result
if (status.status === 'completed') {
  const resultRes = await fetch(`http://localhost:3000/api/jobs/${jobId}/result`);
  const result = await resultRes.json();

  console.log('Analysis complete!');
  console.log(`Features: ${result.result.executiveSummary.totalFeatures}`);
  console.log(`Walking Skeleton: ${result.result.executiveSummary.walkingSkeletonSize} increments`);
}
```

## 📂 Project Structure

```
bokata-agent/
├── agents/                      # Original prompts from bokata-slicer-cc
│   └── bokata-slicer/
│       ├── feature-backbone-specialist.md
│       ├── step-analyzer-specialist.md
│       ├── increment-generator-specialist.md
│       ├── path-composer-specialist.md
│       └── doc-generator.md
├── src/
│   ├── agents/                  # LangChain agent implementations
│   │   ├── base-agent.ts
│   │   └── specialists.ts
│   ├── api/                     # Express routes
│   │   └── routes.ts
│   ├── config/                  # Configuration
│   │   └── model.ts
│   ├── graph/                   # LangGraph workflow
│   │   └── bokata-graph.ts
│   ├── services/                # Business logic
│   │   ├── analysis-service.ts
│   │   └── job-manager.ts
│   ├── types/                   # TypeScript types
│   │   └── index.ts
│   ├── utils/                   # Utilities
│   │   └── prompt-loader.ts
│   └── index.ts                 # Server entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```bash
# Anthropic API Key (required)
ANTHROPIC_API_KEY=your_api_key_here

# Server configuration
PORT=3000
NODE_ENV=development

# LangGraph configuration
LANGGRAPH_VERBOSE=true
```

## 🎯 Hamburger Method Workflow

The system implements the complete Hamburger Method:

1. **Feature Backbone** - Identifies features in Actor+Action format
2. **Step Analysis** - Decomposes features into technical/logical steps
3. **Increment Generation** - Creates 5-10 increments per step using strategies
4. **Walking Skeleton** - Composes minimum viable path with simplest increments
5. **Documentation** - Generates structured analysis document

### Example Flow

```
Input: "Build a blogging platform"
  ↓
Feature Backbone: User Creates Post, User Publishes Post, User Views Posts
  ↓
Step Analysis: For each feature, identify UI → Logic → Data steps
  ↓
Increment Generation: Apply strategies (Dummy to Dynamic, Zero/One/Many, etc.)
  ↓
Walking Skeleton: Select simplest increments (e.g., hardcoded → localStorage)
  ↓
Output: JSON with complete analysis + Walking Skeleton composition
```

## 🧩 Extending the System

### Add Custom Agent

```typescript
import { BaseAgent } from './agents/base-agent.js';
import { PROMPTS } from './utils/prompt-loader.js';

export class CustomAgent extends BaseAgent {
  constructor() {
    super(PROMPTS.customPrompt());
  }
}
```

### Modify LangGraph Flow

Edit `src/graph/bokata-graph.ts`:

```typescript
// Add new node
workflow.addNode('custom_node', customNodeFunction);

// Add edge
workflow.addEdge('increment_generator', 'custom_node');
workflow.addEdge('custom_node', 'path_composer');
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests (when available)
npm test
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read the original [Bokata Slicer CC](https://github.com/abrahamvallez/bokata-slicer-cc) documentation to understand the Hamburger Method principles.

## 📚 Resources

- [Bokata Slicer CC](https://github.com/abrahamvallez/bokata-slicer-cc) - Original Claude Code implementation
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Documentation](https://js.langchain.com/docs/)
- [Anthropic Claude](https://www.anthropic.com/claude)

## 🙏 Acknowledgments

- Based on the **Hamburger Method** for vertical slicing
- Powered by **Anthropic Claude Sonnet 4.5**
- Built with **LangGraph** and **LangChain**

---

**Created by:** Abraham Vallez
**Repository:** https://github.com/abrahamvallez/bokata-agent
