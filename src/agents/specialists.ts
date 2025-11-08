import { BaseAgent } from './base-agent.js';
import { PROMPTS } from '../utils/prompt-loader.js';

/**
 * Feature Backbone Specialist
 * Identifies features in Actor+Action format representing the user journey
 */
export class FeatureBackboneAgent extends BaseAgent {
  constructor() {
    super(PROMPTS.featureBackbone());
  }
}

/**
 * Step Analyzer Specialist
 * Decomposes features into technical/business/logical steps
 */
export class StepAnalyzerAgent extends BaseAgent {
  constructor() {
    super(PROMPTS.stepAnalyzer());
  }
}

/**
 * Increment Generator Specialist
 * Generates 5-10 increments per step using breakdown strategies
 */
export class IncrementGeneratorAgent extends BaseAgent {
  constructor() {
    super(PROMPTS.incrementGenerator());
  }
}

/**
 * Path Composer Specialist
 * Composes Walking Skeleton by selecting simplest increments
 */
export class PathComposerAgent extends BaseAgent {
  constructor() {
    super(PROMPTS.pathComposer());
  }
}

/**
 * Doc Generator
 * Generates final markdown/JSON document with fixed structure
 */
export class DocGeneratorAgent extends BaseAgent {
  constructor() {
    super(PROMPTS.docGenerator());
  }
}

/**
 * Feature Analyzer (optional)
 * Single feature analysis
 */
export class FeatureAnalyzerAgent extends BaseAgent {
  constructor() {
    super(PROMPTS.featureAnalyzer());
  }
}
