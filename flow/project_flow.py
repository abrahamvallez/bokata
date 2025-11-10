"""Project analysis workflow"""

from typing import Dict, Any
from pocketflow import Flow
from agents import (
    FeatureBackboneAgent,
    StepAnalyzerAgent,
    IncrementGeneratorAgent,
    PathComposerAgent,
    DocGeneratorAgent,
)


class ProjectAnalysisFlow:
    """Orchestrates project analysis with multiple features"""

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self._setup_agents()
        self._setup_workflow()

    def _setup_agents(self):
        """Initialize all agents"""
        self.feature_backbone = FeatureBackboneAgent()
        self.step_analyzer = StepAnalyzerAgent()
        self.increment_generator = IncrementGeneratorAgent()
        self.path_composer = PathComposerAgent()
        self.doc_generator = DocGeneratorAgent()

    def _setup_workflow(self):
        """Setup PocketFlow workflow"""
        # Connect agents in sequence
        self.feature_backbone >> self.step_analyzer
        self.step_analyzer >> self.increment_generator
        self.increment_generator >> self.path_composer
        self.path_composer >> self.doc_generator

        # Create flow
        self.flow = Flow(start_node=self.feature_backbone)

    def run(self, project_description: str) -> Dict[str, Any]:
        """
        Execute the complete project analysis workflow

        Args:
            project_description: Project description text or markdown

        Returns:
            Analysis result with all phases
        """
        # Initialize shared context
        shared = {
            "user_message": project_description,
            "original_input": project_description,
            "verbose": self.verbose,
            "analysis_type": "project"
        }

        try:
            # Run the workflow
            result = self.flow.run(shared)

            # Extract results
            return {
                "feature_backbone": result.get("feature-backbone_result", ""),
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
