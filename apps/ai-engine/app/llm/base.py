from abc import ABC, abstractmethod
from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel


class TaskType(str, Enum):
    EXTRACTION = "EXTRACTION"
    RESEARCH = "RESEARCH"
    VERIFICATION = "VERIFICATION"
    REASONING = "REASONING"


class ModelResponse(BaseModel):
    content: str
    model: str
    provider: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    raw_response: Optional[Dict[str, Any]] = None


class BaseLLMClient(ABC):
    """
    Abstract Base Class for all LLM Provider Clients in LegalLens AI.
    Enables vendor-agnostic routing across Google Gemini, OpenAI, Anthropic, and local models.
    """
    
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 2048,
    ) -> ModelResponse:
        """Generate text completion from the underlying foundation model."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Returns the provider name (e.g., 'google', 'openai', 'mock')."""
        pass
