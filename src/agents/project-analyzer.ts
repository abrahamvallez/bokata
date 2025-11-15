import { BaseAgent } from './base-agent';
import { ProjectInput, ProjectAnalysis, AgentConfig } from '../types';
import { PROJECT_ANALYSIS_PROMPT } from '../prompts/hamburger-method';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

/**
 * Project Analyzer Agent
 * Analyzes multiple features and identifies cross-feature dependencies
 */
export class ProjectAnalyzerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  async execute(input: ProjectInput): Promise<ProjectAnalysis> {
    this.log('Starting project analysis', {
      project: input.name,
      featureCount: input.features.length
    });

    try {
      const messages = [
        new SystemMessage(PROJECT_ANALYSIS_PROMPT),
        new HumanMessage(this.formatProjectInput(input))
      ];

      const response = await this.model.invoke(messages);
      const content = response.content.toString();

      this.log('Received response from model');

      const analysis = this.parseProjectResponse(content, input);

      this.log('Project analysis completed', {
        featureCount: analysis.featureAnalyses.length,
        totalIncrements: analysis.featureAnalyses.reduce(
          (sum, fa) => sum + fa.allIncrements.length,
          0
        )
      });

      return analysis;
    } catch (error) {
      this.logError('Project analysis failed', error);
      throw error;
    }
  }

  /**
   * Format project input for the model
   */
  private formatProjectInput(input: ProjectInput): string {
    const featuresStr = input.features
      .map((f, i) => `${i + 1}. **${f.name}**: ${f.description}`)
      .join('\n');

    return `
# Project Analysis Request

**Project Name**: ${input.name}

**Description**: ${input.description}

${input.context ? `**Context**: ${input.context}` : ''}

${input.technicalStack?.length ? `**Technical Stack**: ${input.technicalStack.join(', ')}` : ''}

## Features to Analyze

${featuresStr}

Please provide a complete project analysis with:
1. Individual feature analyses
2. Cross-feature dependencies
3. Multi-functional walking skeleton
4. Recommended implementation order

Format your response as JSON.
`;
  }

  /**
   * Parse project response from model
   */
  private parseProjectResponse(content: string, input: ProjectInput): ProjectAnalysis {
    try {
      const parsed = this.parseJsonResponse<Omit<ProjectAnalysis, 'project'>>(content);

      return {
        project: input,
        ...parsed
      };
    } catch (error) {
      this.logError('Failed to parse project response', error);
      throw new Error('Failed to parse project analysis response');
    }
  }
}
