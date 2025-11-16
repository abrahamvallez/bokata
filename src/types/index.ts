import { z } from 'zod';

/**
 * Feature decomposition strategies based on the Hamburger Method
 */
export enum DecompositionStrategy {
  VISIBLE_RESULTS_FIRST = 'visible_results_first',
  ZERO_ONE_MANY = 'zero_one_many',
  DUMMY_TO_DYNAMIC = 'dummy_to_dynamic',
  WORKFLOW_SIMPLIFICATION = 'workflow_simplification',
  DEFER_EDGE_CASES = 'defer_edge_cases',
  LAYERED_FUNCTIONALITY = 'layered_functionality',
  PROGRESSIVE_ENHANCEMENT = 'progressive_enhancement'
}

/**
 * Increment dependency information
 */
export interface IncrementDependency {
  requires: string[];
  provides: string[];
  compatibleWith: string[];
}

/**
 * Represents a single vertical slice increment
 */
export interface Increment {
  id: string;
  name: string;
  description: string;
  userValue: string;
  technicalLayers: string[];
  estimatedStoryPoints: number;
  dependencies: IncrementDependency;
  strategy: DecompositionStrategy;
  acceptanceCriteria: string[];
}

/**
 * Walking Skeleton - minimal vertical slice
 */
export interface WalkingSkeleton {
  name: string;
  description: string;
  increments: Increment[];
  totalEstimate: number;
  delivers: string[];
}

/**
 * Feature analysis input
 */
export const FeatureInputSchema = z.object({
  name: z.string().describe('Feature name in [Actor] + [Action] format'),
  description: z.string().describe('Detailed feature description'),
  context: z.string().optional().describe('Additional project context'),
  technicalStack: z.array(z.string()).optional().describe('Technologies used'),
  constraints: z.array(z.string()).optional().describe('Known constraints or limitations')
});

export type FeatureInput = z.infer<typeof FeatureInputSchema>;

/**
 * Feature decomposition result
 */
export interface FeatureAnalysis {
  feature: FeatureInput;
  executiveSummary: string;
  walkingSkeleton: WalkingSkeleton;
  allIncrements: Increment[];
  dependencies: {
    [key: string]: string[];
  };
  implementationPaths?: ImplementationPath[];
  compatibilityMatrix?: CompatibilityMatrix;
}

/**
 * Implementation path with timeline
 */
export interface ImplementationPath {
  id: string;
  name: string;
  description: string;
  increments: string[]; // increment IDs
  estimatedWeeks: number;
  estimatedStoryPoints: number;
  risks: string[];
  benefits: string[];
}

/**
 * Compatibility matrix for increments
 */
export interface CompatibilityMatrix {
  increments: string[];
  matrix: {
    [incrementId: string]: {
      [otherIncrementId: string]: 'compatible' | 'incompatible' | 'depends';
    };
  };
}

/**
 * Project analysis input (multiple features)
 */
export const ProjectInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  features: z.array(FeatureInputSchema),
  context: z.string().optional(),
  technicalStack: z.array(z.string()).optional()
});

export type ProjectInput = z.infer<typeof ProjectInputSchema>;

/**
 * Project analysis result
 */
export interface ProjectAnalysis {
  project: ProjectInput;
  executiveSummary: string;
  featureAnalyses: FeatureAnalysis[];
  crossFeatureDependencies: {
    [featureName: string]: string[];
  };
  multiFunctionalWalkingSkeleton: WalkingSkeleton;
  recommendedImplementationOrder: string[];
}

/**
 * Agent types in the system
 */
export enum AgentType {
  PROJECT_ANALYZER = 'project_analyzer',
  FEATURE_ANALYZER = 'feature_analyzer',
  PATHS_GENERATOR = 'paths_generator',
  MATRIX_GENERATOR = 'matrix_generator',
  ORCHESTRATOR = 'orchestrator'
}

/**
 * Agent state for LangGraph
 */
export interface AgentState {
  input: FeatureInput | ProjectInput;
  analysis?: FeatureAnalysis | ProjectAnalysis;
  implementationPaths?: ImplementationPath[];
  compatibilityMatrix?: CompatibilityMatrix;
  currentAgent?: AgentType;
  error?: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
}

/**
 * Output format options
 */
export enum OutputFormat {
  MARKDOWN = 'markdown',
  JSON = 'json'
}

/**
 * Agent execution result for context tracking
 */
export interface AgentExecutionResult {
  agentName: string;
  agentType: string;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  input: any;
  output: any;
  rawOutput?: string;
  success: boolean;
  error?: string;
  metadata?: any;
}

/**
 * Workflow context shared between agents
 */
export interface WorkflowContext {
  workflowId: string;
  workflowType: 'feature' | 'project' | 'paths' | 'matrix';
  startTime: Date;
  originalInput: any;
  currentPhase: string;
  agentResults: AgentExecutionResult[];
  sharedData: {
    [key: string]: any;
  };
  metadata: {
    [key: string]: any;
  };
}

/**
 * Configuration for the agent system
 */
export interface AgentConfig {
  modelName: string;
  temperature: number;
  maxIterations: number;
  verbose: boolean;
  apiKey?: string;
  outputFormat?: OutputFormat;
}

/**
 * Request types for external API
 */
export type AnalysisRequest =
  | { type: 'feature'; data: FeatureInput }
  | { type: 'project'; data: ProjectInput }
  | { type: 'paths'; data: { analysis: FeatureAnalysis } }
  | { type: 'matrix'; data: { analysis: FeatureAnalysis } };

/**
 * Response types for external API
 */
export type AnalysisResponse =
  | { success: true; data: FeatureAnalysis | ProjectAnalysis | ImplementationPath[] | CompatibilityMatrix }
  | { success: false; error: string };
