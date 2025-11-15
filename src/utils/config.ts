import dotenv from 'dotenv';
import { AgentConfig, OutputFormat } from '../types';

// Load environment variables
dotenv.config();

/**
 * Get configuration from environment variables
 */
export function getConfig(): AgentConfig {
  const outputFormatEnv = process.env.OUTPUT_FORMAT?.toLowerCase();
  const outputFormat = outputFormatEnv === 'json' ? OutputFormat.JSON : OutputFormat.MARKDOWN;

  return {
    modelName: process.env.MODEL_NAME || 'claude-3-5-sonnet-20241022',
    temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
    maxIterations: parseInt(process.env.MAX_ITERATIONS || '10', 10),
    verbose: process.env.VERBOSE === 'true',
    apiKey: process.env.ANTHROPIC_API_KEY,
    outputFormat
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: AgentConfig): void {
  if (!config.apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required. Please set it in your .env file');
  }

  if (config.temperature < 0 || config.temperature > 1) {
    throw new Error('Temperature must be between 0 and 1');
  }

  if (config.maxIterations < 1) {
    throw new Error('Max iterations must be at least 1');
  }
}
