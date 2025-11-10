"""Base agent class using PocketFlow and Anthropic"""

from typing import Any, Dict
from pocketflow import Node
from utils.call_llm import call_claude


class Agent(Node):
    """Base agent class with Claude integration"""

    def __init__(self, name: str, system_prompt: str, **kwargs):
        super().__init__(**kwargs)
        self.name = name
        self.system_prompt = system_prompt

    def exec(self, shared: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent with the given context"""
        try:
            # Get user message from shared context
            user_message = shared.get("user_message", "")

            if not user_message:
                raise ValueError(f"{self.name}: No user_message in shared context")

            # Call Claude
            result = call_claude(
                system_prompt=self.system_prompt,
                user_message=user_message,
            )

            # Store result
            result_key = f"{self.name}_result"
            shared[result_key] = result

            # Prepare for next agent (pass result as user_message)
            shared["user_message"] = result

            if shared.get("verbose", False):
                print(f"[{self.name}] ✓ Executed")

            return shared

        except Exception as e:
            error_msg = f"{self.name} failed: {str(e)}"
            shared["error"] = error_msg
            if shared.get("verbose", False):
                print(f"[ERROR] {error_msg}")
            raise
