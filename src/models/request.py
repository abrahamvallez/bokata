"""Request models for Bokata API"""

from typing import Optional
from pydantic import BaseModel, Field


class AnalyzeProjectRequest(BaseModel):
    """Request to analyze a complete project with multiple features"""

    content: str = Field(
        ...,
        description="Project description (text or markdown)",
        min_length=10,
    )
    include_paths: bool = Field(
        default=False,
        description="Include iteration paths in analysis",
    )
    include_guide: bool = Field(
        default=False,
        description="Include decision guide in analysis",
    )
    full: bool = Field(
        default=False,
        description="Include both paths and guide",
    )
    output_format: str = Field(
        default="json",
        description="Output format: 'json' or 'markdown'",
        pattern="^(json|markdown)$",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "content": """Project: Task Management Platform

Features:
- User Creates Project
- User Adds Task
- User Assigns Task
- User Updates Task Status

Tech Stack: React, Node.js, PostgreSQL
Timeline: 3 months to MVP
""",
                "include_paths": False,
                "include_guide": False,
                "full": False,
                "output_format": "json",
            }
        }


class AnalyzeFeatureRequest(BaseModel):
    """Request to analyze a single feature"""

    content: str = Field(
        ...,
        description="Feature description (text or markdown)",
        min_length=10,
    )
    output_format: str = Field(
        default="json",
        description="Output format: 'json' or 'markdown'",
        pattern="^(json|markdown)$",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "content": """Feature: User Resets Password

Description: Users can reset password via email
Context: SaaS app, security critical
Tech Stack: React, Node.js, PostgreSQL
""",
                "output_format": "json",
            }
        }


class GeneratePathsRequest(BaseModel):
    """Request to generate iteration paths from existing analysis"""

    analysis_content: str = Field(
        ...,
        description="Previous analysis content (JSON or markdown)",
        min_length=10,
    )
    output_format: str = Field(
        default="json",
        description="Output format: 'json' or 'markdown'",
        pattern="^(json|markdown)$",
    )


class GenerateMatrixRequest(BaseModel):
    """Request to generate selection matrix from existing analysis"""

    analysis_content: str = Field(
        ...,
        description="Previous analysis content (JSON or markdown)",
        min_length=10,
    )
    output_format: str = Field(
        default="json",
        description="Output format: 'json' or 'markdown'",
        pattern="^(json|markdown)$",
    )


class FileUploadRequest(BaseModel):
    """Request with uploaded file"""

    file_content: str = Field(
        ...,
        description="Content of uploaded file",
    )
    filename: str = Field(
        ...,
        description="Original filename",
    )
    analysis_type: str = Field(
        default="project",
        description="Type of analysis: 'project' or 'feature'",
        pattern="^(project|feature)$",
    )
    output_format: str = Field(
        default="json",
        description="Output format: 'json' or 'markdown'",
        pattern="^(json|markdown)$",
    )
