import { ChatAnthropic } from '@langchain/anthropic';

/**
 * Configure Claude model for Bokata agents
 * Using Claude Sonnet 4.5 as specified in the original prompts
 */
export function createClaude(options?: {
  temperature?: number;
  maxTokens?: number;
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  return new ChatAnthropic({
    anthropicApiKey: apiKey,
    modelName: 'claude-sonnet-4-5-20250929',
    temperature: options?.temperature ?? 0.7,
    maxTokens: options?.maxTokens ?? 16384,
  });
}
