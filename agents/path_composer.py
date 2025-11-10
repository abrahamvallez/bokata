"""Path Composer Agent"""

from .base import Agent
from prompts import PATH_COMPOSER_PROMPT


class PathComposerAgent(Agent):
    """Composes Walking Skeleton from simplest increments"""

    def __init__(self, **kwargs):
        super().__init__(
            name="path-composer",
            system_prompt=PATH_COMPOSER_PROMPT,
            **kwargs
        )
