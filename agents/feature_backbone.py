"""Feature Backbone Agent"""

from .base import Agent
from prompts import FEATURE_BACKBONE_PROMPT


class FeatureBackboneAgent(Agent):
    """Identifies and organizes features representing the user journey"""

    def __init__(self, **kwargs):
        super().__init__(
            name="feature-backbone",
            system_prompt=FEATURE_BACKBONE_PROMPT,
            **kwargs
        )
