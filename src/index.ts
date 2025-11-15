/**
 * Bokata Agent - LangChain/LangGraph TypeScript implementation
 *
 * Multi-agent system for feature decomposition using the Hamburger Method
 * Uses EXACT prompts from the original bokata-slicer-cc repository
 */

// Export main APIs
export { BokataAPI, createBokataAPI } from './api/bokata-api';
export { BokataCommands, createBokataCommands } from './api/bokata-commands';

// Export orchestrator
export { BokataOrchestrator } from './orchestrator';

// Export agents
export {
  BaseAgent,
  FeatureAnalyzerAgent,
  ProjectAnalyzerAgent,
  PathsGeneratorAgent,
  MatrixGeneratorAgent
} from './agents';
export { SpecialistAgent } from './agents/specialist-agent';
export { CoordinatorAgent } from './agents/coordinator-agent';

// Export types
export * from './types';

// Export utilities
export { getConfig, validateConfig } from './utils/config';
export { Logger, logger } from './utils/logger';
export { PromptLoader } from './utils/prompt-loader';
export { CommandLoader } from './utils/command-loader';

// Export prompts (for customization)
export * from './prompts/hamburger-method';
