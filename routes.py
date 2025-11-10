"""API routes"""

import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from models import AnalyzeProjectRequest, AnalyzeFeatureRequest
from flow import ProjectAnalysisFlow, FeatureAnalysisFlow
from utils import json_to_markdown

router = APIRouter()


@router.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Bokata API - FastAPI + PocketFlow",
        "version": "1.0.0",
        "status": "running"
    }


@router.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}


@router.post("/api/analyze/project")
async def analyze_project(request: AnalyzeProjectRequest):
    """
    Analyze a complete project with multiple features

    Workflow:
    1. Feature Backbone → Identifies features
    2. Step Analyzer → Decomposes into steps
    3. Increment Generator → Generates increments
    4. Path Composer → Creates Walking Skeleton
    5. Doc Generator → Produces final document
    """
    try:
        # Create and run workflow
        flow = ProjectAnalysisFlow(verbose=True)
        result = flow.run(request.content)

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

        # Return based on format
        if request.output_format == "markdown":
            markdown = json_to_markdown(final_doc)
            return Response(content=markdown, media_type="text/markdown")
        else:
            return final_doc

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/api/analyze/feature")
async def analyze_feature(request: AnalyzeFeatureRequest):
    """
    Analyze a single feature

    Workflow:
    1. Step Analyzer → Decomposes into steps
    2. Increment Generator → Generates increments
    3. Path Composer → Creates Walking Skeleton
    4. Doc Generator → Produces final document
    """
    try:
        # Create and run workflow
        flow = FeatureAnalysisFlow(verbose=True)
        result = flow.run(request.content)

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

        # Return based on format
        if request.output_format == "markdown":
            markdown = json_to_markdown(final_doc)
            return Response(content=markdown, media_type="text/markdown")
        else:
            return final_doc

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/api/analyze/upload")
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

        # Create appropriate request and analyze
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
