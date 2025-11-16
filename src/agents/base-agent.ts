import { ChatAnthropic } from '@langchain/anthropic';
import { AgentConfig, OutputFormat, WorkflowContext } from '../types';
import { logger } from '../utils/logger';
import { OutputFormatter } from '../utils/output-formatter';

/**
 * Base agent class with common functionality
 */
export abstract class BaseAgent {
  protected model: ChatAnthropic;
  protected config: AgentConfig;
  protected context?: WorkflowContext;

  constructor(config: AgentConfig, context?: WorkflowContext) {
    this.config = config;
    this.context = context;
    this.model = new ChatAnthropic({
      modelName: config.modelName,
      temperature: config.temperature,
      apiKey: config.apiKey,
      maxTokens: 4096
    });
  }

  /**
   * Log agent activity
   */
  protected log(message: string, ...args: any[]): void {
    logger.info(`[${this.constructor.name}] ${message}`, ...args);
  }

  /**
   * Log errors
   */
  protected logError(message: string, error: any): void {
    logger.error(`[${this.constructor.name}] ${message}`, error);
  }

  /**
   * Parse JSON response with error handling
   */
  protected parseJsonResponse<T>(response: string): T {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : response;

      return JSON.parse(jsonStr.trim());
    } catch (error) {
      this.logError('Failed to parse JSON response', error);
      throw new Error(`Invalid JSON response: ${error}`);
    }
  }

  /**
   * Format output based on configured output format
   * @param data The data to format
   * @returns Formatted string
   */
  protected formatOutput(data: any): string {
    const format = this.config.outputFormat || OutputFormat.MARKDOWN;
    return OutputFormatter.format(data, format);
  }

  /**
   * Get the configured output format
   * @returns The output format
   */
  protected getOutputFormat(): OutputFormat {
    return this.config.outputFormat || OutputFormat.MARKDOWN;
  }

  /**
   * Set workflow context
   */
  setContext(context: WorkflowContext): void {
    this.context = context;
  }

  /**
   * Get workflow context
   */
  getContext(): WorkflowContext | undefined {
    return this.context;
  }

  /**
   * Get data from previous agent execution
   */
  protected getPreviousAgentResult(agentName: string): any {
    if (!this.context) {
      return undefined;
    }

    const result = this.context.agentResults.find(r => r.agentName === agentName);
    return result?.output;
  }

  /**
   * Get all previous agent results
   */
  protected getAllPreviousResults(): any[] {
    if (!this.context) {
      return [];
    }

    return this.context.agentResults.map(r => ({
      agentName: r.agentName,
      output: r.output
    }));
  }

  /**
   * Get shared data from context
   */
  protected getSharedData(key: string): any {
    return this.context?.sharedData[key];
  }

  /**
   * Check if we have context available
   */
  protected hasContext(): boolean {
    return this.context !== undefined;
  }

  /**
   * Execute agent logic (to be implemented by subclasses)
   */
  abstract execute(input: any): Promise<any>;
}
