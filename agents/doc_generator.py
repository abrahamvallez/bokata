"""Documentation Generator Agent"""

from .base import Agent
from prompts import DOC_GENERATOR_PROMPT


class DocGeneratorAgent(Agent):
    """Generates final documentation in JSON format"""

    def __init__(self, **kwargs):
        super().__init__(
            name="doc-generator",
            system_prompt=DOC_GENERATOR_PROMPT,
            **kwargs
        )
