"""Increment Generator Agent"""

from .base import Agent
from prompts import INCREMENT_GENERATOR_PROMPT


class IncrementGeneratorAgent(Agent):
    """Generates 5-10 increments per step using breakdown strategies"""

    def __init__(self, **kwargs):
        super().__init__(
            name="increment-generator",
            system_prompt=INCREMENT_GENERATOR_PROMPT,
            **kwargs
        )
