import { BaseAgent } from './base-agent';
import { FeatureInput, FeatureAnalysis, AgentConfig, Increment, WalkingSkeleton } from '../types';
import { FEATURE_ANALYSIS_PROMPT } from '../prompts/hamburger-method';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

/**
 * Feature Analyzer Agent
 * Analyzes a single feature and breaks it down into vertical slices
 */
export class FeatureAnalyzerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  async execute(input: FeatureInput): Promise<FeatureAnalysis> {
    this.log('Starting feature analysis', { feature: input.name });

    try {
      const messages = [
        new SystemMessage(FEATURE_ANALYSIS_PROMPT),
        new HumanMessage(this.formatFeatureInput(input))
      ];

      const response = await this.model.invoke(messages);
      const content = response.content.toString();

      this.log('Received response from model');

      // Parse the response
      const analysis = this.parseAnalysisResponse(content, input);

      this.log('Feature analysis completed', {
        incrementCount: analysis.allIncrements.length,
        skeletonIncrements: analysis.walkingSkeleton.increments.length
      });

      return analysis;
    } catch (error) {
      this.logError('Feature analysis failed', error);
      throw error;
    }
  }

  /**
   * Format feature input for the model
   */
  private formatFeatureInput(input: FeatureInput): string {
    return `
# Feature Analysis Request

**Feature Name**: ${input.name}

**Description**: ${input.description}

${input.context ? `**Context**: ${input.context}` : ''}

${input.technicalStack?.length ? `**Technical Stack**: ${input.technicalStack.join(', ')}` : ''}

${input.constraints?.length ? `**Constraints**: ${input.constraints.join(', ')}` : ''}

Please provide a complete feature analysis following the Hamburger Method principles.
Format your response as JSON following this structure:

{
  "executiveSummary": "string",
  "walkingSkeleton": {
    "name": "string",
    "description": "string",
    "increments": [/* increment objects */],
    "totalEstimate": number,
    "delivers": ["string"]
  },
  "allIncrements": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "userValue": "string",
      "technicalLayers": ["UI", "Logic", "Data"],
      "estimatedStoryPoints": number,
      "dependencies": {
        "requires": ["string"],
        "provides": ["string"],
        "compatibleWith": ["string"]
      },
      "strategy": "string",
      "acceptanceCriteria": ["string"]
    }
  ],
  "dependencies": {
    "incrementId": ["dependencyIds"]
  }
}
`;
  }

  /**
   * Parse analysis response from model
   */
  private parseAnalysisResponse(content: string, input: FeatureInput): FeatureAnalysis {
    try {
      const parsed = this.parseJsonResponse<{
        executiveSummary: string;
        walkingSkeleton: WalkingSkeleton;
        allIncrements: Increment[];
        dependencies: { [key: string]: string[] };
      }>(content);

      return {
        feature: input,
        executiveSummary: parsed.executiveSummary,
        walkingSkeleton: parsed.walkingSkeleton,
        allIncrements: parsed.allIncrements,
        dependencies: parsed.dependencies
      };
    } catch (error) {
      this.logError('Failed to parse analysis response', error);
      throw new Error('Failed to parse feature analysis response');
    }
  }
}
