"""Utility for calling Claude LLM via Anthropic API"""

import os
from anthropic import Anthropic


# Initialize Anthropic client
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def call_claude(
    system_prompt: str,
    user_message: str,
    model: str = None,
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> str:
    """
    Call Claude API with system prompt and user message

    Args:
        system_prompt: System instructions for Claude
        user_message: User's input message
        model: Model to use (defaults to env MODEL_NAME or claude-3-5-sonnet)
        temperature: Sampling temperature (0-1)
        max_tokens: Maximum tokens in response

    Returns:
        Claude's response as string
    """
    if model is None:
        model = os.environ.get("MODEL_NAME", "claude-3-5-sonnet-20241022")

    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )

    return response.content[0].text


async def call_claude_async(
    system_prompt: str,
    user_message: str,
    model: str = None,
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> str:
    """
    Async version of call_claude

    Args:
        Same as call_claude

    Returns:
        Claude's response as string
    """
    if model is None:
        model = os.environ.get("MODEL_NAME", "claude-3-5-sonnet-20241022")

    # Note: Anthropic Python SDK doesn't have async yet, but we wrap it for future compatibility
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )

    return response.content[0].text


if __name__ == "__main__":
    # Test the LLM call
    response = call_claude(
        system_prompt="You are a helpful assistant.",
        user_message="Say hello!",
    )
    print(response)
