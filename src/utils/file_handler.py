"""File handling utilities"""

from typing import Tuple


async def handle_file_upload(file_content: bytes, filename: str) -> Tuple[str, str]:
    """
    Handle uploaded file and extract content

    Args:
        file_content: Raw file bytes
        filename: Original filename

    Returns:
        Tuple of (content_string, file_type)
    """
    # Decode content
    try:
        content = file_content.decode('utf-8')
    except UnicodeDecodeError:
        raise ValueError("File must be UTF-8 encoded text")

    # Determine file type
    file_type = "text"
    if filename.endswith(".md"):
        file_type = "markdown"
    elif filename.endswith(".txt"):
        file_type = "text"
    else:
        raise ValueError("Only .md and .txt files are supported")

    return content, file_type
