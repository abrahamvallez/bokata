import { BokataOrchestrator } from '../orchestrator';
import { getConfig, validateConfig } from '../utils/config';
import {
  FeatureInput,
  ProjectInput,
  FeatureAnalysis,
  ProjectAnalysis,
  ImplementationPath,
  CompatibilityMatrix,
  AnalysisRequest,
  AnalysisResponse,
  AgentConfig
} from '../types';
import { logger } from '../utils/logger';

/**
 * Bokata API
 * Main interface for external applications to interact with Bokata agents
 */
export class BokataAPI {
  private orchestrator: BokataOrchestrator;
  private config: AgentConfig;

  /**
   * Create a new Bokata API instance
   * @param config Optional configuration, uses environment variables if not provided
   */
  constructor(config?: Partial<AgentConfig>) {
    const defaultConfig = getConfig();
    this.config = { ...defaultConfig, ...config };
    validateConfig(this.config);

    this.orchestrator = new BokataOrchestrator(this.config);
    logger.info('Bokata API initialized');
  }

  /**
   * Analyze a single feature
   * @param feature Feature input data
   * @returns Feature analysis with increments and walking skeleton
   */
  async analyzeFeature(feature: FeatureInput): Promise<FeatureAnalysis> {
    logger.info('API: Analyzing feature', { name: feature.name });

    const request: AnalysisRequest = {
      type: 'feature',
      data: feature
    };

    const response = await this.orchestrator.processRequest(request);

    if (!response.success) {
      throw new Error(response.error);
    }

    return response.data as FeatureAnalysis;
  }

  /**
   * Analyze a project with multiple features
   * @param project Project input data with features
   * @returns Project analysis with cross-feature dependencies
   */
  async analyzeProject(project: ProjectInput): Promise<ProjectAnalysis> {
    logger.info('API: Analyzing project', {
      name: project.name,
      featureCount: project.features.length
    });

    const request: AnalysisRequest = {
      type: 'project',
      data: project
    };

    const response = await this.orchestrator.processRequest(request);

    if (!response.success) {
      throw new Error(response.error);
    }

    return response.data as ProjectAnalysis;
  }

  /**
   * Generate implementation paths for a feature
   * @param analysis Existing feature analysis
   * @returns Array of implementation paths
   */
  async generateImplementationPaths(analysis: FeatureAnalysis): Promise<ImplementationPath[]> {
    logger.info('API: Generating implementation paths', {
      feature: analysis.feature.name
    });

    const request: AnalysisRequest = {
      type: 'paths',
      data: { analysis }
    };

    const response = await this.orchestrator.processRequest(request);

    if (!response.success) {
      throw new Error(response.error);
    }

    return response.data as ImplementationPath[];
  }

  /**
   * Generate compatibility matrix for a feature
   * @param analysis Existing feature analysis
   * @returns Compatibility matrix
   */
  async generateCompatibilityMatrix(analysis: FeatureAnalysis): Promise<CompatibilityMatrix> {
    logger.info('API: Generating compatibility matrix', {
      feature: analysis.feature.name
    });

    const request: AnalysisRequest = {
      type: 'matrix',
      data: { analysis }
    };

    const response = await this.orchestrator.processRequest(request);

    if (!response.success) {
      throw new Error(response.error);
    }

    return response.data as CompatibilityMatrix;
  }

  /**
   * Run complete workflow: analyze feature + generate paths + generate matrix
   * @param feature Feature input data
   * @returns Complete analysis with paths and matrix
   */
  async runCompleteWorkflow(feature: FeatureInput): Promise<{
    analysis: FeatureAnalysis;
    paths: ImplementationPath[];
    matrix: CompatibilityMatrix;
  }> {
    logger.info('API: Running complete workflow', { feature: feature.name });

    // Step 1: Analyze feature
    const analysis = await this.analyzeFeature(feature);

    // Step 2: Generate paths
    const paths = await this.generateImplementationPaths(analysis);

    // Step 3: Generate matrix
    const matrix = await this.generateCompatibilityMatrix(analysis);

    return { analysis, paths, matrix };
  }

  /**
   * Process a raw analysis request
   * @param request Analysis request object
   * @returns Analysis response
   */
  async processRequest(request: AnalysisRequest): Promise<AnalysisResponse> {
    return this.orchestrator.processRequest(request);
  }

  /**
   * Get current configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   * @param config Partial configuration to update
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config };
    validateConfig(this.config);
    this.orchestrator = new BokataOrchestrator(this.config);
    logger.info('Configuration updated');
  }
}

/**
 * Create a new Bokata API instance (factory function)
 */
export function createBokataAPI(config?: Partial<AgentConfig>): BokataAPI {
  return new BokataAPI(config);
}
