import { BaseAgent } from './base-agent';
import { AgentConfig } from '../types';
import { PromptLoader } from '../utils/prompt-loader';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

/**
 * Specialist Agent - loads and uses exact prompts from markdown files
 */
export class SpecialistAgent extends BaseAgent {
  private promptName: string;
  private promptContent: string;
  private promptMetadata: any;

  constructor(config: AgentConfig, promptName: string) {
    super(config);
    this.promptName = promptName;

    // Load the exact prompt from file
    const prompt = PromptLoader.loadPrompt(promptName);
    this.promptContent = prompt.content;
    this.promptMetadata = prompt.metadata;

    this.log(`Loaded prompt: ${promptName}`, this.promptMetadata);
  }

  /**
   * Execute agent with the loaded prompt
   */
  async execute(input: any, additionalContext?: string): Promise<any> {
    this.log(`Executing ${this.promptName} specialist`);

    try {
      // Build the messages with the exact prompt
      const messages = [
        new SystemMessage(this.promptContent),
        new HumanMessage(this.formatInput(input, additionalContext))
      ];

      const response = await this.model.invoke(messages);
      const content = response.content.toString();

      this.log('Received response from model');

      return {
        rawOutput: content,
        promptUsed: this.promptName,
        metadata: this.promptMetadata
      };
    } catch (error) {
      this.logError('Specialist agent execution failed', error);
      throw error;
    }
  }

  /**
   * Execute with conversation history (for multi-turn interactions)
   */
  async executeWithHistory(
    input: any,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<any> {
    this.log(`Executing ${this.promptName} with history (${history.length} messages)`);

    try {
      // Build messages with history
      const messages = [
        new SystemMessage(this.promptContent),
        ...history.map(msg =>
          msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        ),
        new HumanMessage(this.formatInput(input))
      ];

      const response = await this.model.invoke(messages);
      const content = response.content.toString();

      return {
        rawOutput: content,
        promptUsed: this.promptName,
        metadata: this.promptMetadata
      };
    } catch (error) {
      this.logError('Specialist agent execution with history failed', error);
      throw error;
    }
  }

  /**
   * Format input for the agent
   */
  private formatInput(input: any, additionalContext?: string): string {
    let formattedInput = '';

    if (typeof input === 'string') {
      formattedInput = input;
    } else if (typeof input === 'object') {
      formattedInput = JSON.stringify(input, null, 2);
    }

    if (additionalContext) {
      formattedInput += `\n\n## Additional Context\n${additionalContext}`;
    }

    return formattedInput;
  }

  /**
   * Get prompt metadata
   */
  getMetadata() {
    return this.promptMetadata;
  }

  /**
   * Get prompt content
   */
  getPromptContent(): string {
    return this.promptContent;
  }
}
