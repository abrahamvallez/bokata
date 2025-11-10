"""JSON to Markdown conversion utilities"""

import json
from typing import Dict, Any


def json_to_markdown(data: Dict[str, Any]) -> str:
    """
    Convert analysis JSON to markdown format

    Args:
        data: Analysis result dictionary

    Returns:
        Formatted markdown string
    """
    md_parts = []

    # Executive Summary
    if "executive_summary" in data:
        summary = data["executive_summary"]
        md_parts.append("# Executive Summary\n\n")
        md_parts.append(f"**Project:** {summary.get('project_name', 'N/A')}\n")
        md_parts.append(f"**Features:** {summary.get('total_features', 0)}\n")
        md_parts.append(f"**Steps:** {summary.get('total_steps', 0)}\n")
        md_parts.append(f"**Increments:** {summary.get('total_increments', 0)}\n")
        md_parts.append(f"**Walking Skeleton:** {summary.get('walking_skeleton_size', 0)} increments\n\n")
        md_parts.append("---\n\n")

    # Feature Backbone
    if "feature_backbone" in data and data["feature_backbone"]:
        backbone = data["feature_backbone"]
        md_parts.append("# Feature Backbone Overview\n\n")
        md_parts.append(f"**User Journey:** {backbone.get('user_journey', '')}\n\n")

        md_parts.append("## Features List\n\n")
        for i, feature in enumerate(backbone.get("features_list", []), 1):
            md_parts.append(f"{i}. **{feature.get('name', '')}** - {feature.get('description', '')}\n")

        md_parts.append(f"\n**Flow Narrative:** {backbone.get('flow_narrative', '')}\n\n")
        md_parts.append("---\n\n")

    # Features with Steps and Increments
    md_parts.append("# Feature Breakdown - Complete Analysis\n\n")
    for feature in data.get("features", []):
        md_parts.append(f"## Feature: {feature.get('name', '')}\n\n")
        md_parts.append(f"*{feature.get('description', '')}*\n\n")

        for step in feature.get("steps", []):
            md_parts.append(f"### Step {step.get('id', '')}: {step.get('name', '')}\n\n")
            md_parts.append(f"**Description:** {step.get('description', '')}\n\n")

            # Increments table
            md_parts.append("| # | Increment | Depends | Strategy | Notes |\n")
            md_parts.append("|---|-----------|---------|----------|-------|\n")

            for inc in step.get("increments", []):
                star = "⭐ " if inc.get("is_simplest", False) else ""
                notes = inc.get('description', '')[:50] + "..." if len(inc.get('description', '')) > 50 else inc.get('description', '')
                md_parts.append(
                    f"| {inc.get('id', '')} | {star}{inc.get('name', '')} | "
                    f"{inc.get('requires', '')} | {inc.get('strategy', '')} | "
                    f"{notes} |\n"
                )

            md_parts.append("\n")

        md_parts.append("---\n\n")

    # Walking Skeleton
    if "walking_skeleton" in data:
        ws = data["walking_skeleton"]
        md_parts.append("# Walking Skeleton\n\n")
        md_parts.append(f"**Description:** {ws.get('description', '')}\n\n")

        md_parts.append("## Selected Increments\n\n")
        md_parts.append("| Feature | Step | Increment | Requires | Provides |\n")
        md_parts.append("|---------|------|-----------|----------|----------|\n")

        for inc in ws.get("selected_increments", []):
            md_parts.append(
                f"| {inc.get('feature', '')} | {inc.get('step', '')} | "
                f"{inc.get('increment', '')} | {inc.get('requires', '')} | "
                f"{inc.get('provides', '')} |\n"
            )

        md_parts.append(f"\n**Rationale:** {ws.get('rationale', '')}\n\n")
        md_parts.append(f"**Dependency Validation:** {ws.get('dependency_validation', '')}\n\n")

    return "".join(md_parts)
