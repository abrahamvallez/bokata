"""Agent prompts - exact copies from bokata-slicer-cc"""

from .feature_backbone import FEATURE_BACKBONE_PROMPT
from .step_analyzer import STEP_ANALYZER_PROMPT
from .increment_generator import INCREMENT_GENERATOR_PROMPT
from .path_composer import PATH_COMPOSER_PROMPT
from .doc_generator import DOC_GENERATOR_PROMPT

__all__ = [
    "FEATURE_BACKBONE_PROMPT",
    "STEP_ANALYZER_PROMPT",
    "INCREMENT_GENERATOR_PROMPT",
    "PATH_COMPOSER_PROMPT",
    "DOC_GENERATOR_PROMPT",
]
