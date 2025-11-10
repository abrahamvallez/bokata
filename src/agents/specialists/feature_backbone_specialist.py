"""Feature Backbone Specialist Agent"""

from ..base import BaseAgent
from ...prompts.feature_backbone import FEATURE_BACKBONE_PROMPT


class FeatureBackboneSpecialist(BaseAgent):
    """Identifies and organizes features representing the user journey"""

    def __init__(self, **kwargs):
        super().__init__(
            name="feature-backbone-specialist",
            system_prompt=FEATURE_BACKBONE_PROMPT,
            **kwargs
        )
