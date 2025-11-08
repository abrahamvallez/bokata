import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createClaude } from '../config/model.js';
import type { AgentResponse } from '../types/index.js';

/**
 * Base agent class for all Bokata specialists
 * Uses the exact prompts from bokata-slicer-cc repository
 */
export class BaseAgent {
  protected model: ChatAnthropic;
  protected systemPrompt: string;

  constructor(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    this.model = createClaude();
  }

  /**
   * Invoke the agent with user input
   */
  async invoke(userInput: string): Promise<AgentResponse> {
    const messages = [
      new SystemMessage(this.systemPrompt),
      new HumanMessage(userInput),
    ];

    const response = await this.model.invoke(messages);

    return {
      content: response.content.toString(),
      metadata: {
        model: this.model.modelName,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Stream the agent response
   */
  async *stream(userInput: string) {
    const messages = [
      new SystemMessage(this.systemPrompt),
      new HumanMessage(userInput),
    ];

    const stream = await this.model.stream(messages);

    for await (const chunk of stream) {
      yield chunk.content.toString();
    }
  }
}
