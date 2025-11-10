"""Step Analyzer Agent"""

from .base import Agent
from prompts import STEP_ANALYZER_PROMPT


class StepAnalyzerAgent(Agent):
    """Decomposes features into technical/business/logical steps"""

    def __init__(self, **kwargs):
        super().__init__(
            name="step-analyzer",
            system_prompt=STEP_ANALYZER_PROMPT,
            **kwargs
        )
