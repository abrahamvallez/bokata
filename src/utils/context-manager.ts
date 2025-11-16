import { WorkflowContext, AgentExecutionResult } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

/**
 * Context Manager
 * Manages workflow context and agent execution results
 */
export class ContextManager {
  private context: WorkflowContext;

  constructor(
    workflowType: 'feature' | 'project' | 'paths' | 'matrix',
    originalInput: any,
    metadata?: any
  ) {
    this.context = {
      workflowId: uuidv4(),
      workflowType,
      startTime: new Date(),
      originalInput,
      currentPhase: 'initialization',
      agentResults: [],
      sharedData: {},
      metadata: metadata || {}
    };

    logger.info(`Created workflow context: ${this.context.workflowId}`, {
      type: workflowType
    });
  }

  /**
   * Get the current context
   */
  getContext(): WorkflowContext {
    return { ...this.context };
  }

  /**
   * Get context as JSON string
   */
  getContextJSON(pretty: boolean = true): string {
    return pretty
      ? JSON.stringify(this.context, null, 2)
      : JSON.stringify(this.context);
  }

  /**
   * Update current phase
   */
  setPhase(phase: string): void {
    this.context.currentPhase = phase;
    logger.info(`Workflow phase changed to: ${phase}`);
  }

  /**
   * Add agent execution result
   */
  addAgentResult(result: AgentExecutionResult): void {
    this.context.agentResults.push(result);
    logger.info(`Added result from agent: ${result.agentName}`, {
      success: result.success,
      duration: result.durationMs
    });
  }

  /**
   * Get results from a specific agent
   */
  getAgentResult(agentName: string): AgentExecutionResult | undefined {
    return this.context.agentResults.find(r => r.agentName === agentName);
  }

  /**
   * Get all results from agents of a specific type
   */
  getAgentResultsByType(agentType: string): AgentExecutionResult[] {
    return this.context.agentResults.filter(r => r.agentType === agentType);
  }

  /**
   * Get the last agent result
   */
  getLastAgentResult(): AgentExecutionResult | undefined {
    return this.context.agentResults[this.context.agentResults.length - 1];
  }

  /**
   * Set shared data that agents can access
   */
  setSharedData(key: string, value: any): void {
    this.context.sharedData[key] = value;
    logger.debug(`Set shared data: ${key}`);
  }

  /**
   * Get shared data
   */
  getSharedData(key: string): any {
    return this.context.sharedData[key];
  }

  /**
   * Get all shared data
   */
  getAllSharedData(): any {
    return { ...this.context.sharedData };
  }

  /**
   * Set metadata
   */
  setMetadata(key: string, value: any): void {
    this.context.metadata[key] = value;
  }

  /**
   * Get metadata
   */
  getMetadata(key: string): any {
    return this.context.metadata[key];
  }

  /**
   * Create agent execution result wrapper
   */
  async executeAgent<T>(
    agentName: string,
    agentType: string,
    input: any,
    executor: () => Promise<T>
  ): Promise<T> {
    const startTime = new Date();

    try {
      logger.info(`Executing agent: ${agentName}`);
      const output = await executor();
      const endTime = new Date();

      const result: AgentExecutionResult = {
        agentName,
        agentType,
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime(),
        input,
        output,
        success: true
      };

      this.addAgentResult(result);
      return output;
    } catch (error) {
      const endTime = new Date();
      const errorMessage = error instanceof Error ? error.message : String(error);

      const result: AgentExecutionResult = {
        agentName,
        agentType,
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime(),
        input,
        output: null,
        success: false,
        error: errorMessage
      };

      this.addAgentResult(result);
      throw error;
    }
  }

  /**
   * Get execution summary
   */
  getSummary(): {
    workflowId: string;
    workflowType: string;
    totalAgents: number;
    successfulAgents: number;
    failedAgents: number;
    totalDurationMs: number;
    phases: string[];
  } {
    const now = new Date();
    const successful = this.context.agentResults.filter(r => r.success).length;
    const failed = this.context.agentResults.filter(r => !r.success).length;
    const totalDuration = now.getTime() - this.context.startTime.getTime();

    return {
      workflowId: this.context.workflowId,
      workflowType: this.context.workflowType,
      totalAgents: this.context.agentResults.length,
      successfulAgents: successful,
      failedAgents: failed,
      totalDurationMs: totalDuration,
      phases: [this.context.currentPhase]
    };
  }

  /**
   * Export context for debugging or persistence
   */
  export(): string {
    return JSON.stringify({
      ...this.context,
      summary: this.getSummary()
    }, null, 2);
  }

  /**
   * Import context from JSON
   */
  static import(json: string): ContextManager {
    const data = JSON.parse(json);
    const manager = new ContextManager(
      data.workflowType,
      data.originalInput,
      data.metadata
    );
    manager.context = data;
    return manager;
  }
}
