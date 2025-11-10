"""Workflow orchestration using PocketFlow"""

from typing import Dict, Any
from pocketflow import Flow
from ..agents.specialists.feature_backbone_specialist import FeatureBackboneSpecialist
from ..agents.specialists.step_analyzer_specialist import StepAnalyzerSpecialist
from ..agents.specialists.increment_generator_specialist import IncrementGeneratorSpecialist
from ..agents.specialists.path_composer_specialist import PathComposerSpecialist
from ..agents.specialists.doc_generator import DocGeneratorAgent


class ProjectAnalysisWorkflow:
    """Orchestrates project analysis with multiple features"""

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self._setup_agents()
        self._setup_workflow()

    def _setup_agents(self):
        """Initialize all specialist agents"""
        self.feature_backbone = FeatureBackboneSpecialist()
        self.step_analyzer = StepAnalyzerSpecialist()
        self.increment_generator = IncrementGeneratorSpecialist()
        self.path_composer = PathComposerSpecialist()
        self.doc_generator = DocGeneratorAgent()

    def _setup_workflow(self):
        """Setup PocketFlow workflow"""
        # Connect agents in sequence using PocketFlow
        self.feature_backbone >> self.step_analyzer
        self.step_analyzer >> self.increment_generator
        self.increment_generator >> self.path_composer
        self.path_composer >> self.doc_generator

        # Create flow starting with feature backbone
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

            # Extract results from each phase
            return {
                "feature_backbone": result.get("feature-backbone-specialist_result", ""),
                "steps_analysis": result.get("step-analyzer-specialist_result", ""),
                "increments_analysis": result.get("increment-generator-specialist_result", ""),
                "walking_skeleton": result.get("path-composer-specialist_result", ""),
                "final_document": result.get("doc-generator_result", ""),
                "error": result.get("error"),
            }

        except Exception as e:
            return {
                "error": f"Workflow execution failed: {str(e)}",
                "shared_context": shared
            }


class FeatureAnalysisWorkflow:
    """Orchestrates single feature analysis"""

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self._setup_agents()
        self._setup_workflow()

    def _setup_agents(self):
        """Initialize specialist agents (skip feature backbone for single feature)"""
        self.step_analyzer = StepAnalyzerSpecialist()
        self.increment_generator = IncrementGeneratorSpecialist()
        self.path_composer = PathComposerSpecialist()
        self.doc_generator = DocGeneratorAgent()

    def _setup_workflow(self):
        """Setup PocketFlow workflow for single feature"""
        # Connect agents in sequence
        self.step_analyzer >> self.increment_generator
        self.increment_generator >> self.path_composer
        self.path_composer >> self.doc_generator

        # Create flow starting with step analyzer
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

            # Extract results from each phase
            return {
                "steps_analysis": result.get("step-analyzer-specialist_result", ""),
                "increments_analysis": result.get("increment-generator-specialist_result", ""),
                "walking_skeleton": result.get("path-composer-specialist_result", ""),
                "final_document": result.get("doc-generator_result", ""),
                "error": result.get("error"),
            }

        except Exception as e:
            return {
                "error": f"Workflow execution failed: {str(e)}",
                "shared_context": shared
            }
