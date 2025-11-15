import { ChatAnthropic } from '@langchain/anthropic';
import { AgentConfig, OutputFormat } from '../types';
import { logger } from '../utils/logger';
import { OutputFormatter } from '../utils/output-formatter';

/**
 * Base agent class with common functionality
 */
export abstract class BaseAgent {
  protected model: ChatAnthropic;
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
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
   * Execute agent logic (to be implemented by subclasses)
   */
  abstract execute(input: any): Promise<any>;
}
