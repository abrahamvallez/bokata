import { ChatAnthropic } from '@langchain/anthropic';
import { AgentConfig } from '../types';
import { logger } from '../utils/logger';

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
   * Execute agent logic (to be implemented by subclasses)
   */
  abstract execute(input: any): Promise<any>;
}
