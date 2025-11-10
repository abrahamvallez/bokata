"""Base agent class using PocketFlow and Anthropic"""

import os
from typing import Any, Dict, Optional
from anthropic import Anthropic
from pocketflow import Node


class BaseAgent(Node):
    """Base agent class with Anthropic Claude integration"""

    def __init__(
        self,
        name: str,
        system_prompt: str,
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.name = name
        self.system_prompt = system_prompt
        self.model = model or os.getenv("MODEL_NAME", "claude-3-5-sonnet-20241022")
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    def exec(self, shared: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent with the given context"""
        try:
            # Get user message from shared context
            user_message = shared.get("user_message", "")

            if not user_message:
                raise ValueError(f"{self.name}: No user_message provided in shared context")

            # Call Claude API
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=self.system_prompt,
                messages=[
                    {"role": "user", "content": user_message}
                ]
            )

            # Extract response text
            result = response.content[0].text

            # Store result in shared context
            result_key = f"{self.name}_result"
            shared[result_key] = result

            # Log execution
            if shared.get("verbose", False):
                print(f"[{self.name}] Executed successfully")
                print(f"[{self.name}] Result stored in: {result_key}")

            return shared

        except Exception as e:
            error_msg = f"{self.name} execution failed: {str(e)}"
            shared["error"] = error_msg
            if shared.get("verbose", False):
                print(f"[ERROR] {error_msg}")
            raise

    def call_specialist(
        self,
        specialist: "BaseAgent",
        context: Dict[str, Any],
        user_message: str
    ) -> str:
        """Helper method to call another specialist agent"""
        specialist_context = {
            **context,
            "user_message": user_message,
        }
        result = specialist.exec(specialist_context)
        result_key = f"{specialist.name}_result"
        return result.get(result_key, "")


class AsyncBaseAgent(BaseAgent):
    """Async version of BaseAgent for parallel execution"""

    async def exec_async(self, shared: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent asynchronously"""
        try:
            user_message = shared.get("user_message", "")

            if not user_message:
                raise ValueError(f"{self.name}: No user_message provided in shared context")

            # Call Claude API asynchronously
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=self.system_prompt,
                messages=[
                    {"role": "user", "content": user_message}
                ]
            )

            result = response.content[0].text
            result_key = f"{self.name}_result"
            shared[result_key] = result

            if shared.get("verbose", False):
                print(f"[{self.name}] Executed successfully (async)")

            return shared

        except Exception as e:
            error_msg = f"{self.name} execution failed: {str(e)}"
            shared["error"] = error_msg
            if shared.get("verbose", False):
                print(f"[ERROR] {error_msg}")
            raise
