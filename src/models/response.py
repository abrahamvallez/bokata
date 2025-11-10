"""Response models for Bokata API"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Increment(BaseModel):
    """Individual increment within a step"""

    id: str = Field(..., description="Increment ID (e.g., 1.1, 1.2)")
    name: str = Field(..., description="Increment name")
    description: str = Field(..., description="What this increment does")
    is_simplest: bool = Field(default=False, description="Is this the simplest increment")
    requires: str = Field(..., description="Dependencies (or 'None')")
    provides: str = Field(..., description="What this increment offers")
    compatible_with: str = Field(..., description="Compatible increments")
    strategy: str = Field(..., description="Breakdown strategy used")
    notes: Optional[str] = Field(None, description="Additional notes")


class Step(BaseModel):
    """Step within a feature"""

    id: str = Field(..., description="Step ID (e.g., 1, 2, 3)")
    name: str = Field(..., description="Step name")
    description: str = Field(..., description="What this step accomplishes")
    quality_attributes: Dict[str, Any] = Field(
        ..., description="Quality factors, tradeoffs, implementation options"
    )
    increments: List[Increment] = Field(..., description="List of increments for this step")


class Feature(BaseModel):
    """Feature with steps and increments"""

    name: str = Field(..., description="Feature name (Actor + Action format)")
    description: str = Field(..., description="Feature description")
    steps: List[Step] = Field(..., description="List of steps")
    total_increments: int = Field(..., description="Total number of increments")


class FeatureBackbone(BaseModel):
    """Feature backbone overview"""

    user_journey: str = Field(..., description="User journey overview")
    features_list: List[Dict[str, str]] = Field(..., description="List of features with descriptions")
    flow_narrative: str = Field(..., description="How features connect in user journey")
    dependencies: Optional[str] = Field(None, description="Critical relationships")


class WalkingSkeleton(BaseModel):
    """Walking Skeleton composition"""

    description: str = Field(..., description="Overview of the walking skeleton")
    selected_increments: List[Dict[str, Any]] = Field(
        ..., description="Selected increments across features"
    )
    rationale: str = Field(..., description="Why these increments were selected")
    dependency_validation: str = Field(..., description="Validation of dependencies")


class ExecutiveSummary(BaseModel):
    """Executive summary of the analysis"""

    project_name: str = Field(..., description="Project or feature name")
    total_features: int = Field(..., description="Number of features analyzed")
    total_steps: int = Field(..., description="Total number of steps")
    total_increments: int = Field(..., description="Total number of increments")
    walking_skeleton_size: int = Field(..., description="Number of increments in walking skeleton")


class AnalysisResponse(BaseModel):
    """Complete analysis response"""

    executive_summary: ExecutiveSummary
    feature_backbone: Optional[FeatureBackbone] = Field(
        None, description="Only for project analysis"
    )
    features: List[Feature]
    walking_skeleton: WalkingSkeleton
    iteration_paths: Optional[List[Dict[str, Any]]] = Field(
        None, description="Optional iteration paths"
    )
    decision_guide: Optional[Dict[str, Any]] = Field(None, description="Optional decision guide")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata (timestamps, etc.)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "executive_summary": {
                    "project_name": "Task Management Platform",
                    "total_features": 4,
                    "total_steps": 15,
                    "total_increments": 93,
                    "walking_skeleton_size": 4,
                },
                "feature_backbone": {
                    "user_journey": "Users create projects, add tasks, assign them, and track progress",
                    "features_list": [
                        {"name": "User Creates Project", "description": "Users can create a new project workspace"},
                        {"name": "User Adds Task", "description": "Users can add tasks to a project"},
                    ],
                    "flow_narrative": "The journey begins with creating a project...",
                },
                "features": [],
                "walking_skeleton": {
                    "description": "Minimum viable implementation",
                    "selected_increments": [],
                    "rationale": "Selected simplest increments",
                    "dependency_validation": "All dependencies validated",
                },
            }
        }


class ErrorResponse(BaseModel):
    """Error response"""

    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    code: Optional[str] = Field(None, description="Error code")
