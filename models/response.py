"""Response models"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Increment(BaseModel):
    """Individual increment within a step"""
    id: str
    name: str
    description: str
    is_simplest: bool = False
    requires: str
    provides: str
    compatible_with: str
    strategy: str
    notes: Optional[str] = None


class Step(BaseModel):
    """Step within a feature"""
    id: str
    name: str
    description: str
    quality_attributes: Dict[str, Any]
    increments: List[Increment]


class Feature(BaseModel):
    """Feature with steps and increments"""
    name: str
    description: str
    steps: List[Step]
    total_increments: int


class FeatureBackbone(BaseModel):
    """Feature backbone overview"""
    user_journey: str
    features_list: List[Dict[str, str]]
    flow_narrative: str
    dependencies: Optional[str] = None


class WalkingSkeleton(BaseModel):
    """Walking Skeleton composition"""
    description: str
    selected_increments: List[Dict[str, Any]]
    rationale: str
    dependency_validation: str


class ExecutiveSummary(BaseModel):
    """Executive summary of the analysis"""
    project_name: str
    total_features: int
    total_steps: int
    total_increments: int
    walking_skeleton_size: int


class AnalysisResponse(BaseModel):
    """Complete analysis response"""
    executive_summary: ExecutiveSummary
    feature_backbone: Optional[FeatureBackbone] = None
    features: List[Feature]
    walking_skeleton: WalkingSkeleton
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
