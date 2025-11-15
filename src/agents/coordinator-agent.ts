import { BaseAgent } from './base-agent';
import { AgentConfig, OutputFormat } from '../types';
import { SpecialistAgent } from './specialist-agent';
import { CommandLoader } from '../utils/command-loader';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { logger } from '../utils/logger';

/**
 * Coordinator Agent - orchestrates multiple specialist agents
 * Uses exact command prompts from markdown files
 */
export class CoordinatorAgent extends BaseAgent {
  private commandName: string;
  private commandContent: string;
  private commandMetadata: any;

  constructor(config: AgentConfig, commandName: string) {
    super(config);
    this.commandName = commandName;

    // Load the exact command from file
    const command = CommandLoader.loadCommand(commandName);
    this.commandContent = command.content;
    this.commandMetadata = command.metadata;

    this.log(`Loaded command: ${commandName}`, this.commandMetadata);
  }

  /**
   * Execute command - coordinates specialist agents
   */
  async execute(input: any): Promise<any> {
    this.log(`Executing command: ${this.commandName}`);

    try {
      // Use the command content as the system prompt
      const messages = [
        new SystemMessage(this.commandContent),
        new HumanMessage(this.formatInput(input))
      ];

      const response = await this.model.invoke(messages);
      const content = response.content.toString();

      this.log('Command execution completed');

      // Prepare result data
      const resultData = {
        output: content,
        commandUsed: this.commandName,
        metadata: this.commandMetadata
      };

      // Format output based on configuration
      const formattedOutput = this.getOutputFormat() === OutputFormat.JSON
        ? this.formatOutput(resultData)
        : content;

      return {
        ...resultData,
        output: formattedOutput
      };
    } catch (error) {
      this.logError('Command execution failed', error);
      throw error;
    }
  }

  /**
   * Execute with specialist agents delegation
   * This allows the coordinator to call specialist agents as needed
   */
  async executeWithSpecialists(
    input: any,
    availableSpecialists: string[] = []
  ): Promise<any> {
    this.log(`Executing ${this.commandName} with specialists available:`, availableSpecialists);

    // Initialize specialist agents
    const specialists = new Map<string, SpecialistAgent>();
    for (const specialistName of availableSpecialists) {
      try {
        specialists.set(specialistName, new SpecialistAgent(this.config, specialistName));
      } catch (error) {
        logger.warn(`Could not load specialist: ${specialistName}`, error);
      }
    }

    // Execute main command
    const mainResult = await this.execute(input);

    return {
      ...mainResult,
      specialistsAvailable: Array.from(specialists.keys()),
      specialists: Object.fromEntries(
        Array.from(specialists.entries()).map(([name, agent]) => [
          name,
          agent.getMetadata()
        ])
      )
    };
  }

  /**
   * Format input for the coordinator
   */
  private formatInput(input: any): string {
    if (typeof input === 'string') {
      return input;
    } else if (typeof input === 'object') {
      return JSON.stringify(input, null, 2);
    }
    return String(input);
  }

  /**
   * Get command metadata
   */
  getMetadata() {
    return this.commandMetadata;
  }

  /**
   * Get command content
   */
  getCommandContent(): string {
    return this.commandContent;
  }
}
