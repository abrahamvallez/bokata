"""Feature analysis workflow"""

from typing import Dict, Any
from pocketflow import Flow
from agents import (
    StepAnalyzerAgent,
    IncrementGeneratorAgent,
    PathComposerAgent,
    DocGeneratorAgent,
)


class FeatureAnalysisFlow:
    """Orchestrates single feature analysis"""

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self._setup_agents()
        self._setup_workflow()

    def _setup_agents(self):
        """Initialize agents (skip feature backbone for single feature)"""
        self.step_analyzer = StepAnalyzerAgent()
        self.increment_generator = IncrementGeneratorAgent()
        self.path_composer = PathComposerAgent()
        self.doc_generator = DocGeneratorAgent()

    def _setup_workflow(self):
        """Setup PocketFlow workflow"""
        # Connect agents in sequence
        self.step_analyzer >> self.increment_generator
        self.increment_generator >> self.path_composer
        self.path_composer >> self.doc_generator

        # Create flow
        self.flow = Flow(start_node=self.step_analyzer)

    def run(self, feature_description: str) -> Dict[str, Any]:
        """
        Execute the feature analysis workflow

        Args:
            feature_description: Feature description text or markdown

        Returns:
            Analysis result with all phases
        """
        # Initialize shared context
        shared = {
            "user_message": feature_description,
            "original_input": feature_description,
            "verbose": self.verbose,
            "analysis_type": "feature"
        }

        try:
            # Run the workflow
            result = self.flow.run(shared)

            # Extract results
            return {
                "steps_analysis": result.get("step-analyzer_result", ""),
                "increments_analysis": result.get("increment-generator_result", ""),
                "walking_skeleton": result.get("path-composer_result", ""),
                "final_document": result.get("doc-generator_result", ""),
                "error": result.get("error"),
            }

        except Exception as e:
            return {
                "error": f"Workflow execution failed: {str(e)}",
                "shared_context": shared
            }
