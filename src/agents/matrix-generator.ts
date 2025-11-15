import { BaseAgent } from './base-agent';
import { FeatureAnalysis, CompatibilityMatrix, AgentConfig } from '../types';
import { MATRIX_GENERATION_PROMPT } from '../prompts/hamburger-method';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

/**
 * Compatibility Matrix Generator Agent
 * Generates compatibility matrix for all increments
 */
export class MatrixGeneratorAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  async execute(analysis: FeatureAnalysis): Promise<CompatibilityMatrix> {
    this.log('Generating compatibility matrix', {
      feature: analysis.feature.name,
      incrementCount: analysis.allIncrements.length
    });

    try {
      const messages = [
        new SystemMessage(MATRIX_GENERATION_PROMPT),
        new HumanMessage(this.formatMatrixInput(analysis))
      ];

      const response = await this.model.invoke(messages);
      const content = response.content.toString();

      this.log('Received response from model');

      const matrix = this.parseMatrixResponse(content);

      this.log('Compatibility matrix generated');

      return matrix;
    } catch (error) {
      this.logError('Matrix generation failed', error);
      throw error;
    }
  }

  /**
   * Format matrix input for the model
   */
  private formatMatrixInput(analysis: FeatureAnalysis): string {
    const incrementsStr = analysis.allIncrements
      .map(inc => `- **${inc.id}**: ${inc.name}
  - Requires: ${inc.dependencies.requires.join(', ') || 'None'}
  - Provides: ${inc.dependencies.provides.join(', ') || 'None'}
  - Compatible with: ${inc.dependencies.compatibleWith.join(', ') || 'Any'}`)
      .join('\n');

    return `
# Compatibility Matrix Request

**Feature**: ${analysis.feature.name}

## All Increments

${incrementsStr}

Please generate a complete compatibility matrix showing which increments:
- Can be built together (compatible)
- Have dependencies (depends)
- Conflict with each other (incompatible)

Format your response as JSON following the CompatibilityMatrix schema.
`;
  }

  /**
   * Parse matrix response from model
   */
  private parseMatrixResponse(content: string): CompatibilityMatrix {
    try {
      return this.parseJsonResponse<CompatibilityMatrix>(content);
    } catch (error) {
      this.logError('Failed to parse matrix response', error);
      throw new Error('Failed to parse compatibility matrix response');
    }
  }
}
