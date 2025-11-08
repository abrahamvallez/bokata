// Core domain types for Bokata Slicer

export interface Increment {
  id: string; // Format: "1.1.1" (feature.step.increment)
  name: string;
  description: string;
  requires: string; // Dependencies from other steps
  provides: string; // What this increment offers
  compatibleWith: string; // Compatible increment IDs
  isSimplest: boolean; // Marked with ⭐
}

export interface Step {
  id: string; // Format: "1.1" (feature.step)
  name: string;
  description: string;
  purpose: string;
  qualityAttributes: {
    qualityFactors: string;
    tradeoffs: string;
    implementationOptions: string;
  };
  increments: Increment[];
  appliedStrategies: string[];
  rationale: string;
}

export interface Feature {
  id: string; // Format: "1", "2", etc.
  name: string; // Actor+Action format (e.g., "User Login")
  description: string;
  userValue: string;
  dependencies: string[];
  steps: Step[];
}

export interface FeaturesBackbone {
  features: Feature[];
  userJourneyOverview: string;
  featureFlowNarrative: string;
  dependenciesAndRelationships: string;
}

export interface WalkingSkeleton {
  selectedIncrements: Array<{
    featureId: string;
    featureName: string;
    stepId: string;
    stepName: string;
    incrementId: string;
    incrementName: string;
    requires: string;
    provides: string;
  }>;
  dependencyAnalysis: {
    allRequiresSatisfied: boolean;
    allCompatible: boolean;
    noCircularDependencies: boolean;
    validationResults: string[];
  };
  observableOutcomes: string[];
  capabilitiesEnabled: string[];
  whatYouGet: string;
}

export interface AnalysisResult {
  projectName: string;
  analysisDate: string;
  executiveSummary: {
    projectType: string;
    totalFeatures: number;
    totalSteps: number;
    totalIncrements: number;
    walkingSkeletonSize: number;
  };
  featuresBackbone: FeaturesBackbone;
  features: Feature[];
  walkingSkeleton: WalkingSkeleton;
}

// LangGraph State
export interface BokataGraphState {
  // Input
  projectInput: string;
  projectName: string;

  // Phase 1: Features Backbone
  featuresBackbone?: FeaturesBackbone;

  // Phase 2: Features Analysis (loop)
  features: Feature[];
  currentFeatureIndex: number;
  currentStepIndex: number;

  // Phase 3: Walking Skeleton
  walkingSkeleton?: WalkingSkeleton;

  // Phase 4: Final Result
  analysisResult?: AnalysisResult;

  // Control flow
  isComplete: boolean;
  error?: string;
}

// API Types
export interface AnalyzeRequest {
  projectInput: string;
  projectName?: string;
}

export interface JobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    currentPhase: string;
    currentFeature?: number;
    totalFeatures?: number;
    currentStep?: number;
    totalSteps?: number;
  };
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface JobResult {
  jobId: string;
  status: 'completed' | 'failed';
  result?: AnalysisResult;
  error?: string;
}

// Agent Response Types (for parsing LLM outputs)
export interface AgentResponse {
  content: string;
  metadata?: Record<string, any>;
}
