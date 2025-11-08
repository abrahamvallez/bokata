import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root directory of the project
const PROJECT_ROOT = join(__dirname, '../..');

/**
 * Load a prompt from a markdown file
 * Preserves the EXACT prompt from the original bokata-slicer-cc repository
 */
export function loadPrompt(promptPath: string): string {
  try {
    const fullPath = join(PROJECT_ROOT, promptPath);
    const content = readFileSync(fullPath, 'utf-8');

    // Remove YAML frontmatter if present
    const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');

    return withoutFrontmatter.trim();
  } catch (error) {
    throw new Error(`Failed to load prompt from ${promptPath}: ${error}`);
  }
}

/**
 * Load all specialist prompts
 */
export const PROMPTS = {
  // Coordinators
  projectAnalyzer: () => loadPrompt('agents/bokata-slicer/project-analyzer.md'),

  // Specialists
  featureBackbone: () => loadPrompt('agents/bokata-slicer/feature-backbone-specialist.md'),
  stepAnalyzer: () => loadPrompt('agents/bokata-slicer/step-analyzer-specialist.md'),
  incrementGenerator: () => loadPrompt('agents/bokata-slicer/increment-generator-specialist.md'),
  pathComposer: () => loadPrompt('agents/bokata-slicer/path-composer-specialist.md'),
  docGenerator: () => loadPrompt('agents/bokata-slicer/doc-generator.md'),

  // Additional specialists (if needed)
  featureAnalyzer: () => loadPrompt('agents/bokata-slicer/feature-analyzer.md'),
  iterationPlanner: () => loadPrompt('agents/bokata-slicer/iteration-planner-specialist.md'),
  selectionMatrix: () => loadPrompt('agents/bokata-slicer/selection-matrix-specialist.md'),
  decisionGuide: () => loadPrompt('agents/bokata-slicer/decision-guide-specialist.md'),
} as const;

export type PromptName = keyof typeof PROMPTS;
