# Bokata Agent

LangChain/LangGraph TypeScript implementation of [bokata-slicer-cc](https://github.com/abrahamvallez/bokata-slicer-cc) - Multi-agent system for feature decomposition using the Hamburger Method.

## 🎯 Overview

Bokata Agent es una implementación completa en TypeScript con LangChain que replica EXACTAMENTE los prompts y la arquitectura del repositorio original bokata-slicer-cc. Permite llamar a los agentes desde web apps, mobile apps, CLIs y otras interfaces.

### ✨ Características Clave

- ✅ **Prompts Originales**: Usa los prompts EXACTOS sin modificaciones
- ✅ **4 Comandos Principales**: `/bokata`, `/bokata-feature`, `/bokata-iterations-paths`, `/bokata-matrix`
- ✅ **10 Sub-Agentes Especialistas**: Cada uno con su prompt original
- ✅ **TypeScript Completo**: Type-safe y modular
- ✅ **LangChain/Anthropic**: Usa Claude 3.5 Sonnet
- ✅ **Multi-Interfaz**: CLI, API, Web, Mobile

## 📦 Instalación

```bash
npm install bokata-agent
```

O clona el repositorio:

```bash
git clone https://github.com/abrahamvallez/bokata-agent.git
cd bokata-agent
npm install
```

## 🚀 Quick Start

### Configuración

Crea un archivo `.env`:

```env
ANTHROPIC_API_KEY=tu_api_key_aquí
MODEL_NAME=claude-3-5-sonnet-20241022
TEMPERATURE=0.7
VERBOSE=true
```

### Uso desde CLI

```bash
# Compilar
npm run build

# Analizar una feature
npm run bokata-feature "User Resets Password via Email"

# Analizar un proyecto completo
npm run bokata "Project: Task Management Platform with projects, tasks, and collaboration"

# Generar rutas de implementación
npm run bokata-paths -- -f ./output/analysis.md

# Generar matriz de selección
npm run bokata-matrix -- -f ./output/analysis.md
```

### Uso desde TypeScript/JavaScript

```typescript
import { createBokataCommands } from 'bokata-agent';

const commands = createBokataCommands();

// Analizar feature
const featureResult = await commands.bokataFeature(`
Feature: User Resets Password

Description: Users can reset their password via email
Context: SaaS app, security critical
Tech Stack: React, Node.js, PostgreSQL
`);

console.log(featureResult.output);

// Analizar proyecto
const projectResult = await commands.bokata(`
Project: E-commerce Platform

Features:
- User Browses Catalog
- User Adds to Cart
- User Completes Checkout
`);

console.log(projectResult.output);
```

## 🏗️ Arquitectura

La arquitectura replica exactamente el original:

```
bokata-agent/
├── commands/                  # Comandos principales
│   ├── bokata.md             # Análisis de proyecto
│   ├── bokata-feature.md     # Análisis de feature
│   ├── bokata-iterations-paths.md
│   └── bokata-matrix.md
│
├── agents/bokata-slicer/     # Sub-agentes especializados
│   ├── feature-analyzer.md
│   ├── project-analyzer.md
│   ├── step-analyzer-specialist.md
│   ├── increment-generator-specialist.md
│   ├── path-composer-specialist.md
│   ├── selection-matrix-specialist.md
│   ├── iteration-planner-specialist.md
│   ├── decision-guide-specialist.md
│   ├── feature-backbone-specialist.md
│   └── doc-generator.md
│
└── src/                      # Implementación TypeScript
    ├── agents/               # Agentes y coordinadores
    ├── api/                  # APIs públicas
    ├── cli/                  # Interfaz CLI
    ├── orchestrator/         # Orquestador
    ├── types/                # Tipos TypeScript
    └── utils/                # Utilidades (prompt loader, etc.)
```

## 📋 Comandos Disponibles

### 1. `/bokata` - Análisis de Proyecto

Analiza proyectos con **múltiples features**.

```typescript
const result = await commands.bokata(`
Project: Task Management Platform

Features:
- User Creates Project
- User Adds Task
- User Assigns Task
- User Updates Task Status

Tech Stack: React, Node.js, PostgreSQL
Timeline: 3 months to MVP
`);
```

**Genera:**
- Executive Summary
- Feature Backbone Overview
- Feature Breakdown (cada feature con steps e increments)
- Cross-Feature Walking Skeleton

### 2. `/bokata-feature` - Análisis de Feature Individual

Analiza **UNA sola feature** en detalle.

```typescript
const result = await commands.bokataFeature(`
Feature: User Resets Password

Description: Users can reset password via email
Context: SaaS app, security critical
`);
```

**Genera:**
- Executive Summary
- Feature Breakdown (steps + increments)
- Walking Skeleton

### 3. `/bokata-iterations-paths` - Rutas de Implementación

Genera 3-5 opciones de iteración estratégicas.

```typescript
const analysisFile = fs.readFileSync('./feature-analysis.md', 'utf-8');
const result = await commands.bokataIterationsPaths(analysisFile);
```

**Genera:**
- Speed-Focused Path
- Quality-Focused Path
- Balanced Approach
- Feature-by-Feature (para proyectos)
- Cross-Feature Enhancement (para proyectos)

### 4. `/bokata-matrix` - Matriz de Selección

Genera matriz completa de incrementos con dependencias.

```typescript
const analysisFile = fs.readFileSync('./feature-analysis.md', 'utf-8');
const result = await commands.bokataMatrix(analysisFile);
```

**Genera:**
- Catálogo completo de incrementos
- Matriz de dependencias (REQUIRES/PROVIDES/COMPATIBLE WITH)
- Walking Skeleton validation
- Custom path building guide

## 🔧 Sub-Agentes Especialistas

Puedes llamar a sub-agentes directamente:

```typescript
// Listar disponibles
const specialists = commands.getAvailableSpecialists();
console.log(specialists);
// ['feature-analyzer', 'project-analyzer', 'step-analyzer-specialist', ...]

// Llamar directamente
const result = await commands.executeSpecialist(
  'step-analyzer-specialist',
  'Feature: Product Search\n\nDescription: ...'
);
```

### Especialistas Disponibles

1. **feature-analyzer** - Coordina análisis de feature
2. **project-analyzer** - Coordina análisis de proyecto
3. **step-analyzer-specialist** - Identifica pasos técnicos/de negocio (3-7 pasos)
4. **increment-generator-specialist** - Genera incrementos (5-10 por paso)
5. **path-composer-specialist** - Compone Walking Skeleton
6. **selection-matrix-specialist** - Genera matriz de compatibilidad
7. **iteration-planner-specialist** - Genera rutas de iteración
8. **decision-guide-specialist** - Crea guía de decisión
9. **feature-backbone-specialist** - Identifica features del proyecto
10. **doc-generator** - Genera documentación markdown final

## 🌐 Integración con Web/Apps

### REST API (Express.js)

```typescript
import express from 'express';
import { createBokataCommands } from 'bokata-agent';

const app = express();
const commands = createBokataCommands();

app.post('/api/analyze/feature', async (req, res) => {
  const result = await commands.bokataFeature(req.body.input);
  res.json({ success: true, data: result });
});

app.post('/api/analyze/project', async (req, res) => {
  const result = await commands.bokata(req.body.input);
  res.json({ success: true, data: result });
});

app.listen(3000);
```

### Cliente Web (React/Next.js)

```typescript
async function analyzeFeature(description: string) {
  const response = await fetch('/api/analyze/feature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: description })
  });
  return response.json();
}
```

### App Móvil (React Native)

```typescript
import { createBokataCommands } from 'bokata-agent';

const commands = createBokataCommands({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const result = await commands.bokataFeature(userInput);
```

## 📖 Ejemplos

Ver el directorio `examples/`:

- **`using-commands.ts`** - Uso de comandos principales
- **`using-specialists.ts`** - Uso de sub-agentes directamente
- **`web-integration.ts`** - Integración con Express.js
- **`basic-usage.ts`** - Uso básico del API
- **`complete-workflow.ts`** - Workflow completo

Ejecutar ejemplos:

```bash
npm run dev:example examples/using-commands.ts
npm run dev:example examples/using-specialists.ts
```

## 🎓 Metodología Hamburger Method

Cada incremento debe responder: **"¿Qué enviaríamos si la deadline fuera mañana?"**

Requisitos:
- ✅ Atravesar todas las capas técnicas (UI → Logic → Data)
- ✅ Entregar valor observable al usuario
- ✅ Ser independientemente desplegable
- ✅ Permitir retroalimentación temprana

### Estrategias de Descomposición

El sistema aplica 20+ estrategias automáticamente:

1. **Start with Visible Results** - UI primero
2. **Zero/One/Many** - Hardcoded → Single → Multiple
3. **Dummy to Dynamic** - Estático → Real
4. **Simplify Workflows** - Happy path → Edge cases
5. **Defer Edge Cases** - Core → Validaciones
6. **Layered Functionality** - Basic → Enhanced → Advanced
7. **Progressive Enhancement** - Must-have → Nice-to-have

### Convención de Nomenclatura

Todas las features siguen: **[Actor] + [Acción]**

- ✅ "User Resets Password"
- ✅ "Coach Records Audio"
- ✅ "Admin Manages Users"

### Dependencias

Cada incremento especifica:

- **REQUIRES**: Dependencias necesarias (o "None")
- **PROVIDES**: Capacidades que ofrece
- **COMPATIBLE WITH**: Con qué otros incrementos funciona

## 📂 Estructura de Salida

Los análisis generan documentos markdown estructurados:

```markdown
# Executive Summary
Métricas y overview del análisis

# Feature Backbone Overview
Lista de features (para proyectos) o descripción (para features)

# Feature Breakdown - Complete Analysis
## Feature: [Name]
### Step 1: [Name]
| # | Increment | Depends | Strategy | Notes |
|---|-----------|---------|----------|-------|
| 1.1 | ... | None | Zero/One/Many | ... |

# Walking Skeleton
Composición mínima viable con validación de dependencias
```

## 🛠️ Development

```bash
# Instalar dependencias
npm install

# Compilar
npm run build

# Desarrollo
npm run dev

# Lint
npm run lint

# Format
npm run format
```

## 📝 Documentation

- **README.md** - Este archivo
- **USAGE.md** - Guía de uso detallada
- **CONTRIBUTING.md** - Guía para contribuir
- **examples/** - Ejemplos de uso

## 🔗 Links

- **Repositorio Original**: [bokata-slicer-cc](https://github.com/abrahamvallez/bokata-slicer-cc)
- **Issues**: [GitHub Issues](https://github.com/abrahamvallez/bokata-agent/issues)

## 📜 License

GPL-3.0 - Same as the original bokata-slicer-cc

## 🙏 Credits

Basado en [bokata-slicer-cc](https://github.com/abrahamvallez/bokata-slicer-cc) por Abraham Vallez.

Esta implementación usa los prompts EXACTOS del repositorio original, sin modificaciones.

---

**Made with ❤️ using LangChain and TypeScript**
