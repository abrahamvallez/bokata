"""Analysis endpoints"""

import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from fastapi.responses import PlainTextResponse

from ...models.request import (
    AnalyzeProjectRequest,
    AnalyzeFeatureRequest,
    GeneratePathsRequest,
    GenerateMatrixRequest,
)
from ...models.response import AnalysisResponse, ErrorResponse
from ...orchestrator.workflow import ProjectAnalysisWorkflow, FeatureAnalysisWorkflow
from ...utils.markdown import json_to_markdown

router = APIRouter(prefix="/api", tags=["Analysis"])


@router.post("/analyze/project")
async def analyze_project(request: AnalyzeProjectRequest):
    """
    Analyze a complete project with multiple features

    This endpoint orchestrates the complete analysis workflow:
    1. Feature Backbone Specialist - Identifies features
    2. Step Analyzer Specialist - Decomposes features into steps
    3. Increment Generator Specialist - Generates increments per step
    4. Path Composer Specialist - Creates Walking Skeleton
    5. Doc Generator - Produces final document

    Returns JSON or Markdown based on output_format parameter.
    """
    try:
        # Create workflow
        workflow = ProjectAnalysisWorkflow(verbose=True)

        # Run analysis
        result = workflow.run(request.content)

        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])

        # Parse final document (should be JSON string from doc generator)
        try:
            final_doc = json.loads(result["final_document"])
        except json.JSONDecodeError:
            # If not valid JSON, return as-is wrapped in error structure
            raise HTTPException(
                status_code=500,
                detail="Doc generator did not return valid JSON"
            )

        # Return based on requested format
        if request.output_format == "markdown":
            markdown = json_to_markdown(final_doc)
            return Response(content=markdown, media_type="text/markdown")
        else:
            return final_doc

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze/feature")
async def analyze_feature(request: AnalyzeFeatureRequest):
    """
    Analyze a single feature

    This endpoint orchestrates the feature analysis workflow:
    1. Step Analyzer Specialist - Decomposes feature into steps
    2. Increment Generator Specialist - Generates increments per step
    3. Path Composer Specialist - Creates Walking Skeleton
    4. Doc Generator - Produces final document

    Returns JSON or Markdown based on output_format parameter.
    """
    try:
        # Create workflow
        workflow = FeatureAnalysisWorkflow(verbose=True)

        # Run analysis
        result = workflow.run(request.content)

        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])

        # Parse final document
        try:
            final_doc = json.loads(result["final_document"])
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Doc generator did not return valid JSON"
            )

        # Return based on requested format
        if request.output_format == "markdown":
            markdown = json_to_markdown(final_doc)
            return Response(content=markdown, media_type="text/markdown")
        else:
            return final_doc

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze/upload")
async def analyze_upload(
    file: UploadFile = File(...),
    analysis_type: str = "project",
    output_format: str = "json"
):
    """
    Analyze from uploaded file (.md or .txt)

    Args:
        file: Uploaded markdown or text file
        analysis_type: 'project' or 'feature'
        output_format: 'json' or 'markdown'

    Returns:
        Analysis result in requested format
    """
    try:
        # Validate file type
        if not file.filename.endswith((".md", ".txt")):
            raise HTTPException(
                status_code=400,
                detail="Only .md and .txt files are supported"
            )

        # Read file content
        content = await file.read()
        content_str = content.decode("utf-8")

        # Create appropriate request
        if analysis_type == "project":
            request = AnalyzeProjectRequest(
                content=content_str,
                output_format=output_format
            )
            return await analyze_project(request)
        else:
            request = AnalyzeFeatureRequest(
                content=content_str,
                output_format=output_format
            )
            return await analyze_feature(request)

    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/generate/paths")
async def generate_paths(request: GeneratePathsRequest):
    """
    Generate iteration paths from existing analysis

    This endpoint takes a previous analysis and generates 3-5 strategic iteration paths.

    Note: This is a placeholder for future implementation.
    """
    raise HTTPException(
        status_code=501,
        detail="Iteration paths generation not yet implemented"
    )


@router.post("/generate/matrix")
async def generate_matrix(request: GenerateMatrixRequest):
    """
    Generate selection matrix from existing analysis

    This endpoint creates a complete matrix of increments with dependencies.

    Note: This is a placeholder for future implementation.
    """
    raise HTTPException(
        status_code=501,
        detail="Selection matrix generation not yet implemented"
    )
