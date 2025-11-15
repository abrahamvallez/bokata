import { CoordinatorAgent } from '../agents/coordinator-agent';
import { SpecialistAgent } from '../agents/specialist-agent';
import { getConfig, validateConfig } from '../utils/config';
import { AgentConfig, OutputFormat } from '../types';
import { logger } from '../utils/logger';
import { CommandLoader } from '../utils/command-loader';
import { PromptLoader } from '../utils/prompt-loader';

/**
 * Bokata Commands API
 * Provides access to all bokata commands using exact prompts
 */
export class BokataCommands {
  private config: AgentConfig;

  constructor(config?: Partial<AgentConfig>) {
    const defaultConfig = getConfig();
    this.config = { ...defaultConfig, ...config };
    validateConfig(this.config);
    logger.info('Bokata Commands API initialized');
  }

  /**
   * Execute /bokata command - Project analysis
   */
  async bokata(input: string | object, format?: string): Promise<any> {
    logger.info('Executing /bokata command');

    const config = this.getConfigWithFormat(format);
    const coordinator = new CoordinatorAgent(config, 'bokata');
    const specialists = [
      'project-analyzer',
      'feature-backbone-specialist',
      'step-analyzer-specialist',
      'increment-generator-specialist',
      'path-composer-specialist',
      'doc-generator'
    ];

    return await coordinator.executeWithSpecialists(input, specialists);
  }

  /**
   * Execute /bokata-feature command - Single feature analysis
   */
  async bokataFeature(input: string | object, format?: string): Promise<any> {
    logger.info('Executing /bokata-feature command');

    const config = this.getConfigWithFormat(format);
    const coordinator = new CoordinatorAgent(config, 'bokata-feature');
    const specialists = [
      'feature-analyzer',
      'step-analyzer-specialist',
      'increment-generator-specialist',
      'path-composer-specialist',
      'doc-generator'
    ];

    return await coordinator.executeWithSpecialists(input, specialists);
  }

  /**
   * Execute /bokata-iterations-paths command - Generate implementation paths
   */
  async bokataIterationsPaths(input: string | object, format?: string): Promise<any> {
    logger.info('Executing /bokata-iterations-paths command');

    const config = this.getConfigWithFormat(format);
    const coordinator = new CoordinatorAgent(config, 'bokata-iterations-paths');
    const specialists = [
      'iteration-planner-specialist',
      'decision-guide-specialist'
    ];

    return await coordinator.executeWithSpecialists(input, specialists);
  }

  /**
   * Execute /bokata-matrix command - Generate selection matrix
   */
  async bokataMatrix(input: string | object, format?: string): Promise<any> {
    logger.info('Executing /bokata-matrix command');

    const config = this.getConfigWithFormat(format);
    const coordinator = new CoordinatorAgent(config, 'bokata-matrix');
    const specialists = ['selection-matrix-specialist'];

    return await coordinator.executeWithSpecialists(input, specialists);
  }

  /**
   * Execute a specialist agent directly
   */
  async executeSpecialist(
    specialistName: string,
    input: any,
    additionalContext?: string
  ): Promise<any> {
    logger.info(`Executing specialist: ${specialistName}`);

    const specialist = new SpecialistAgent(this.config, specialistName);
    return await specialist.execute(input, additionalContext);
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): string[] {
    return CommandLoader.getAvailableCommands();
  }

  /**
   * Get available specialists
   */
  getAvailableSpecialists(): string[] {
    return PromptLoader.getAvailablePrompts();
  }

  /**
   * Get command metadata
   */
  getCommandMetadata(commandName: string): any {
    const command = CommandLoader.loadCommand(commandName);
    return command.metadata;
  }

  /**
   * Get specialist metadata
   */
  getSpecialistMetadata(specialistName: string): any {
    const prompt = PromptLoader.loadPrompt(specialistName);
    return prompt.metadata;
  }

  /**
   * Get config with overridden output format
   */
  private getConfigWithFormat(format?: string): AgentConfig {
    if (!format) {
      return this.config;
    }

    const outputFormat = format.toLowerCase() === 'json' ? OutputFormat.JSON : OutputFormat.MARKDOWN;
    return {
      ...this.config,
      outputFormat
    };
  }
}

/**
 * Factory function to create BokataCommands instance
 */
export function createBokataCommands(config?: Partial<AgentConfig>): BokataCommands {
  return new BokataCommands(config);
}
