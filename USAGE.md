## Uso de Bokata Agent

# Bokata Agent - Guía de Uso

Esta guía explica cómo usar Bokata Agent con los prompts exactos del repositorio original bokata-slicer-cc.

## Arquitectura

Bokata Agent replica exactamente la arquitectura del original:

```
commands/              # Comandos principales (/bokata, /bokata-feature, etc.)
  ├── bokata.md
  ├── bokata-feature.md
  ├── bokata-iterations-paths.md
  └── bokata-matrix.md

agents/bokata-slicer/  # Sub-agentes especializados
  ├── feature-analyzer.md
  ├── project-analyzer.md
  ├── step-analyzer-specialist.md
  ├── increment-generator-specialist.md
  ├── path-composer-specialist.md
  ├── selection-matrix-specialist.md
  ├── iteration-planner-specialist.md
  ├── decision-guide-specialist.md
  ├── feature-backbone-specialist.md
  └── doc-generator.md
```

## Comandos Disponibles

### 1. `/bokata` - Análisis de Proyecto

Analiza proyectos completos con múltiples features.

```bash
# CLI
npm run bokata "Project: E-commerce platform with catalog, cart, and checkout"

# O con archivo
npm run bokata -- -f ./docs/project-spec.md -o ./output
```

```typescript
// API
import { createBokataCommands } from 'bokata-agent';

const commands = createBokataCommands();
const result = await commands.bokata(`
Project: Task Management Platform

Features:
- User Creates Project
- User Adds Task
- User Assigns Task
- User Updates Task Status
`);
```

### 2. `/bokata-feature` - Análisis de Feature Individual

Analiza UNA feature en detalle.

```bash
# CLI
npm run bokata-feature "User Resets Password via Email"

# O con más contexto
npm run bokata-feature -- -f ./feature-spec.md -o ./output
```

```typescript
// API
const result = await commands.bokataFeature(`
Feature: User Resets Password

Description: Users can reset their password if they forget it.
The system sends a reset link via email, validates the token,
and allows setting a new password.

Context: SaaS app, security critical
Tech Stack: React, Node.js, PostgreSQL, SendGrid
`);
```

### 3. `/bokata-iterations-paths` - Generar Rutas de Implementación

Genera 3-5 opciones de iteración estratégicas basadas en un análisis previo.

```bash
# CLI
npm run bokata-paths -- -f ./output/feature-analysis-2025-11-08.md -o ./output
```

```typescript
// API
const analysisFile = fs.readFileSync('./feature-analysis.md', 'utf-8');
const result = await commands.bokataIterationsPaths(analysisFile);
```

### 4. `/bokata-matrix` - Generar Matriz de Selección

Genera una matriz completa de incrementos con dependencias.

```bash
# CLI
npm run bokata-matrix -- -f ./output/feature-analysis-2025-11-08.md -o ./output
```

```typescript
// API
const analysisFile = fs.readFileSync('./feature-analysis.md', 'utf-8');
const result = await commands.bokataMatrix(analysisFile);
```

## Uso de Sub-Agentes Especialistas

Puedes llamar a los sub-agentes directamente:

```typescript
import { createBokataCommands } from 'bokata-agent';

const commands = createBokataCommands();

// Llamar al step-analyzer-specialist
const stepsResult = await commands.executeSpecialist(
  'step-analyzer-specialist',
  'Feature: Product Search\n\nUsers need to search for products...'
);

// Llamar al increment-generator-specialist
const incrementsResult = await commands.executeSpecialist(
  'increment-generator-specialist',
  'Step: Capture User Input\n\nDescription: ...'
);

// Llamar al path-composer-specialist
const skeletonResult = await commands.executeSpecialist(
  'path-composer-specialist',
  'All steps and increments...'
);
```

## Sub-Agentes Disponibles

1. **feature-analyzer** - Coordina análisis completo de una feature
2. **project-analyzer** - Coordina análisis de proyecto multi-feature
3. **step-analyzer-specialist** - Identifica pasos técnicos/de negocio
4. **increment-generator-specialist** - Genera incrementos por paso
5. **path-composer-specialist** - Compone Walking Skeleton
6. **selection-matrix-specialist** - Genera matriz de compatibilidad
7. **iteration-planner-specialist** - Genera rutas de iteración
8. **decision-guide-specialist** - Crea guía de decisión
9. **feature-backbone-specialist** - Identifica features del proyecto
10. **doc-generator** - Genera documentación final

## Integración con Web/Apps

### REST API con Express

```typescript
import express from 'express';
import { createBokataCommands } from 'bokata-agent';

const app = express();
app.use(express.json());

const commands = createBokataCommands();

app.post('/api/analyze/feature', async (req, res) => {
  try {
    const result = await commands.bokataFeature(req.body.input);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/analyze/project', async (req, res) => {
  try {
    const result = await commands.bokata(req.body.input);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000);
```

### Cliente Web (React/Next.js)

```typescript
async function analyzeFeature(featureDescription: string) {
  const response = await fetch('/api/analyze/feature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: featureDescription })
  });

  const data = await response.json();
  return data;
}
```

### App Móvil (React Native)

```typescript
import { createBokataCommands } from 'bokata-agent';

const commands = createBokataCommands({
  apiKey: process.env.ANTHROPIC_API_KEY,
  modelName: 'claude-3-5-sonnet-20241022'
});

// Usar en tu app
const result = await commands.bokataFeature(userInput);
```

## Configuración

Crea un archivo `.env`:

```env
ANTHROPIC_API_KEY=tu_api_key_aquí
MODEL_NAME=claude-3-5-sonnet-20241022
TEMPERATURE=0.7
MAX_ITERATIONS=10
VERBOSE=true
```

O configura programáticamente:

```typescript
const commands = createBokataCommands({
  apiKey: 'tu_api_key',
  modelName: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxIterations: 10,
  verbose: true
});
```

## Flujo de Trabajo Recomendado

### Para una Feature Individual

1. Ejecutar `/bokata-feature` → Obtener análisis completo
2. Revisar Walking Skeleton
3. Ejecutar `/bokata-iterations-paths` → Obtener rutas de implementación
4. Ejecutar `/bokata-matrix` → Obtener matriz de compatibilidad
5. Elegir ruta e implementar

### Para un Proyecto Completo

1. Ejecutar `/bokata` → Obtener análisis multi-feature
2. Revisar feature backbone y Walking Skeleton cross-feature
3. Ejecutar `/bokata-iterations-paths` en análisis del proyecto
4. Implementar según prioridades

## Ejemplos Completos

Ver el directorio `examples/` para:

- `using-commands.ts` - Uso de comandos principales
- `using-specialists.ts` - Uso de sub-agentes directamente
- `web-integration.ts` - Integración con Express.js
- `basic-usage.ts` - Uso básico del API original
- `complete-workflow.ts` - Workflow completo

## Prompts Originales

Todos los prompts se cargan automáticamente desde:
- `commands/*.md` - Prompts de comandos principales
- `agents/bokata-slicer/*.md` - Prompts de sub-agentes

Los prompts son EXACTAMENTE los mismos que en el repositorio original, sin modificaciones.

## Soporte

Para preguntas o problemas:
- GitHub Issues: https://github.com/abrahamvallez/bokata-agent/issues
- Repositorio original: https://github.com/abrahamvallez/bokata-slicer-cc
