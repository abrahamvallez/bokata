import { AgentConfig, AnalysisRequest, AnalysisResponse, WorkflowContext } from '../types';
import {
  FeatureAnalyzerAgent,
  ProjectAnalyzerAgent,
  PathsGeneratorAgent,
  MatrixGeneratorAgent
} from '../agents';
import { logger } from '../utils/logger';
import { ContextManager } from '../utils/context-manager';

/**
 * Bokata Orchestrator
 * Coordinates multiple agents
 */
export class BokataOrchestrator {
  private config: AgentConfig;
  private featureAnalyzer: FeatureAnalyzerAgent;
  private projectAnalyzer: ProjectAnalyzerAgent;
  private pathsGenerator: PathsGeneratorAgent;
  private matrixGenerator: MatrixGeneratorAgent;

  constructor(config: AgentConfig) {
    this.config = config;
    this.featureAnalyzer = new FeatureAnalyzerAgent(config);
    this.projectAnalyzer = new ProjectAnalyzerAgent(config);
    this.pathsGenerator = new PathsGeneratorAgent(config);
    this.matrixGenerator = new MatrixGeneratorAgent(config);
  }

  /**
   * Process an analysis request
   */
  async processRequest(request: AnalysisRequest): Promise<AnalysisResponse> {
    logger.info('Processing request', { type: request.type });

    try {
      switch (request.type) {
        case 'feature':
          return await this.analyzeFeature(request.data);

        case 'project':
          return await this.analyzeProject(request.data);

        case 'paths':
          return await this.generatePaths(request.data.analysis);

        case 'matrix':
          return await this.generateMatrix(request.data.analysis);

        default:
          return {
            success: false,
            error: `Unknown request type: ${(request as any).type}`
          };
      }
    } catch (error) {
      logger.error('Request processing failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Analyze a single feature
   */
  private async analyzeFeature(data: any): Promise<AnalysisResponse> {
    try {
      const analysis = await this.featureAnalyzer.execute(data);
      return { success: true, data: analysis };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Feature analysis failed'
      };
    }
  }

  /**
   * Analyze a project with multiple features
   */
  private async analyzeProject(data: any): Promise<AnalysisResponse> {
    try {
      const analysis = await this.projectAnalyzer.execute(data);
      return { success: true, data: analysis };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Project analysis failed'
      };
    }
  }

  /**
   * Generate implementation paths
   */
  private async generatePaths(analysis: any): Promise<AnalysisResponse> {
    try {
      const paths = await this.pathsGenerator.execute(analysis);
      return { success: true, data: paths };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Paths generation failed'
      };
    }
  }

  /**
   * Generate compatibility matrix
   */
  private async generateMatrix(analysis: any): Promise<AnalysisResponse> {
    try {
      const matrix = await this.matrixGenerator.execute(analysis);
      return { success: true, data: matrix };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Matrix generation failed'
      };
    }
  }

  /**
   * Run complete workflow: analyze + paths + matrix
   * Uses ContextManager to track agent execution and share context
   */
  async runCompleteWorkflow(input: any): Promise<{
    analysis: any;
    paths?: any[];
    matrix?: any;
    messages: Array<{ role: string; content: string; timestamp: Date }>;
    context?: WorkflowContext;
  }> {
    logger.info('Running complete workflow');

    const messages: Array<{ role: string; content: string; timestamp: Date }> = [
      {
        role: 'user',
        content: 'Starting Bokata analysis workflow',
        timestamp: new Date()
      }
    ];

    // Determine workflow type
    const workflowType: 'feature' | 'project' = 'features' in input ? 'project' : 'feature';

    // Create context manager
    const contextManager = new ContextManager(workflowType, input, {
      description: 'Complete Bokata analysis workflow'
    });

    try {
      // Step 1: Analyze feature or project
      let analysis;
      if (workflowType === 'project') {
        contextManager.setPhase('project-analysis');

        // Set context on agent
        this.projectAnalyzer.setContext(contextManager.getContext());

        analysis = await contextManager.executeAgent(
          'ProjectAnalyzer',
          'analyzer',
          input,
          () => this.projectAnalyzer.execute(input)
        );

        messages.push({
          role: 'assistant',
          content: 'Project analysis completed',
          timestamp: new Date()
        });
      } else {
        contextManager.setPhase('feature-analysis');

        // Set context on agent
        this.featureAnalyzer.setContext(contextManager.getContext());

        analysis = await contextManager.executeAgent(
          'FeatureAnalyzer',
          'analyzer',
          input,
          () => this.featureAnalyzer.execute(input)
        );

        messages.push({
          role: 'assistant',
          content: 'Feature analysis completed',
          timestamp: new Date()
        });

        // Store analysis in shared data for next agents
        contextManager.setSharedData('analysis', analysis);

        // Step 2: Generate paths (only for features)
        contextManager.setPhase('paths-generation');
        this.pathsGenerator.setContext(contextManager.getContext());

        const paths = await contextManager.executeAgent(
          'PathsGenerator',
          'generator',
          analysis,
          () => this.pathsGenerator.execute(analysis)
        );

        messages.push({
          role: 'assistant',
          content: `Generated ${paths.length} implementation paths`,
          timestamp: new Date()
        });

        contextManager.setSharedData('paths', paths);

        // Step 3: Generate matrix (only for features)
        contextManager.setPhase('matrix-generation');
        this.matrixGenerator.setContext(contextManager.getContext());

        const matrix = await contextManager.executeAgent(
          'MatrixGenerator',
          'generator',
          analysis,
          () => this.matrixGenerator.execute(analysis)
        );

        messages.push({
          role: 'assistant',
          content: 'Compatibility matrix generated',
          timestamp: new Date()
        });

        contextManager.setSharedData('matrix', matrix);

        return {
          analysis,
          paths,
          matrix,
          messages,
          context: contextManager.getContext()
        };
      }

      return {
        analysis,
        messages,
        context: contextManager.getContext()
      };
    } catch (error) {
      logger.error('Workflow failed', error);
      messages.push({
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Get workflow context export for debugging
   */
  exportWorkflowContext(context: WorkflowContext): string {
    const manager = new ContextManager('feature', {}, {});
    manager['context'] = context; // Access private property for export
    return manager.export();
  }
}
