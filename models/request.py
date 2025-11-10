"""Request models"""

from pydantic import BaseModel, Field


class AnalyzeProjectRequest(BaseModel):
    """Request to analyze a complete project with multiple features"""

    content: str = Field(..., description="Project description", min_length=10)
    output_format: str = Field(default="json", pattern="^(json|markdown)$")

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Project: Task Manager\n\nFeatures:\n- User Creates Task\n- User Views Tasks",
                "output_format": "json"
            }
        }


class AnalyzeFeatureRequest(BaseModel):
    """Request to analyze a single feature"""

    content: str = Field(..., description="Feature description", min_length=10)
    output_format: str = Field(default="json", pattern="^(json|markdown)$")

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Feature: User Login\n\nUsers can log in with email/password",
                "output_format": "json"
            }
        }
