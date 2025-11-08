import { BaseAgent } from './base-agent';
import { FeatureAnalysis, ImplementationPath, AgentConfig } from '../types';
import { PATHS_GENERATION_PROMPT } from '../prompts/hamburger-method';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

/**
 * Implementation Paths Generator Agent
 * Generates multiple implementation strategies with timelines
 */
export class PathsGeneratorAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  async execute(analysis: FeatureAnalysis): Promise<ImplementationPath[]> {
    this.log('Generating implementation paths', {
      feature: analysis.feature.name,
      incrementCount: analysis.allIncrements.length
    });

    try {
      const messages = [
        new SystemMessage(PATHS_GENERATION_PROMPT),
        new HumanMessage(this.formatPathsInput(analysis))
      ];

      const response = await this.model.invoke(messages);
      const content = response.content.toString();

      this.log('Received response from model');

      const paths = this.parsePathsResponse(content);

      this.log('Implementation paths generated', { pathCount: paths.length });

      return paths;
    } catch (error) {
      this.logError('Paths generation failed', error);
      throw error;
    }
  }

  /**
   * Format paths input for the model
   */
  private formatPathsInput(analysis: FeatureAnalysis): string {
    const incrementsStr = analysis.allIncrements
      .map(inc => `- **${inc.id}**: ${inc.name} (${inc.estimatedStoryPoints} points)
  - ${inc.description}
  - Requires: ${inc.dependencies.requires.join(', ') || 'None'}`)
      .join('\n');

    return `
# Implementation Paths Request

**Feature**: ${analysis.feature.name}

## Available Increments

${incrementsStr}

## Walking Skeleton

${analysis.walkingSkeleton.increments.map(inc => `- ${inc.id}: ${inc.name}`).join('\n')}

Please generate 3-5 distinct implementation paths, each with:
- Unique strategic focus
- Specific increment ordering
- Estimated timeline
- Risk and benefit analysis

Format your response as JSON array of ImplementationPath objects.
`;
  }

  /**
   * Parse paths response from model
   */
  private parsePathsResponse(content: string): ImplementationPath[] {
    try {
      const parsed = this.parseJsonResponse<{ paths: ImplementationPath[] } | ImplementationPath[]>(content);

      // Handle both array and object with paths property
      return Array.isArray(parsed) ? parsed : parsed.paths;
    } catch (error) {
      this.logError('Failed to parse paths response', error);
      throw new Error('Failed to parse implementation paths response');
    }
  }
}
