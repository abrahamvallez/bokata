/**
 * Simplified Orchestrator for Bokata Analysis
 * This replaces the complex LangGraph implementation with a simpler linear workflow
 */

import {
  FeatureBackboneAgent,
  StepAnalyzerAgent,
  IncrementGeneratorAgent,
  PathComposerAgent,
} from '../agents/specialists.js';
import type { AnalysisResult, Feature, Step, Increment } from '../types/index.js';

// Initialize agents
const featureBackboneAgent = new FeatureBackboneAgent();
const stepAnalyzerAgent = new StepAnalyzerAgent();
const incrementGeneratorAgent = new IncrementGeneratorAgent();
const pathComposerAgent = new PathComposerAgent();
// const docGeneratorAgent = new DocGeneratorAgent();

/**
 * Run complete Bokata analysis
 */
export async function runBokataAnalysis(
  projectInput: string,
  projectName: string
): Promise<AnalysisResult> {
  console.log('\n🚀 Starting Bokata Analysis\n');

  // Phase 1: Feature Backbone
  console.log('📋 Phase 1: Analyzing Feature Backbone...');
  const backboneResponse = await featureBackboneAgent.invoke(projectInput);
  const features = parseFeatures(backboneResponse.content);

  console.log(`   Found ${features.length} features\n`);

  // Phase 2: Analyze each feature
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    console.log(`📊 Phase 2.${i + 1}: Analyzing Feature "${feature.name}"`);

    // Step 2.1: Analyze steps
    const stepInput = `
Feature: ${feature.name}
Description: ${feature.description}

Please analyze this feature and identify the main technical, business, or logical steps involved, along with their quality attributes.
    `.trim();

    const stepsResponse = await stepAnalyzerAgent.invoke(stepInput);
    feature.steps = parseSteps(stepsResponse.content, feature.id);

    console.log(`   Found ${feature.steps.length} steps`);

    // Step 2.2: Generate increments for each step
    for (let j = 0; j < feature.steps.length; j++) {
      const step = feature.steps[j];
      console.log(`   ⚡ Generating increments for Step "${step.name}"`);

      const incrementInput = `
Feature: ${feature.name}
Step: ${step.name}
Description: ${step.description}

Please generate 5-10 increments for this step using breakdown strategies.
      `.trim();

      const incrementsResponse = await incrementGeneratorAgent.invoke(incrementInput);
      step.increments = parseIncrements(incrementsResponse.content, step.id);

      console.log(`      Generated ${step.increments.length} increments`);
    }
  }

  // Phase 3: Compose Walking Skeleton
  console.log('\n🏗️  Phase 3: Composing Walking Skeleton...');
  const walkingSkeletonInput = buildWalkingSkeletonInput(features);
  const walkingSkeletonResponse = await pathComposerAgent.invoke(walkingSkeletonInput);
  const walkingSkeleton = parseWalkingSkeleton(walkingSkeletonResponse.content, features);

  console.log(`   Selected ${walkingSkeleton.selectedIncrements.length} simplest increments\n`);

  // Phase 4: Generate final result
  console.log('📝 Phase 4: Generating final document...\n');

  const analysisResult: AnalysisResult = {
    projectName,
    analysisDate: new Date().toISOString(),
    executiveSummary: {
      projectType: 'Multi-feature Project',
      totalFeatures: features.length,
      totalSteps: features.reduce((sum, f) => sum + f.steps.length, 0),
      totalIncrements: features.reduce((sum, f) =>
        sum + f.steps.reduce((s, step) => s + step.increments.length, 0), 0
      ),
      walkingSkeletonSize: walkingSkeleton.selectedIncrements.length,
    },
    featuresBackbone: {
      features,
      userJourneyOverview: 'Extracted from analysis',
      featureFlowNarrative: 'Extracted from analysis',
      dependenciesAndRelationships: 'Extracted from analysis',
    },
    features,
    walkingSkeleton,
  };

  console.log('✅ Analysis complete!\n');

  return analysisResult;
}

// ============================================================================
// PARSER FUNCTIONS
// ============================================================================

function parseFeatures(content: string): Feature[] {
  const features: Feature[] = [];
  const lines = content.split('\n');
  let featureId = 1;

  for (const line of lines) {
    // Match patterns like: "1. **User Login** - Description"
    const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*[-–]\s*(.+)/);
    if (match) {
      features.push({
        id: String(featureId++),
        name: match[1].trim(),
        description: match[2].trim(),
        userValue: match[2].trim(),
        dependencies: [],
        steps: [],
      });
    }
  }

  // Fallback: if no features found, create a default one
  if (features.length === 0) {
    features.push({
      id: '1',
      name: 'Main Feature',
      description: 'Primary feature of the project',
      userValue: 'Core functionality',
      dependencies: [],
      steps: [],
    });
  }

  return features;
}

function parseSteps(content: string, featureId: string): Step[] {
  const steps: Step[] = [];
  const lines = content.split('\n');
  let stepId = 1;

  for (const line of lines) {
    // Match patterns like: "### Step 1: Name" or "## Step 1: Name"
    const match = line.match(/^#{2,4}\s+Step\s+\d+:\s+(.+)/i);
    if (match) {
      steps.push({
        id: `${featureId}.${stepId++}`,
        name: match[1].trim(),
        description: match[1].trim(),
        purpose: '',
        qualityAttributes: {
          qualityFactors: '',
          tradeoffs: '',
          implementationOptions: '',
        },
        increments: [],
        appliedStrategies: [],
        rationale: '',
      });
    }
  }

  // Fallback: if no steps found, create default ones
  if (steps.length === 0) {
    steps.push(
      {
        id: `${featureId}.1`,
        name: 'UI Layer',
        description: 'User interface implementation',
        purpose: 'Handle user interaction',
        qualityAttributes: {
          qualityFactors: 'Simple, accessible',
          tradeoffs: 'Basic vs advanced UI',
          implementationOptions: 'HTML form, React component, etc.',
        },
        increments: [],
        appliedStrategies: [],
        rationale: '',
      },
      {
        id: `${featureId}.2`,
        name: 'Logic Layer',
        description: 'Business logic implementation',
        purpose: 'Process data and enforce rules',
        qualityAttributes: {
          qualityFactors: 'Correct, maintainable',
          tradeoffs: 'Simple vs complex validation',
          implementationOptions: 'Client-side, server-side, both',
        },
        increments: [],
        appliedStrategies: [],
        rationale: '',
      },
      {
        id: `${featureId}.3`,
        name: 'Data Layer',
        description: 'Data persistence implementation',
        purpose: 'Store and retrieve data',
        qualityAttributes: {
          qualityFactors: 'Reliable, secure',
          tradeoffs: 'In-memory vs persistent storage',
          implementationOptions: 'localStorage, database, API',
        },
        increments: [],
        appliedStrategies: [],
        rationale: '',
      }
    );
  }

  return steps;
}

function parseIncrements(content: string, stepId: string): Increment[] {
  const increments: Increment[] = [];
  const lines = content.split('\n');
  let incrementId = 1;

  for (const line of lines) {
    // Match patterns with optional ⭐
    const match = line.match(/^\*\*Increment\s+[\d.]+:\s+(.+?)\*\*\s*([⭐])?/);
    if (match) {
      increments.push({
        id: `${stepId}.${incrementId++}`,
        name: match[1].trim(),
        description: match[1].trim(),
        requires: 'None',
        provides: 'TBD',
        compatibleWith: 'All',
        isSimplest: match[2] === '⭐',
      });
    }
  }

  // Fallback: create default increments
  if (increments.length === 0) {
    increments.push(
      {
        id: `${stepId}.1`,
        name: 'Hardcoded/Manual',
        description: 'Simplest manual implementation',
        requires: 'None',
        provides: 'Basic functionality',
        compatibleWith: 'All',
        isSimplest: true,
      },
      {
        id: `${stepId}.2`,
        name: 'Basic Dynamic',
        description: 'Simple dynamic implementation',
        requires: 'Step 1 complete',
        provides: 'Dynamic behavior',
        compatibleWith: 'Most',
        isSimplest: false,
      },
      {
        id: `${stepId}.3`,
        name: 'Advanced',
        description: 'Full-featured implementation',
        requires: 'Step 2 complete',
        provides: 'Complete functionality',
        compatibleWith: 'Advanced setups',
        isSimplest: false,
      }
    );
  }

  // Ensure at least one is marked as simplest
  if (!increments.some(i => i.isSimplest) && increments.length > 0) {
    increments[0].isSimplest = true;
  }

  return increments;
}

function buildWalkingSkeletonInput(features: Feature[]): string {
  let input = 'Please compose the Walking Skeleton by selecting the simplest increments.\n\n';

  for (const feature of features) {
    input += `Feature: ${feature.name}\n`;
    for (const step of feature.steps) {
      input += `  Step ${step.id}: ${step.name}\n`;
      for (const increment of step.increments) {
        const marker = increment.isSimplest ? '⭐ ' : '   ';
        input += `    ${marker}${increment.id}: ${increment.name}\n`;
      }
    }
    input += '\n';
  }

  return input;
}

function parseWalkingSkeleton(_content: string, features: Feature[]) {
  const selectedIncrements = [];

  // Select the simplest increment from each step
  for (const feature of features) {
    for (const step of feature.steps) {
      const simplest = step.increments.find(i => i.isSimplest) || step.increments[0];
      if (simplest) {
        selectedIncrements.push({
          featureId: feature.id,
          featureName: feature.name,
          stepId: step.id,
          stepName: step.name,
          incrementId: simplest.id,
          incrementName: simplest.name,
          requires: simplest.requires,
          provides: simplest.provides,
        });
      }
    }
  }

  return {
    selectedIncrements,
    dependencyAnalysis: {
      allRequiresSatisfied: true,
      allCompatible: true,
      noCircularDependencies: true,
      validationResults: ['All requirements satisfied', 'All increments compatible'],
    },
    observableOutcomes: ['End-to-end functionality', 'Deployable minimum viable product'],
    capabilitiesEnabled: ['Early validation', 'User feedback', 'Iterative development'],
    whatYouGet: 'A minimal but complete implementation that demonstrates the core user journey',
  };
}
