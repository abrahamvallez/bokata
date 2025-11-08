# Bokata Agent

LangChain/LangGraph TypeScript implementation of feature decomposition using the Hamburger Method. A multi-agent system for breaking down software features into vertical slices.

## Overview

Bokata Agent is a TypeScript implementation of the [bokata-slicer-cc](https://github.com/abrahamvallez/bokata-slicer-cc) system, rebuilt with LangChain and LangGraph. It provides:

- **Multi-agent architecture** using LangGraph for orchestration
- **TypeScript-first** with full type safety
- **Modular design** that can be called from web apps, CLIs, or other interfaces
- **Hamburger Method** implementation for feature slicing

## Features

### 🤖 Specialized Agents

1. **Feature Analyzer** - Analyzes single features into vertical slices
2. **Project Analyzer** - Analyzes multiple features with cross-dependencies
3. **Paths Generator** - Creates 3-5 implementation strategies
4. **Matrix Generator** - Builds compatibility matrix for increments

### 📊 The Hamburger Method

Every vertical slice must answer: **"What would we ship if the deadline were tomorrow?"**

Valid slices must:
- Cross all technical layers (UI → Logic → Data)
- Deliver observable user value
- Be independently deployable
- Enable early feedback

### 🎯 Key Outputs

- **Walking Skeleton**: Minimal viable slice (< 1 week)
- **Vertical Increments**: Complete feature breakdown with dependencies
- **Implementation Paths**: Multiple strategies with timelines
- **Compatibility Matrix**: Shows which increments work together

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
ANTHROPIC_API_KEY=your_api_key_here
MODEL_NAME=claude-3-5-sonnet-20241022
TEMPERATURE=0.7
MAX_ITERATIONS=10
VERBOSE=true
```

## Usage

### Basic Usage

```typescript
import { createBokataAPI, FeatureInput } from 'bokata-agent';

const api = createBokataAPI();

const feature: FeatureInput = {
  name: 'User Resets Password',
  description: 'Users can reset their password via email',
  technicalStack: ['React', 'Node.js', 'PostgreSQL']
};

const analysis = await api.analyzeFeature(feature);
console.log(analysis.walkingSkeleton);
console.log(analysis.allIncrements);
```

### Complete Workflow

```typescript
// Analyze + Generate Paths + Generate Matrix
const result = await api.runCompleteWorkflow(feature);

console.log(result.analysis);        // Feature analysis
console.log(result.paths);           // Implementation paths
console.log(result.matrix);          // Compatibility matrix
```

### Project Analysis

```typescript
import { ProjectInput } from 'bokata-agent';

const project: ProjectInput = {
  name: 'Coaching Platform',
  description: 'Platform for coaches and clients',
  features: [
    { name: 'User Registers Account', description: '...' },
    { name: 'Coach Records Audio', description: '...' },
    { name: 'Client Books Session', description: '...' }
  ]
};

const analysis = await api.analyzeProject(project);
console.log(analysis.multiFunctionalWalkingSkeleton);
console.log(analysis.crossFeatureDependencies);
console.log(analysis.recommendedImplementationOrder);
```

## Web Integration

Bokata Agent can be easily integrated into web applications:

```typescript
import express from 'express';
import { createBokataAPI } from 'bokata-agent';

const app = express();
const api = createBokataAPI();

app.post('/api/analyze/feature', async (req, res) => {
  const analysis = await api.analyzeFeature(req.body);
  res.json({ success: true, data: analysis });
});

app.listen(3000);
```

See `examples/web-integration.ts` for a complete example.

## Architecture

```
src/
├── agents/              # Specialized agents
│   ├── base-agent.ts   # Base agent class
│   ├── feature-analyzer.ts
│   ├── project-analyzer.ts
│   ├── paths-generator.ts
│   └── matrix-generator.ts
├── orchestrator/        # LangGraph orchestration
│   └── bokata-orchestrator.ts
├── api/                # External API
│   └── bokata-api.ts
├── types/              # TypeScript types
├── prompts/            # Agent prompts
└── utils/              # Utilities
```

## Examples

Run the examples:

```bash
# Basic feature analysis
npm run dev examples/basic-usage.ts

# Complete workflow
npm run dev examples/complete-workflow.ts

# Project with multiple features
npm run dev examples/project-analysis.ts
```

## Development

```bash
# Build
npm run build

# Run TypeScript directly
npm run dev src/index.ts

# Lint
npm run lint

# Format
npm run format
```

## API Reference

### BokataAPI

Main interface for interacting with the agents.

#### Methods

- `analyzeFeature(feature: FeatureInput): Promise<FeatureAnalysis>`
- `analyzeProject(project: ProjectInput): Promise<ProjectAnalysis>`
- `generateImplementationPaths(analysis: FeatureAnalysis): Promise<ImplementationPath[]>`
- `generateCompatibilityMatrix(analysis: FeatureAnalysis): Promise<CompatibilityMatrix>`
- `runCompleteWorkflow(feature: FeatureInput): Promise<{analysis, paths, matrix}>`

### Types

Key types exported:

- `FeatureInput` - Feature to analyze
- `ProjectInput` - Project with multiple features
- `FeatureAnalysis` - Analysis result
- `ProjectAnalysis` - Project analysis result
- `Increment` - Single vertical slice
- `WalkingSkeleton` - Minimal viable slice
- `ImplementationPath` - Implementation strategy
- `CompatibilityMatrix` - Increment compatibility

## Use Cases

### Web Applications
Create REST API endpoints for feature analysis

### Mobile Apps
Integrate into React Native or Flutter apps

### CLI Tools
Build command-line tools for project planning

### CI/CD Pipelines
Automate feature analysis in development workflows

### Project Management Tools
Integrate with Jira, Linear, or custom PM tools

## Decomposition Strategies

The system applies these strategies automatically:

1. **Start with Visible Results** - UI first, then backend
2. **Zero/One/Many** - Hardcoded → Single → Multiple
3. **Dummy to Dynamic** - Static → Real implementation
4. **Simplify Workflows** - Happy path → Edge cases
5. **Defer Edge Cases** - Core → Error handling
6. **Layered Functionality** - Basic → Enhanced → Advanced
7. **Progressive Enhancement** - Must-have → Nice-to-have

## Naming Convention

All features must follow: **[Actor] + [Action]**

Examples:
- "User Resets Password"
- "Coach Records Audio"
- "Admin Manages Users"

## Dependencies

Every increment specifies:

- **REQUIRES**: What it needs to function
- **PROVIDES**: What capabilities it offers
- **COMPATIBLE WITH**: What can be built together

## License

GPL-3.0

## Credits

Based on [bokata-slicer-cc](https://github.com/abrahamvallez/bokata-slicer-cc) by Abraham Vallez.

## Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## Support

For issues and questions:
- GitHub Issues: https://github.com/abrahamvallez/bokata-agent/issues
- Original project: https://github.com/abrahamvallez/bokata-slicer-cc
